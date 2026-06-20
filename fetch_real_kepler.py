#!/usr/bin/env python3
import numpy as np
import pandas as pd
import warnings
import sys
warnings.filterwarnings("ignore")

sys.path.insert(0, ".")
from src.data_utils import fetch_kepler_data
from src.features import extract_features_from_lc, build_feature_matrix
from src.model import train_classifier, predict_exoplanet, estimate_transit_parameters


def safe_fetch(name: str, quarter: int = 1) -> pd.DataFrame | None:
    try:
        df = fetch_kepler_data(name, quarter=quarter)
        if df is not None and len(df) > 100:
            mask = np.isfinite(df["time"]) & np.isfinite(df["flux"])
            df = df[mask]
            if len(df) > 100 and np.std(df["flux"].values) < 0.2:
                return df
    except Exception:
        pass
    return None


def main():
    print("=" * 60)
    print("REAL KEPLER DATA PIPELINE (lightweight)")
    print("=" * 60)

    planets = {}
    planet_names = ["Kepler-10", "Kepler-22", "Kepler-186", "Kepler-62"]

    for name in planet_names:
        print(f"\n  Fetching {name}...", end=" ", flush=True)
        df = safe_fetch(name, quarter=1)
        if df is None:
            df = safe_fetch(name, quarter=2)
        if df is not None:
            planets[name] = df
            print(f"OK ({len(df)} points)")
        else:
            print("SKIPPED")

    negs = {}
    neg_names = ["KIC 1571511", "KIC 11446443", "KIC 5094412"]

    for name in neg_names:
        print(f"  Fetching {name}...", end=" ", flush=True)
        df = safe_fetch(name, quarter=1)
        if df is not None:
            negs[name] = df
            print(f"OK ({len(df)} points)")
        else:
            print("SKIPPED")

    from src.data_utils import generate_synthetic_light_curve, generate_non_transit_light_curve

    rng = np.random.default_rng(42)

    for i in range(20):
        lc = generate_synthetic_light_curve(
            transit_depth=rng.uniform(0.005, 0.03),
            transit_duration=rng.uniform(0.05, 0.12),
            orbital_period=rng.uniform(2.0, 12.0),
            noise_scale=rng.uniform(0.001, 0.003),
            random_seed=i,
        )
        planets[f"syn_planet_{i:03d}"] = lc

    for i in range(20):
        lc = generate_non_transit_light_curve(
            noise_scale=rng.uniform(0.002, 0.005),
            random_seed=100 + i,
        )
        negs[f"syn_noise_{i:03d}"] = lc

    print(f"\n  Planets: {len(planets)}, Non-transit: {len(negs)}")

    lcs = {}
    labels = []

    for key, df in planets.items():
        lcs[key] = (df["time"].values, df["flux"].values)
        labels.append(1)

    for key, df in negs.items():
        lcs[key] = (df["time"].values, df["flux"].values)
        labels.append(0)

    print("\n--- Extracting Features ---")
    feature_df = build_feature_matrix(lcs)
    aligned_labels = pd.Series(labels[:len(feature_df)], name="label")
    print(f"  {len(feature_df)} samples, {len(feature_df.columns) - 1} features")

    print("\n--- Training Classifier ---")
    result = train_classifier(feature_df, aligned_labels, model_type="rf")

    print(f"\n  ROC-AUC:             {result['roc_auc']:.4f}")
    print(f"  CV AUC (mean ± std):  {result['cv_auc_mean']:.4f} ± {result['cv_auc_std']:.4f}")
    print(f"  Accuracy:             {result['test_report']['accuracy']:.4f}")
    print(f"  Exoplanet F1:         {result['test_report']['1']['f1-score']:.4f}")
    print(f"  Non-Planet F1:        {result['test_report']['0']['f1-score']:.4f}")

    print(f"\n  Top Features:")
    for feat, imp in sorted(result["feature_importances"].items(), key=lambda x: -x[1])[:8]:
        print(f"    {feat}: {imp:.4f}")

    print("\n--- Predictions on REAL Kepler Targets ---")
    for name in planet_names:
        if name in planets:
            df = planets[name]
            time, flux = df["time"].values, df["flux"].values
            feats = extract_features_from_lc(time, flux)
            pred = predict_exoplanet(
                feats, result["classifier"], result["scaler"],
                result["feature_cols"],
            )
            print(f"  {name}: {pred['label']} ({pred['confidence']:.1%})")

    for name in neg_names:
        if name in negs:
            df = negs[name]
            time, flux = df["time"].values, df["flux"].values
            feats = extract_features_from_lc(time, flux)
            pred = predict_exoplanet(
                feats, result["classifier"], result["scaler"],
                result["feature_cols"],
            )
            print(f"  {name}: {pred['label']} ({pred['confidence']:.1%})")

    print("\n" + "=" * 60)
    print("DONE")
    print("=" * 60)

    return result


if __name__ == "__main__":
    main()
