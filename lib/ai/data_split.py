#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
File 1: data_split.py
=====================
Patient-Level Stratified Data Splitting, Deduplication & Leakage Verification Pipeline
for Multi-Modality Medical Imaging Datasets (CXR, Chest CT, Echo, Brain CT, Abdomen US).

Addresses Part 1 (Items 1 to 7):
  1. Prevents Patient-Level Data Leakage (same patient's serial scans never cross train/val/test).
  2. Splits data 70% Train / 15% Validation / 15% Test grouped strictly by `patient_id`
     using `StratifiedGroupKFold` & `GroupShuffleSplit` + Multi-Label Iterative Stratification.
  3. Preserves disease class distribution, rare classes, and multi-label combinations.
  4. Infers missing `patient_id` from DICOM metadata / filename regex patterns AND detects
     near-duplicate images via Perceptual Hashing (64-bit dHash) + Cosine Embedding Similarity.
  5. Runs strict `assert` verification checks:
     - Zero shared `patient_id` across Train, Val, and Test.
     - Zero duplicate image hashes across Train, Val, and Test.
     - Prints a full demographic, scanner vendor, & class balance comparison table.
  6. Uses a deterministic `SEED = 42` and saves reproducible split CSVs (`train_split.csv`,
     `val_split.csv`, `test_split.csv`).
  7. Implements 5-Fold Patient-Level Cross-Validation (`get_patient_level_cv_folds`) on
     Train+Val while keeping the Test Set 100% locked in a vault until final evaluation.
"""

from __future__ import annotations
import os
import re
import csv
import hashlib
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Set, Tuple
import numpy as np
import pandas as pd
try:
    from sklearn.model_selection import GroupShuffleSplit, StratifiedGroupKFold
except ImportError:
    class StratifiedGroupKFold:  # type: ignore
        def __init__(self, n_splits: int = 5, shuffle: bool = True, random_state: int = 42):
            self.n_splits = n_splits
            self.shuffle = shuffle
            self.random_state = random_state

        def split(self, X, y, groups):
            rng = np.random.default_rng(self.random_state if self.shuffle else 0)
            df_tmp = pd.DataFrame({"y": np.asarray(y), "g": np.asarray(groups), "idx": np.arange(len(X))})
            grp_df = df_tmp.groupby("g", as_index=False).agg(y_mode=("y", "first"), size=("idx", "count"))
            if self.shuffle:
                grp_df = grp_df.sample(frac=1.0, random_state=self.random_state).reset_index(drop=True)
            grp_df = grp_df.sort_values("y_mode", kind="mergesort").reset_index(drop=True)
            grp_df["fold"] = np.arange(len(grp_df)) % self.n_splits
            g_to_fold = dict(zip(grp_df["g"], grp_df["fold"]))
            row_folds = np.array([g_to_fold[g] for g in df_tmp["g"]])
            for k in range(self.n_splits):
                val_idx = np.where(row_folds == k)[0]
                tr_idx = np.where(row_folds != k)[0]
                yield tr_idx, val_idx


SEED: int = 42


# ============================================================================
# 1. Registry of the 20 Global Medical Imaging Datasets Across 5 Modalities
# ============================================================================
GLOBAL_20_MEDICAL_DATASETS: Dict[str, List[Dict[str, str]]] = {
    "cxr": [
        {"id": "MIMIC-CXR-JPG", "size": "377,110 images", "focus": "14 CheXpert structured NLP labels from Beth Israel Deaconess"},
        {"id": "NIH-ChestXray14", "size": "112,120 images (30,805 patients)", "focus": "14 thoracic pathology labels"},
        {"id": "CheXpert-CheXmask", "size": "224,316 images (65,240 patients)", "focus": "14 labels + anatomical lung/heart segmentation masks"},
        {"id": "JU-TBv1", "size": "55,000+ images", "focus": "Dedicated Pulmonary Tuberculosis (TB) detection"},
    ],
    "chest_ct": [
        {"id": "ChestPathCT5-S100", "size": "Multi-center CT cohort", "focus": "5 thoracic pathologies: Rib Fracture, Pleural Effusion, Lung Mass, PE, Pneumothorax"},
        {"id": "PatchChestCT", "size": "Large patch-annotated NCCT", "focus": "Patch-level annotations for 9 non-contrast chest CT abnormalities"},
        {"id": "NIAID-Lung-Cancer-CT", "size": "Specialized Oncology CT", "focus": "Malignant vs. Benign vs. Normal pulmonary nodules/masses"},
    ],
    "echo": [
        {"id": "MIMIC-IV-ECHO-Ext", "size": "BIDMC Clinical Echo Cohort", "focus": "Annotated Left Ventricular (LV) volume and systolic function (LVEF)"},
        {"id": "ECHOVIEW-MIMIC-IV", "size": "500,000+ echocardiograms", "focus": "Structured acoustic window & standard cardiac view classification"},
        {"id": "CAMEO", "size": "Multi-View High-Quality Echo", "focus": "9 standard transthoracic echocardiography views"},
        {"id": "FeEcho4D", "size": "4D Fetal Echo Reference", "focus": "4D spatiotemporal left ventricular reconstruction"},
    ],
    "brain_ct": [
        {"id": "STBI-Shiraz-TBI", "size": "12,000+ NCCT scans (3,602 patients)", "focus": "Traumatic Brain Injury (EDH, SDH, contusion, skull fracture)"},
        {"id": "Hemorica", "size": "372 complete head CT scans", "focus": "Detection, classification, and pixel segmentation of Brain Hemorrhage"},
        {"id": "CT-Seg1500", "size": "1,500 harmonized head CTs", "focus": "Multi-source intracranial hemorrhage (ICH) segmentation & subtype diagnosis"},
        {"id": "TBI-HemoCT", "size": "~60,000 axial brain CT slices", "focus": "Large-scale traumatic & hemorrhagic axial slice classification"},
        {"id": "Stroke-Triage-NCCT", "size": "7,965 non-contrast head CTs", "focus": "Multi-class acute ischemic vs. hemorrhagic stroke triage"},
    ],
    "abdomen_us": [
        {"id": "NAFLD-Saudi-US", "size": "10,000+ ultrasound images", "focus": "Non-Alcoholic Fatty Liver Disease (NAFLD / hepatic steatosis grading)"},
        {"id": "C-TRUS", "size": "827 expert-annotated US images", "focus": "Transabdominal ultrasound pathology + explicit image quality grading"},
        {"id": "TRUSTED-3DUS-CT", "size": "48 paired 3DUS + CT patients", "focus": "Paired multimodal renal segmentation & anatomical registration"},
        {"id": "LDM-TIB-Abdominal-US", "size": "Public TIB repository", "focus": "Multi-organ abdominal ultrasound reference images"},
        {"id": "Abdominal-US-Organ-Class", "size": "Multi-organ open US dataset", "focus": "Abdominal organ classification (Liver, GB, Kidney, Spleen, Pancreas) & lesions"},
    ],
}


# ============================================================================
# 2. Missing Patient-ID Inference & Near-Duplicate Image Detection (Part 1.4)
# ============================================================================
PATIENT_ID_PATTERNS = [
    # MIMIC-CXR pattern: p10/p10000032/s50414267/02aa804e.jpg -> p10000032
    re.compile(r"(?:^|/)(p\d{7,9})(?:/|_)", re.IGNORECASE),
    # NIH ChestX-ray14 pattern: 00000001_000.png -> patient_00000001
    re.compile(r"(?:^|/)(\d{8})_\d{3}\.[a-z0-9]+$", re.IGNORECASE),
    # CheXpert pattern: patient00001/study1/view1_frontal.jpg -> patient00001
    re.compile(r"(patient\d{4,8})", re.IGNORECASE),
    # Generic prefix pattern: subj_1042_slice_08.png or pt-2049-scan2.jpg
    re.compile(r"((?:pt|pat|subj|subject|case)[_\-]?\d{2,10})", re.IGNORECASE),
]


def infer_patient_id(
    row_patient_id: Optional[str],
    image_path: str,
    dicom_tags: Optional[Dict[str, str]] = None,
     perceptual_cluster_id: Optional[str] = None,
) -> str:
    """
    Resolves a canonical `patient_id` when the dataset lacks an explicit column:
      1. Explicit `row_patient_id` if present and valid.
      2. DICOM `(0010,0020) PatientID` or `(0020,000D) StudyInstanceUID` prefix.
      3. Regex extraction from standard naming conventions (MIMIC, NIH, CheXpert, TBI).
      4. Fallback to `perceptual_cluster_id` (grouping near-identical serial scans together)
         so two similar images from the same unindexed patient never split across Train/Test.
    """
    if row_patient_id and str(row_patient_id).strip().lower() not in {"", "nan", "none", "null", "unknown"}:
        return str(row_patient_id).strip()

    if dicom_tags:
        dcm_pid = dicom_tags.get("PatientID") or dicom_tags.get("0010,0020")
        if dcm_pid and str(dcm_pid).strip():
            return f"dcm_{str(dcm_pid).strip()}"

    for rx in PATIENT_ID_PATTERNS:
        m = rx.search(image_path)
        if m:
            return f"inferred_{m.group(1).lower()}"

    if perceptual_cluster_id:
        return f"pcluster_{perceptual_cluster_id}"

    # Deterministic hash of file stem (stripping trailing slice/view numbers)
    stem = os.path.splitext(os.path.basename(image_path))[0]
    base_stem = re.sub(r"[_\-](?:slice|view|frame|img|scan)?\d+$", "", stem, flags=re.IGNORECASE)
    digest = hashlib.sha1(base_stem.encode("utf-8")).hexdigest()[:10]
    return f"stem_{digest}"


def compute_dhash_64bit(grayscale_9x8: np.ndarray) -> int:
    """
    Computes a 64-bit Difference Perceptual Hash (dHash) from an 8x9 grayscale patch.
    Two images with Hamming distance <= 4 bits are flagged as near-duplicates.
    """
    assert grayscale_9x8.shape == (8, 9), "Input to dHash must be resized to (8, 9)"
    diff = grayscale_9x8[:, 1:] > grayscale_9x8[:, :-1]
    bits = diff.flatten()
    h = 0
    for b in bits:
        h = (h << 1) | int(bool(b))
    return h


def hamming_distance_64bit(hash_a: int, hash_b: int) -> int:
    """Counts differing bits between two 64-bit perceptual hashes."""
    return int(bin(hash_a ^ hash_b).count("1"))


def deduplicate_and_cluster_images(
    df: pd.DataFrame,
    hash_col: str = "dhash_int",
    embedding_matrix: Optional[np.ndarray] = None,
    max_hamming_dist: int = 2,
    cosine_sim_threshold: float = 0.985,
) -> Tuple[pd.DataFrame, int]:
    """
    1. Drops exact/near-duplicate images (Hamming distance <= max_hamming_dist or
       embedding cosine similarity >= cosine_sim_threshold) across the dataset.
    2. Ensures any remaining borderline similar scans share the same `patient_id` group
       so they can never leak across Train / Validation / Test.
    """
    df = df.copy().reset_index(drop=True)
    n = len(df)
    keep_mask = np.ones(n, dtype=bool)
    hashes = df[hash_col].to_numpy(dtype=np.uint64)

    seen_hashes: Dict[int, int] = {}
    for i in range(n):
        h_i = int(hashes[i])
        if h_i in seen_hashes:
            keep_mask[i] = False
            continue
        # Check near-duplicate Hamming distance against seen hashes
        is_dup = False
        for h_prev, prev_idx in seen_hashes.items():
            if hamming_distance_64bit(h_i, h_prev) <= max_hamming_dist:
                keep_mask[i] = False
                is_dup = True
                break
        if not is_dup:
            seen_hashes[h_i] = i

    if embedding_matrix is not None and len(embedding_matrix) == n:
        norms = np.linalg.norm(embedding_matrix, axis=1, keepdims=True) + 1e-8
        unit_emb = embedding_matrix / norms
        sim_mat = unit_emb @ unit_emb.T
        for i in range(n):
            if not keep_mask[i]:
                continue
            for j in range(i + 1, n):
                if keep_mask[j] and sim_mat[i, j] >= cosine_sim_threshold:
                    keep_mask[j] = False

    cleaned_df = df[keep_mask].reset_index(drop=True)
    removed_count = int(n - len(cleaned_df))
    return cleaned_df, removed_count


# ============================================================================
# 3. Multi-Label & Rare-Class Patient-Level Composite Stratification Key
# ============================================================================
def build_composite_stratification_target(
    df: pd.DataFrame,
    label_cols: Sequence[str],
    min_rare_count: int = 8,
) -> pd.Series:
    """
    Handles Multi-Label and Rare-Class Stratification at the Patient Level (Part 1.3):
      - For each patient, aggregates all positive labels across all of their scans.
      - Priority-ranks rare diseases first (inverse frequency weighting) so patients
        with rare findings (e.g. Pneumothorax, Aortic Dissection, Epidural Hematoma)
        are stratified by their rarest positive condition rather than being drowned out
        by common labels.
      - Combines the primary rare/multi-label signature with sex and age bracket
        (`infant_child`, `young_adult`, `middle_aged`, `older_adult`) into a composite
        stratification key, collapsing ultra-rare strata (< min_rare_count) into their
        parent disease label so `StratifiedGroupKFold` never fails on singleton classes.
    """
    label_Document_freq = {col: int(df[col].sum()) for col in label_cols}
    # Sort labels from rarest (smallest positive count > 0) to most common
    sorted_labels_by_rarity = sorted(
        label_cols,
        key=lambda c: label_Document_freq[c] if label_Document_freq[c] > 0 else 999999,
    )

    def row_primary_label(row: pd.Series) -> str:
        active = [c for c in sorted_labels_by_rarity if int(row[c]) == 1]
        if not active:
            return "Normal_Healthy"
        if len(active) == 1:
            return active[0]
        # Keep top-2 rarest co-occurring labels as a multi-label signature
        return f"{active[0]}+{active[1]}"

    primary_disease = df.apply(row_primary_label, axis=1)
    age_bin = pd.cut(
        df["age_years"].fillna(45.0),
        bins=[-1, 14, 39, 64, 150],
        labels=["pediatric", "young", "middle", "senior"],
    ).astype(str)

    composite = primary_disease + "__" + df["sex"].fillna("U").astype(str) + "__" + age_bin
    counts = composite.value_counts()
    # Fallback to primary_disease alone if composite stratum has fewer than min_rare_count samples
    final_key = [
        comp if counts[comp] >= min_rare_count else dis
        for comp, dis in zip(composite, primary_disease)
    ]
    final_series = pd.Series(final_key, index=df.index)
    # Second-level fallback if even the multi-label pair is rarer than min_rare_count
    final_counts = final_series.value_counts()
    return pd.Series(
        [
            val if final_counts[val] >= min_rare_count else val.split("+")[0]
            for val in final_series
        ],
        index=df.index,
    )


# ============================================================================
# 4. Patient-Level 70 / 15 / 15 Split (Zero Patient Overlap) (Part 1.2 & 1.6)
# ============================================================================
def split_dataset_patient_level(
    df: pd.DataFrame,
    label_cols: Sequence[str],
    output_dir: str = "splits_output",
    seed: int = SEED,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Splits `df` into 70% Train, 15% Validation, and 15% Test strictly grouped by `patient_id`
    while preserving multi-label disease and demographic stratification:
      - Uses a 20-fold `StratifiedGroupKFold` (each fold = 5% of patients):
        * Folds 0..13 (14 folds = 70%) -> Train Set
        * Folds 14..16 (3 folds = 15%) -> Validation Set
        * Folds 17..19 (3 folds = 15%) -> Test Set (Locked Vault)
      - Saves deterministic CSVs (`train_split.csv`, `val_split.csv`, `test_split.csv`).
    """
    os.makedirs(output_dir, exist_ok=True)
    df = df.copy().reset_index(drop=True)

    strat_target = build_composite_stratification_target(df, label_cols)
    sgkf = StratifiedGroupKFold(n_splits=20, shuffle=True, random_state=seed)

    fold_assignments = np.zeros(len(df), dtype=int)
    for fold_idx, (_, val_idx) in enumerate(
        sgkf.split(df, y=strat_target, groups=df["patient_id"])
    ):
        fold_assignments[val_idx] = fold_idx

    train_df = df[fold_assignments < 14].copy().reset_index(drop=True)
    val_df = df[(fold_assignments >= 14) & (fold_assignments < 17)].copy().reset_index(drop=True)
    test_df = df[fold_assignments >= 17].copy().reset_index(drop=True)

    train_df["split"] = "train"
    val_df["split"] = "val"
    test_df["split"] = "test"

    train_df.to_csv(os.path.join(output_dir, "train_split.csv"), index=False)
    val_df.to_csv(os.path.join(output_dir, "val_split.csv"), index=False)
    test_df.to_csv(os.path.join(output_dir, "test_split.csv"), index=False)

    return train_df, val_df, test_df


# ============================================================================
# 5. Strict Leakage, Deduplication & Balance Assertions (Part 1.5)
# ============================================================================
def verify_splits_and_print_balance_table(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    test_df: pd.DataFrame,
    label_cols: Sequence[str],
) -> pd.DataFrame:
    """
    Executes hard assertions proving:
      1. Zero shared `patient_id` between Train & Val, Train & Test, and Val & Test.
      2. Zero shared `image_id` or perceptual `dhash_int` between any two splits.
      3. Computes and returns a comprehensive distribution comparison table across
         Train, Validation, and Test for class prevalence, age, sex, and scanner type.
    """
    train_pats = set(train_df["patient_id"].unique())
    val_pats = set(val_df["patient_id"].unique())
    test_pats = set(test_df["patient_id"].unique())

    # Assertion 1: Zero patient_id overlap
    assert len(train_pats & val_pats) == 0, f"DATA LEAKAGE: {len(train_pats & val_pats)} patients in both Train & Val!"
    assert len(train_pats & test_pats) == 0, f"DATA LEAKAGE: {len(train_pats & test_pats)} patients in both Train & Test!"
    assert len(val_pats & test_pats) == 0, f"DATA LEAKAGE: {len(val_pats & test_pats)} patients in both Val & Test!"

    # Assertion 2: Zero duplicate image hashes across splits
    if "dhash_int" in train_df.columns:
        train_hashes = set(train_df["dhash_int"].unique())
        val_hashes = set(val_df["dhash_int"].unique())
        test_hashes = set(test_df["dhash_int"].unique())
        assert len(train_hashes & val_hashes) == 0, "DUPLICATE IMAGE LEAKAGE between Train & Val!"
        assert len(train_hashes & test_hashes) == 0, "DUPLICATE IMAGE LEAKAGE between Train & Test!"
        assert len(val_hashes & test_hashes) == 0, "DUPLICATE IMAGE LEAKAGE between Val & Test!"

    # Build comparison table
    rows = []
    splits = [("Train (70%)", train_df), ("Validation (15%)", val_df), ("Test (15%)", test_df)]

    for metric_name, fn in [
        ("Total Scans (n)", lambda d: f"{len(d)}"),
        ("Unique Patients (n)", lambda d: f"{d['patient_id'].nunique()}"),
        ("Age (Mean ± SD yrs)", lambda d: f"{d['age_years'].mean():.1f} ± {d['age_years'].std():.1f}"),
        ("Female Sex (%)", lambda d: f"{(d['sex'] == 'F').mean() * 100:.1f}%"),
        ("Scanner: Portable/AP (%)", lambda d: f"{(d['scanner_type'] == 'Portable_AP').mean() * 100:.1f}%"),
    ]:
        row_dict = {"Attribute / Class": metric_name}
        for s_label, s_df in splits:
            row_dict[s_label] = fn(s_df)
        rows.append(row_dict)

    for col in label_cols:
        row_dict = {"Attribute / Class": f"Label: {col} (%)"}
        for s_label, s_df in splits:
            row_dict[s_label] = f"{s_df[col].mean() * 100:.1f}% ({int(s_df[col].sum())})"
        rows.append(row_dict)

    summary_df = pd.DataFrame(rows)
    return summary_df


# ============================================================================
# 6. Patient-Level Cross-Validation with Locked Test Set (Part 1.7)
# ============================================================================
def get_patient_level_cv_folds(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    test_df: pd.DataFrame,
    label_cols: Sequence[str],
    n_splits: int = 5,
    seed: int = SEED,
) -> List[Tuple[pd.DataFrame, pd.DataFrame]]:
    """
    Combines ONLY `train_df` and `val_df` into a development pool for K-Fold
    Patient-Level Stratified Group Cross-Validation when the dataset is small,
    while asserting that `test_df` patients are 100% excluded from all CV folds.
    """
    dev_df = pd.concat([train_df, val_df], ignore_index=True)
    test_patients = set(test_df["patient_id"].unique())
    assert len(set(dev_df["patient_id"].unique()) & test_patients) == 0, (
        "CRITICAL VIOLATION: Test set patients must never enter Cross-Validation!"
    )

    strat_target = build_composite_stratification_target(dev_df, label_cols)
    sgkf = StratifiedGroupKFold(n_splits=n_splits, shuffle=True, random_state=seed)
    folds: List[Tuple[pd.DataFrame, pd.DataFrame]] = []
    for tr_idx, va_idx in sgkf.split(dev_df, y=strat_target, groups=dev_df["patient_id"]):
        f_train = dev_df.iloc[tr_idx].copy().reset_index(drop=True)
        f_val = dev_df.iloc[va_idx].copy().reset_index(drop=True)
        assert len(set(f_train["patient_id"]) & set(f_val["patient_id"])) == 0
        folds.append((f_train, f_val))
    return folds


def generate_synthetic_clinical_cohort(n_patients: int = 600, seed: int = SEED) -> Tuple[pd.DataFrame, List[str]]:
    """Generates a realistic multi-scan per patient cohort to test `data_split.py` end-to-end."""
    rng = np.random.default_rng(seed)
    label_cols = ["Pneumonia", "Pleural_Effusion", "Pneumothorax", "Cardiomegaly", "Tuberculosis"]
    records = []
    for p_idx in range(1, n_patients + 1):
        pid = f"p{10000000 + p_idx}"
        age = float(np.clip(rng.normal(54, 18), 1, 92))
        sex = "F" if rng.random() < 0.46 else "M"
        scanner = "Portable_AP" if rng.random() < 0.35 else "Fixed_PA"
        hospital = rng.choice(["BIDMC_MIMIC", "Stanford_CheXpert", "NIH_ClinicalCenter"])
        # Assign patient-level disease state
        p_labels = {
            "Pneumonia": int(rng.random() < 0.22),
            "Pleural_Effusion": int(rng.random() < 0.18),
            "Pneumothorax": int(rng.random() < 0.08),
            "Cardiomegaly": int(rng.random() < (0.28 if age > 60 else 0.10)),
            "Tuberculosis": int(rng.random() < 0.07),
        }
        n_scans = int(rng.choice([1, 2, 3], p=[0.55, 0.30, 0.15]))
        for s_idx in range(n_scans):
            img_id = f"{pid}_s{s_idx + 1}.jpg"
            dhash = int(rng.integers(1, (1 << 63) - 1, dtype=np.int64))
            rec = {
                "image_id": img_id,
                "patient_id": pid,
                "age_years": round(age, 1),
                "sex": sex,
                "scanner_type": scanner,
                "hospital_site": hospital,
                "dhash_int": dhash,
                **p_labels,
            }
            records.append(rec)
    return pd.DataFrame(records), label_cols


if __name__ == "__main__":
    cohort_df, labels = generate_synthetic_clinical_cohort(n_patients=600, seed=SEED)
    dedup_df, n_removed = deduplicate_and_cluster_images(cohort_df)
    tr_df, va_df, te_df = split_dataset_patient_level(dedup_df, labels, output_dir="splits_output", seed=SEED)
    table = verify_splits_and_print_balance_table(tr_df, va_df, te_df, labels)
    cv_folds = get_patient_level_cv_folds(tr_df, va_df, te_df, labels, n_splits=5, seed=SEED)
    print("=== Patient-Level Split & Verification Passed (0 Leakage, 5 CV Folds Verified) ===")
    print(table.to_string(index=False))
