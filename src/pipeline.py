import numpy as np
import pandas as pd
from pathlib import Path

from .data_utils import generate_synthetic_light_curve, generate_non_transit_light_curve, fetch_kepler_data
from .features import extract_features_from_lc, build_feature_matrix
from .model import train_classifier, predict_exoplanet, estimate_transit_parameters


def generate_training_data(
    num_realistic: int = 50,
    num_noise: int = 50,
    random_seed: int = 42,
) -> tuple[dict, pd.Series]:
    rng = np.random.default_rng(random_seed)
    light_curves = {}
    labels = []

    for i in range(num_realistic):
        depth = rng.uniform(0.005, 0.03)
        duration = rng.uniform(0.05, 0.15)
        period = rng.uniform(1.5, 15.0)
        noise = rng.uniform(0.001, 0.003)

        lc = generate_synthetic_light_curve(
            num_points=3000,
            transit_depth=depth,
            transit_duration=duration,
            orbital_period=period,
            noise_scale=noise,
            random_seed=random_seed + i,
        )
        lc_id = f"planet_{i:03d}"
        light_curves[lc_id] = (lc["time"].values, lc["flux"].values)
        labels.append(1)

    for i in range(num_noise):
        noise = rng.uniform(0.001, 0.004)
        lc = generate_non_transit_light_curve(
            num_points=3000,
            noise_scale=noise,
            random_seed=random_seed + num_realistic + i,
        )
        lc_id = f"noise_{i:03d}"
        light_curves[lc_id] = (lc["time"].values, lc["flux"].values)
        labels.append(0)

    return light_curves, pd.Series(labels, name="label")


def run_pipeline(
    use_synthetic: bool = True,
    kepler_target: str | None = None,
    train_size: int = 80,
    model_type: str = "rf",
) -> dict:
    print("=" * 60)
    print("EXOPLANET DETECTION PIPELINE")
    print("=" * 60)

    if use_synthetic:
        print("\n[1/5] Generating synthetic training data...")
        lcs, labels = generate_training_data(
            num_realistic=train_size // 2,
            num_noise=train_size // 2,
        )
        print(f"  Created {len(lcs)} light curves ({sum(labels)} planets, "
              f"{len(labels) - sum(labels)} non-transit)")

    print("\n[2/5] Extracting features...")
    feature_df = build_feature_matrix(lcs)
    print(f"  Extracted {len(feature_df.columns) - 1} features from "
          f"{len(feature_df)} light curves")

    print("\n[3/5] Training classifier...")
    aligned_labels = labels.iloc[
        [i for i, lc_id in enumerate(feature_df["id"]) if lc_id in labels.index]
    ]
    idx_map = {f"planet_{i:03d}": i for i in range(train_size // 2)}
    idx_map.update({f"noise_{i:03d}": train_size // 2 + i for i in range(train_size // 2)})
    aligned_idx = [idx_map[lc_id] for lc_id in feature_df["id"]
                   if lc_id in idx_map]
    aligned_labels = labels.iloc[aligned_idx]

    result = train_classifier(feature_df, aligned_labels, model_type=model_type)
    print(f"  Model: {model_type.upper()}")
    print(f"  ROC-AUC: {result['roc_auc']:.4f}")
    print(f"  CV AUC: {result['cv_auc_mean']:.4f} +/- {result['cv_auc_std']:.4f}")

    print("\n[4/5] Test on a new synthetic planet...")
    test_lc = generate_synthetic_light_curve(
        transit_depth=0.015,
        transit_duration=0.08,
        orbital_period=3.5,
        noise_scale=0.002,
        random_seed=999,
    )
    test_features = extract_features_from_lc(
        test_lc["time"].values, test_lc["flux"].values
    )
    prediction = predict_exoplanet(
        test_features,
        result["classifier"],
        result["scaler"],
        result["feature_cols"],
    )
    print(f"  Prediction: {prediction['label']}")
    print(f"  Confidence: {prediction['confidence']:.2%}")

    print("\n[5/5] Estimating transit parameters...")
    params = estimate_transit_parameters(
        test_lc["time"].values,
        test_lc["flux"].values,
        period=test_features["best_period"],
    )
    for key, val in params.items():
        print(f"  {key}: {val}")

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)

    return {
        "features": feature_df,
        "model_result": result,
        "test_prediction": prediction,
        "test_params": params,
        "test_light_curve": test_lc,
    }
