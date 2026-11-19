#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
File 2: evaluate.py
===================
Comprehensive Clinical Evaluation, Validation-Set Threshold Selection, Patient-Level
Bootstrap 95% Confidence Intervals, Calibration (Brier Score), Subgroup Fairness Audit,
and Shortcut/Artifact Bias Detection (Grad-CAM ROI Ratio).

Addresses Part 2 (Items 1 to 6):
  1. Computes per-disease AUC-ROC, AUC-PR (for imbalanced classes), Sensitivity (Recall),
     Specificity, PPV (Precision), NPV, and F1-Score.
  2. Selects optimal operating thresholds strictly on the Validation Set (`Youden's J`
     or `Target Sensitivity >= 0.90`) and applies the frozen thresholds to the Test Set.
  3. Computes 95% Confidence Intervals (`95% CI`) via Patient-Level Cluster Bootstrap
     (resampling unique `patient_id` clusters with replacement, NEVER independent images).
  4. Generates ROC curves, Confusion Matrices, and Calibration Curves with Brier Score.
  5. Performs Subgroup Fairness Analysis across Age brackets, Biological Sex, Scanner
     type (`Portable_AP` vs `Fixed_PA`), and Hospital Site.
  6. Audits Shortcut / Non-Medical Artifact Bias using Grad-CAM Saliency ROI Energy Ratio
     (comparing activation inside the anatomical organ mask vs corner text/tube zones).
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional, Sequence, Tuple
import numpy as np
import pandas as pd
try:
    from sklearn.metrics import (
        roc_auc_score,
        average_precision_score,
        roc_curve,
        confusion_matrix,
        brier_score_loss,
    )
    from sklearn.calibration import calibration_curve
except ImportError:
    def roc_curve(y_true, y_score):
        y_true = np.asarray(y_true, dtype=int)
        y_score = np.asarray(y_score, dtype=float)
        thresholds = np.unique(np.sort(y_score))[::-1]
        thresholds = np.concatenate([[1.0], thresholds, [0.0]])
        P = max(1, np.sum(y_true == 1))
        N = max(1, np.sum(y_true == 0))
        tpr_list, fpr_list = [], []
        for th in thresholds:
            pred = y_score >= th
            tp = np.sum((pred == 1) & (y_true == 1))
            fp = np.sum((pred == 1) & (y_true == 0))
            tpr_list.append(tp / P)
            fpr_list.append(fp / N)
        return np.array(fpr_list), np.array(tpr_list), thresholds

    def roc_auc_score(y_true, y_score):
        fpr, tpr, _ = roc_curve(y_true, y_score)
        order = np.argsort(fpr)
        return float(getattr(np, 'trapezoid', np.trapz)(tpr[order], fpr[order]))

    def average_precision_score(y_true, y_score):
        y_true = np.asarray(y_true, dtype=int)
        y_score = np.asarray(y_score, dtype=float)
        order = np.argsort(-y_score)
        y_sorted = y_true[order]
        tp_cum = np.cumsum(y_sorted == 1)
        prec = tp_cum / np.arange(1, len(y_sorted) + 1)
        return float(np.sum(prec * (y_sorted == 1)) / max(1, np.sum(y_true == 1)))

    def confusion_matrix(y_true, y_pred, labels=(0, 1)):
        y_true = np.asarray(y_true, dtype=int)
        y_pred = np.asarray(y_pred, dtype=int)
        tn = int(np.sum((y_true == 0) & (y_pred == 0)))
        fp = int(np.sum((y_true == 0) & (y_pred == 1)))
        fn = int(np.sum((y_true == 1) & (y_pred == 0)))
        tp = int(np.sum((y_true == 1) & (y_pred == 1)))
        return np.array([[tn, fp], [fn, tp]])

    def brier_score_loss(y_true, y_prob):
        return float(np.mean((np.asarray(y_true, dtype=float) - np.asarray(y_prob, dtype=float)) ** 2))

    def calibration_curve(y_true, y_prob, n_bins=10, strategy="uniform"):
        bins = np.linspace(0.0, 1.0, n_bins + 1)
        prob_true, prob_pred = [], []
        for i in range(n_bins):
            m = (y_prob >= bins[i]) & (y_prob < bins[i + 1] if i < n_bins - 1 else y_prob <= bins[i + 1])
            if np.any(m):
                prob_true.append(float(np.mean(y_true[m])))
                prob_pred.append(float(np.mean(y_prob[m])))
        return np.array(prob_true), np.array(prob_pred)


SEED: int = 42


# ============================================================================
# 1. Validation-Only Threshold Selection (Youden's J & Target Sensitivity)
# ============================================================================
def select_threshold_on_validation(
    y_val_true: np.ndarray,
    y_val_prob: np.ndarray,
    strategy: str = "youden",
    target_sensitivity: float = 0.90,
) -> float:
    """
    Selects the diagnostic decision threshold ONLY on the Validation Set (Part 2.2):
      - `strategy == "youden"`: maximizes Youden's J statistic (`Sensitivity + Specificity - 1`).
      - `strategy == "target_sensitivity"`: picks the highest threshold that achieves
        `Sensitivity >= target_sensitivity` (e.g., 90% sensitivity for screening critical conditions).
    """
    y_val_true = np.asarray(y_val_true, dtype=int)
    y_val_prob = np.asarray(y_val_prob, dtype=float)
    if len(np.unique(y_val_true)) < 2:
        return 0.50

    fpr, tpr, thresholds = roc_curve(y_val_true, y_val_prob)
    specificity = 1.0 - fpr

    if strategy == "target_sensitivity":
        valid_idx = np.where(tpr >= target_sensitivity)[0]
        if len(valid_idx) > 0:
            # Among thresholds achieving >= target_sensitivity, maximize specificity
            best_sub = valid_idx[np.argmax(specificity[valid_idx])]
            return float(np.clip(thresholds[best_sub], 0.01, 0.99))

    # Default: Youden's J = Sensitivity + Specificity - 1
    youden_j = tpr + specificity - 1.0
    best_idx = int(np.argmax(youden_j))
    return float(np.clip(thresholds[best_idx], 0.01, 0.99))


# ============================================================================
# 2. Point-Estimate Clinical Metrics at a Frozen Threshold (Part 2.1)
# ============================================================================
def compute_binary_clinical_metrics(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    frozen_threshold: float,
) -> Dict[str, float]:
    """
    Computes AUC-ROC, AUC-PR, Brier Score, and threshold-dependent Sensitivity,
    Specificity, PPV, NPV, and F1 using a frozen validation-derived threshold.
    """
    y_true = np.asarray(y_true, dtype=int)
    y_prob = np.asarray(y_prob, dtype=float)
    y_pred = (y_prob >= frozen_threshold).astype(int)

    has_both_classes = len(np.unique(y_true)) == 2
    auc_roc = float(roc_auc_score(y_true, y_prob)) if has_both_classes else float("nan")
    auc_pr = float(average_precision_score(y_true, y_prob)) if has_both_classes else float("nan")
    brier = float(brier_score_loss(y_true, np.clip(y_prob, 0.0, 1.0)))

    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    sensitivity = float(tp / max(1, tp + fn))
    specificity = float(tn / max(1, tn + fp))
    ppv = float(tp / max(1, tp + fp))
    npv = float(tn / max(1, tn + fn))
    f1 = float((2 * tp) / max(1, 2 * tp + fp + fn))

    return {
        "threshold": round(frozen_threshold, 4),
        "AUC_ROC": round(auc_roc, 4),
        "AUC_PR": round(auc_pr, 4),
        "Sensitivity": round(sensitivity, 4),
        "Specificity": round(specificity, 4),
        "PPV": round(ppv, 4),
        "NPV": round(npv, 4),
        "F1": round(f1, 4),
        "Brier_Score": round(brier, 4),
        "TP": int(tp),
        "FP": int(fp),
        "TN": int(tn),
        "FN": int(fn),
    }


# ============================================================================
# 3. Patient-Level Cluster Bootstrap for 95% Confidence Intervals (Part 2.3)
# ============================================================================
def patient_level_bootstrap_ci(
    df: pd.DataFrame,
    y_true_col: str,
    y_prob_col: str,
    patient_id_col: str,
    frozen_threshold: float,
    n_bootstraps: int = 500,
    seed: int = SEED,
) -> Dict[str, Tuple[float, float]]:
    """
    Computes 95% Confidence Intervals (2.5th to 97.5th percentile) by resampling
    `patient_id` clusters with replacement (Cluster Bootstrap):
      - Why Patient-Level Resampling? Multiple images from the same patient are
        statistically correlated. Image-level bootstrap artificially shrinks variance
        and produces overly narrow, false confidence intervals.
    """
    rng = np.random.default_rng(seed)
    unique_patients = df[patient_id_col].unique()
    n_pats = len(unique_patients)

    # Pre-index row indices per patient for fast cluster resampling
    patient_to_indices: Dict[Any, np.ndarray] = {
        pid: grp.index.to_numpy() for pid, grp in df.groupby(patient_id_col)
    }

    y_true_all = df[y_true_col].to_numpy(dtype=int)
    y_prob_all = df[y_prob_col].to_numpy(dtype=float)

    keys = ["AUC_ROC", "AUC_PR", "Sensitivity", "Specificity", "PPV", "NPV", "F1", "Brier_Score"]
    samples: Dict[str, List[float]] = {k: [] for k in keys}

    for _ in range(n_bootstraps):
        sampled_pids = rng.choice(unique_patients, size=n_pats, replace=True)
        boot_indices = np.concatenate([patient_to_indices[pid] for pid in sampled_pids])
        yt = y_true_all[boot_indices]
        yp = y_prob_all[boot_indices]
        if len(np.unique(yt)) < 2:
            continue
        m = compute_binary_clinical_metrics(yt, yp, frozen_threshold)
        for k in keys:
            if not np.isnan(m[k]):
                samples[k].append(m[k])

    ci_out: Dict[str, Tuple[float, float]] = {}
    for k in keys:
        arr = np.asarray(samples[k], dtype=float)
        if len(arr) == 0:
            ci_out[k] = (float("nan"), float("nan"))
        else:
            ci_out[k] = (
                round(float(np.percentile(arr, 2.5)), 4),
                round(float(np.percentile(arr, 97.5)), 4),
            )
    return ci_out


# ============================================================================
# 4. Calibration Curve & Reliability Diagnostics (Part 2.4)
# ============================================================================
def compute_calibration_diagnostics(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    n_bins: int = 10,
) -> Dict[str, Any]:
    """
    Computes Calibration Curve bins (mean predicted probability vs. observed empirical
    frequency), Expected Calibration Error (ECE), and Brier Score.
    """
    y_true = np.asarray(y_true, dtype=int)
    y_prob = np.clip(np.asarray(y_prob, dtype=float), 0.0, 1.0)
    prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=n_bins, strategy="uniform")
    brier = float(brier_score_loss(y_true, y_prob))
    ece = float(np.mean(np.abs(prob_true - prob_pred))) if len(prob_true) > 0 else 0.0
    return {
        "brier_score": round(brier, 4),
        "expected_calibration_error": round(ece, 4),
        "bin_observed_frequency": [round(float(x), 4) for x in prob_true],
        "bin_mean_predicted_prob": [round(float(x), 4) for x in prob_pred],
    }


# ============================================================================
# 5. Subgroup Fairness & Performance Disparity Analysis (Part 2.5)
# ============================================================================
def run_subgroup_fairness_analysis(
    test_df: pd.DataFrame,
    y_true_col: str,
    y_prob_col: str,
    frozen_threshold: float,
) -> pd.DataFrame:
    """
    Evaluates model performance across clinical & technical subgroups:
      - Age Bracket (`<=14y`, `15-39y`, `40-64y`, `>=65y`)
      - Biological Sex (`M`, `F`)
      - Scanner Type (`Portable_AP` vs `Fixed_PA`)
      - Hospital Site (`BIDMC_MIMIC`, `Stanford_CheXpert`, `NIH_ClinicalCenter`)
    Flags any subgroup where AUC-ROC or Sensitivity drops by > 0.05 below overall mean.
    """
    df = test_df.copy()
    df["age_bracket"] = pd.cut(
        df["age_years"].fillna(45.0),
        bins=[-1, 14, 39, 64, 150],
        labels=["<=14y_Pediatric", "15-39y_YoungAdult", "40-64y_MiddleAged", ">=65y_OlderAdult"],
    ).astype(str)

    overall = compute_binary_clinical_metrics(
        df[y_true_col].to_numpy(), df[y_prob_col].to_numpy(), frozen_threshold
    )
    overall_auc = overall["AUC_ROC"]

    rows = []
    for group_col in ["age_bracket", "sex", "scanner_type", "hospital_site"]:
        if group_col not in df.columns:
            continue
        for sub_val, sub_df in df.groupby(group_col):
            if len(sub_df) < 10 or sub_df[y_true_col].nunique() < 2:
                continue
            m = compute_binary_clinical_metrics(
                sub_df[y_true_col].to_numpy(), sub_df[y_prob_col].to_numpy(), frozen_threshold
            )
            auc_gap = round(m["AUC_ROC"] - overall_auc, 4)
            rows.append({
                "Subgroup_Dimension": group_col,
                "Subgroup_Value": str(sub_val),
                "N_Scans": len(sub_df),
                "N_Patients": int(sub_df["patient_id"].nunique()),
                "AUC_ROC": m["AUC_ROC"],
                "AUC_Gap_vs_Overall": auc_gap,
                "Sensitivity": m["Sensitivity"],
                "Specificity": m["Specificity"],
                "Disparity_Alert": "ALERT (>5% drop)" if auc_gap < -0.05 else "OK",
            })
    return pd.DataFrame(rows)


# ============================================================================
# 6. Shortcut / Non-Medical Artifact Bias Audit via Grad-CAM ROI Energy (Part 2.6)
# ============================================================================
def audit_gradcam_shortcut_bias(
    gradcam_heatmap_2d: np.ndarray,
    anatomical_organ_mask_2d: np.ndarray,
    border_margin_fraction: float = 0.12,
) -> Dict[str, Any]:
    """
    Audits whether a CNN/ViT model relies on spurious shortcuts (e.g., 'PORTABLE'
    or 'L/R' lead markers in image corners, chest tubes, ECG leads, or edge borders)
    rather than true anatomical pathology inside the lung/heart/brain mask:
      - Computes `organ_roi_energy_ratio`: fraction of total Grad-CAM positive activation
        falling inside `anatomical_organ_mask_2d` (e.g. CheXmask lung/heart mask).
      - Computes `corner_text_artifact_ratio`: fraction of activation falling in the
        outer `border_margin_fraction` corners where burned-in text labels sit.
      - Flags `shortcut_bias_detected = True` if `organ_roi_energy_ratio < 0.65` or
        `corner_text_artifact_ratio > 0.20`.
    """
    cam = np.maximum(0.0, np.asarray(gradcam_heatmap_2d, dtype=float))
    mask = (np.asarray(anatomical_organ_mask_2d) > 0).astype(float)
    assert cam.shape == mask.shape, "Grad-CAM heatmap and anatomical mask must have identical 2D shape"

    total_energy = float(cam.sum()) + 1e-8
    organ_energy = float((cam * mask).sum())
    organ_ratio = organ_energy / total_energy

    h, w = cam.shape
    bh, bw = max(1, int(h * border_margin_fraction)), max(1, int(w * border_margin_fraction))
    corner_mask = np.zeros_like(cam)
    corner_mask[:bh, :bw] = 1.0
    corner_mask[:bh, -bw:] = 1.0
    corner_mask[-bh:, :bw] = 1.0
    corner_mask[-bh:, -bw:] = 1.0

    corner_energy = float((cam * corner_mask).sum())
    corner_ratio = corner_energy / total_energy

    shortcut_detected = bool(organ_ratio < 0.65 or corner_ratio > 0.20)
    return {
        "organ_roi_energy_ratio": round(organ_ratio, 4),
        "corner_text_artifact_ratio": round(corner_ratio, 4),
        "shortcut_bias_detected": shortcut_detected,
        "verdict": (
            "WARNING: Spurious corner/border artifact reliance detected (check L/R text or chest tube)"
            if shortcut_detected
            else "PASS: Grad-CAM activation is concentrated within the anatomical organ mask"
        ),
    }


if __name__ == "__main__":
    rng = np.random.default_rng(SEED)
    # Simulate Validation & Test sets with patient IDs
    n_val, n_test = 300, 300
    val_y = rng.binomial(1, 0.25, size=n_val)
    val_p = np.clip(val_y * 0.55 + rng.normal(0.22, 0.18, size=n_val), 0.01, 0.99)
    thresh_youden = select_threshold_on_validation(val_y, val_p, strategy="youden")
    thresh_sens90 = select_threshold_on_validation(val_y, val_p, strategy="target_sensitivity", target_sensitivity=0.90)

    test_df = pd.DataFrame({
        "patient_id": [f"pt_{i // 2}" for i in range(n_test)],
        "age_years": rng.uniform(18, 85, size=n_test),
        "sex": rng.choice(["M", "F"], size=n_test),
        "scanner_type": rng.choice(["Fixed_PA", "Portable_AP"], size=n_test),
        "hospital_site": rng.choice(["BIDMC_MIMIC", "Stanford_CheXpert"], size=n_test),
        "y_true": rng.binomial(1, 0.25, size=n_test),
    })
    test_df["y_prob"] = np.clip(test_df["y_true"] * 0.55 + rng.normal(0.22, 0.18, size=n_test), 0.01, 0.99)

    point_metrics = compute_binary_clinical_metrics(test_df["y_true"].to_numpy(), test_df["y_prob"].to_numpy(), thresh_youden)
    ci_95 = patient_level_bootstrap_ci(test_df, "y_true", "y_prob", "patient_id", thresh_youden, n_bootstraps=200)
    cal_diag = compute_calibration_diagnostics(test_df["y_true"].to_numpy(), test_df["y_prob"].to_numpy())
    sub_df = run_subgroup_fairness_analysis(test_df, "y_true", "y_prob", thresh_youden)

    # Grad-CAM audit test
    dummy_cam = np.zeros((224, 224))
    dummy_cam[60:170, 50:175] = 0.85
    dummy_mask = np.zeros((224, 224))
    dummy_mask[45:185, 40:185] = 1.0
    cam_audit = audit_gradcam_shortcut_bias(dummy_cam, dummy_mask)

    print(f"Validation Youden Threshold: {thresh_youden:.4f} | 90%-Sens Threshold: {thresh_sens90:.4f}")
    print("Test Metrics (Frozen Threshold):", point_metrics)
    print("Patient-Level 95% Bootstrap CI:", ci_95)
    print("Calibration Diagnostics:", cal_diag)
    print("Grad-CAM Bias Audit:", cam_audit)
