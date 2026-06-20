import numpy as np
import pandas as pd

from .preprocessing import detrend_light_curve, find_best_period, phase_fold, extract_transit_shape


def extract_features_from_lc(time: np.ndarray, flux: np.ndarray) -> dict:
    flux_detrended = detrend_light_curve(time, flux)
    flux_detrended = np.where(np.isfinite(flux_detrended), flux_detrended, 1.0)

    period_result = find_best_period(time, flux_detrended)

    _, _, folded_flux = phase_fold(
        time, flux_detrended, period_result["period"]
    )

    transit_features = extract_transit_shape(folded_flux)

    stats = {
        "mean_flux": np.mean(flux_detrended),
        "std_flux": np.std(flux_detrended),
        "min_flux": np.min(flux_detrended),
        "max_flux": np.max(flux_detrended),
        "flux_range": np.max(flux_detrended) - np.min(flux_detrended),
        "skewness": pd.Series(flux_detrended).skew(),
        "kurtosis": pd.Series(flux_detrended).kurtosis(),
        "p2p_std": np.std(np.diff(flux_detrended)),
        "above_1_count": np.sum(flux_detrended > 1.0) / len(flux_detrended),
        "below_1_count": np.sum(flux_detrended < 1.0) / len(flux_detrended),
    }

    features = {
        "best_period": period_result["period"],
        "peak_power": period_result["power"],
        **transit_features,
        **stats,
    }

    return features


def build_feature_matrix(
    light_curves: dict[str, tuple[np.ndarray, np.ndarray]],
) -> pd.DataFrame:
    records = []
    for lc_id, (time, flux) in light_curves.items():
        try:
            feats = extract_features_from_lc(time, flux)
            feats["id"] = lc_id
            records.append(feats)
        except Exception as e:
            print(f"Warning: failed to extract features for {lc_id}: {e}")
            continue

    return pd.DataFrame(records)
