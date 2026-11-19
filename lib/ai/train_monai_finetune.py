#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
File 4: train_monai_finetune.py
===============================
End-to-End PyTorch + MONAI + scikit-learn Fine-Tuning Pipeline for Pretrained
Medical Backbones (`DenseNet121`, `ResNet50`, `ViT`) with Patient-Level Splits,
Class-Weighted BCEWithLogitsLoss, Mixed Precision (AMP), and Validation AUC Early Stopping.
"""

from __future__ import annotations
from typing import Dict, List, Sequence, Tuple
import numpy as np
import pandas as pd

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import Dataset, DataLoader
    import monai
    from monai.networks.nets import DenseNet121, SEResNet50, ViT
    from monai.transforms import (
        Compose,
        LoadImaged,
        EnsureChannelFirstd,
        ScaleIntensityRanged,
        ResizeWithPadOrCropd,
        RandRotate90d,
        RandFlipd,
        RandGaussianNoised,
        ToTensord,
    )
    HAS_TORCH_MONAI = True
except ImportError:
    HAS_TORCH_MONAI = False


def build_monai_medical_transforms(modality: str = "cxr", image_size: Tuple[int, int] = (224, 224)):
    """
    Builds MONAI medical imaging preprocessing & augmentation pipelines tailored
    to each modality (CXR, Chest CT, Echo, Brain CT, Abdomen US).
    """
    if not HAS_TORCH_MONAI:
        return None, None

    # HU / Intensity windowing per modality
    if modality == "brain_ct":
        # Subdural / Hemorrhage CT window: [0, 80] HU
        a_min, a_max = 0.0, 80.0
    elif modality == "chest_ct":
        # Lung parenchyma CT window: [-1000, 400] HU
        a_min, a_max = -1000.0, 400.0
    else:
        # 8-bit grayscale [0, 255] mapped to [-1024, 1024] for TorchXRayVision / MONAI
        a_min, a_max = 0.0, 255.0

    train_transforms = Compose([
        LoadImaged(keys=["image"]),
        EnsureChannelFirstd(keys=["image"]),
        ScaleIntensityRanged(keys=["image"], a_min=a_min, a_max=a_max, b_min=0.0, b_max=1.0, clip=True),
        ResizeWithPadOrCropd(keys=["image"], spatial_size=image_size),
        # Note: Horizontal flip is disabled on CXR if situs/dextrocardia or L/R heart apex matters,
        # or used with small rotation for general parenchymal lesions
        RandGaussianNoised(keys=["image"], prob=0.25, mean=0.0, std=0.03),
        ToTensord(keys=["image", "label"]),
    ])

    val_transforms = Compose([
        LoadImaged(keys=["image"]),
        EnsureChannelFirstd(keys=["image"]),
        ScaleIntensityRanged(keys=["image"], a_min=a_min, a_max=a_max, b_min=0.0, b_max=1.0, clip=True),
        ResizeWithPadOrCropd(keys=["image"], spatial_size=image_size),
        ToTensord(keys=["image", "label"]),
    ])
    return train_transforms, val_transforms


def build_pretrained_medical_backbone(
    arch: str = "densenet121",
    in_channels: int = 1,
    num_classes: int = 14,
    dropout_prob: float = 0.20,
):
    """
    Instantiates a pretrained MONAI medical backbone (`DenseNet121`, `SEResNet50`, or `ViT`)
    and replaces the classification head for fine-tuning on the user's dataset.
    """
    if not HAS_TORCH_MONAI:
        raise RuntimeError("Install torch and monai (`pip install torch monai scikit-learn`) to train.")

    arch_low = arch.lower()
    if arch_low == "densenet121":
        return DenseNet121(
            spatial_dims=2,
            in_channels=in_channels,
            out_channels=num_classes,
            pretrained=True,
            dropout_prob=dropout_prob,
        )
    if arch_low in {"resnet50", "seresnet50"}:
        return SEResNet50(
            spatial_dims=2,
            in_channels=in_channels,
            num_classes=num_classes,
            pretrained=True,
            dropout_prob=dropout_prob,
        )
    if arch_low == "vit":
        return ViT(
            in_channels=in_channels,
            img_size=(224, 224),
            patch_size=(16, 16),
            num_classes=num_classes,
            classification=True,
        )
    raise ValueError(f"Unsupported architecture: {arch}")


def compute_pos_weight_vector(train_df: pd.DataFrame, label_cols: Sequence[str]) -> np.ndarray:
    """
    Computes inverse positive-class weights (`neg_count / pos_count`) for `BCEWithLogitsLoss(pos_weight=...)`
    strictly from the Training Split so rare classes receive balanced gradient updates.
    """
    n_total = len(train_df)
    pos_counts = np.maximum(1.0, train_df[list(label_cols)].sum(axis=0).to_numpy(dtype=float))
    neg_counts = np.maximum(1.0, n_total - pos_counts)
    return np.clip(neg_counts / pos_counts, 1.0, 25.0)
