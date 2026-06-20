import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

from .data_utils import generate_synthetic_light_curve
from .preprocessing import detrend_light_curve, find_best_period, phase_fold
from .features import extract_features_from_lc
from .model import train_classifier, predict_exoplanet, estimate_transit_parameters
from .pipeline import generate_training_data, build_feature_matrix


def plot_light_curve(time, flux, title, path):
    fig, axes = plt.subplots(2, 1, figsize=(12, 6), sharex=True)

    axes[0].plot(time, flux, "b.", markersize=1, alpha=0.6)
    axes[0].set_ylabel("Normalized Flux")
    axes[0].set_title(f"{title} — Raw Light Curve")
    axes[0].axhline(1.0, color="gray", linestyle="--", alpha=0.5)
    axes[0].set_ylim(0.97, 1.03)

    flux_detrended = detrend_light_curve(time, flux)
    axes[1].plot(time, flux_detrended, "b.", markersize=1, alpha=0.6)
    axes[1].set_xlabel("Time (days)")
    axes[1].set_ylabel("Normalized Flux")
    axes[1].set_title("Detrended Light Curve")
    axes[1].axhline(1.0, color="gray", linestyle="--", alpha=0.5)
    axes[1].set_ylim(0.97, 1.03)

    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {path}")


def plot_phase_folded(time, flux, period, title, path):
    phase_sorted, flux_sorted, binned_flux = phase_fold(time, flux, period)
    bin_edges = np.linspace(0, 1, len(binned_flux) + 1)
    bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(phase_sorted, flux_sorted, "b.", markersize=2, alpha=0.3)
    ax.plot(bin_centers, binned_flux, "r-", linewidth=2, alpha=0.9)
    ax.set_xlabel("Phase")
    ax.set_ylabel("Normalized Flux")
    ax.set_title(f"{title} — Phase Folded (P = {period:.2f} d)")
    ax.axhline(1.0, color="gray", linestyle="--", alpha=0.5)
    ax.set_ylim(0.97, 1.03)

    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {path}")


def plot_feature_importance(importances, path):
    sorted_items = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    features, scores = zip(*sorted_items[:15])

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(range(len(features)), scores, color="steelblue")
    ax.set_yticks(range(len(features)))
    ax.set_yticklabels(features)
    ax.set_xlabel("Importance")
    ax.set_title("Top 15 Feature Importances")
    ax.invert_yaxis()

    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {path}")


def plot_confusion_matrix(cm, path):
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    ax.figure.colorbar(im, ax=ax)
    ax.set(
        xticks=[0, 1],
        yticks=[0, 1],
        xticklabels=["Not Exoplanet", "Exoplanet"],
        yticklabels=["Not Exoplanet", "Exoplanet"],
        ylabel="True Label",
        xlabel="Predicted Label",
    )

    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(cm[i, j]), ha="center", va="center",
                    color="white" if cm[i, j] > cm.max() / 2 else "black")

    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {path}")


def run_demo(output_dir: str = "output"):
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("EXOPLANET DETECTION — DEMO")
    print("=" * 60)

    print("\n--- Generating training data ---")
    lcs, labels = generate_training_data(num_realistic=60, num_noise=60)

    print("\n--- Building feature matrix ---")
    feature_df = build_feature_matrix(lcs)

    idx_map = {}
    for i in range(60):
        idx_map[f"planet_{i:03d}"] = i
        idx_map[f"noise_{i:03d}"] = 60 + i
    aligned_idx = [idx_map[lc_id] for lc_id in feature_df["id"]
                   if lc_id in idx_map]
    aligned_labels = labels.iloc[aligned_idx]

    print("\n--- Training classifier ---")
    result = train_classifier(feature_df, aligned_labels, model_type="rf")

    print(f"\n  ROC-AUC:            {result['roc_auc']:.4f}")
    print(f"  CV AUC (mean ± std): {result['cv_auc_mean']:.4f} ± "
          f"{result['cv_auc_std']:.4f}")

    report = result["test_report"]
    print(f"  Accuracy:           {report['accuracy']:.4f}")
    print(f"  Precision (class 1): {report['1']['precision']:.4f}")
    print(f"  Recall (class 1):    {report['1']['recall']:.4f}")
    print(f"  F1 (class 1):        {report['1']['f1-score']:.4f}")

    print("\n--- Generating visualizations ---")
    plot_feature_importance(result["feature_importances"],
                            out / "feature_importance.png")
    plot_confusion_matrix(result["confusion_matrix"],
                          out / "confusion_matrix.png")

    print("\n--- Testing on a known planet ---")
    test_lc = generate_synthetic_light_curve(
        transit_depth=0.012,
        transit_duration=0.1,
        orbital_period=4.5,
        noise_scale=0.002,
        random_seed=42,
    )

    time, flux = test_lc["time"].values, test_lc["flux"].values

    plot_light_curve(time, flux, "Test Planet", out / "test_lc_raw.png")

    period_result = find_best_period(time, flux)
    plot_phase_folded(time, flux, period_result["period"],
                      "Test Planet", out / "test_lc_folded.png")

    test_features = extract_features_from_lc(time, flux)
    prediction = predict_exoplanet(
        test_features,
        result["classifier"],
        result["scaler"],
        result["feature_cols"],
    )

    print(f"\n  Best Period Found: {period_result['period']:.4f} days")
    print(f"  Prediction:         {prediction['label']}")
    print(f"  Confidence:         {prediction['confidence']:.2%}")

    print("\n--- Estimating planet parameters ---")
    params = estimate_transit_parameters(
        time, flux, period=test_features["best_period"]
    )
    for k, v in params.items():
        print(f"  {k}: {v}")

    print("\n--- Testing on a non-transit (noise) curve ---")
    rng = np.random.default_rng(999)
    noise_lc = generate_synthetic_light_curve(
        transit_depth=0.0001,
        transit_duration=0.01,
        orbital_period=100.0,
        noise_scale=0.005,
        random_seed=999,
    )
    noise_features = extract_features_from_lc(
        noise_lc["time"].values, noise_lc["flux"].values
    )
    noise_pred = predict_exoplanet(
        noise_features,
        result["classifier"],
        result["scaler"],
        result["feature_cols"],
    )
    print(f"  Prediction:         {noise_pred['label']}")
    print(f"  Confidence:         {noise_pred['confidence']:.2%}")

    print(f"\n{'=' * 60}")
    print(f"DEMO COMPLETE — All outputs saved to {out.resolve()}")
    print(f"{'=' * 60}")

    return result


if __name__ == "__main__":
    run_demo()
