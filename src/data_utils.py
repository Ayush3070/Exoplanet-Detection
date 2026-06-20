import numpy as np
import pandas as pd
from astropy.io import fits
from pathlib import Path


def generate_synthetic_light_curve(
    num_points: int = 3000,
    transit_depth: float = 0.01,
    transit_duration: float = 0.1,
    orbital_period: float = 5.0,
    noise_scale: float = 0.002,
    random_seed: int = 42,
) -> pd.DataFrame:
    rng = np.random.default_rng(random_seed)
    time = np.linspace(0, 30, num_points)
    phase = (time % orbital_period) / orbital_period
    flux = np.ones_like(time)

    in_transit = phase < transit_duration
    in_transit |= phase > (1 - transit_duration)

    t_mid = (transit_duration / 2) * orbital_period
    eclipse_phase = ((time % orbital_period) - t_mid) / orbital_period
    eclipse_phase = np.where(eclipse_phase > 0.5, eclipse_phase - 1, eclipse_phase)
    in_eclipse = (
        np.abs(eclipse_phase) < (transit_duration / 2)
    ) & ~in_transit

    flux[in_transit] = 1 - transit_depth
    flux[in_eclipse] = 1 - transit_depth * 0.3

    flux += rng.normal(0, noise_scale, num_points)

    return pd.DataFrame({
        "time": time,
        "flux": flux,
        "flux_err": np.full(num_points, noise_scale),
    })


def generate_non_transit_light_curve(
    num_points: int = 3000,
    noise_scale: float = 0.002,
    random_seed: int = 42,
) -> pd.DataFrame:
    rng = np.random.default_rng(random_seed)
    time = np.linspace(0, 30, num_points)
    flux = 1 + rng.normal(0, noise_scale, num_points)

    return pd.DataFrame({
        "time": time,
        "flux": flux,
        "flux_err": np.full(num_points, noise_scale),
    })


def fetch_kepler_data(target_id: str, quarter: int = 1) -> pd.DataFrame | None:
    try:
        from lightkurve import search_lightcurve

        lc_collection = search_lightcurve(
            target_id, mission="Kepler", quarter=quarter
        ).download_all()

        if lc_collection is None:
            return None

        lc = lc_collection.stitch()
        return pd.DataFrame({
            "time": lc.time.value,
            "flux": lc.flux.value,
            "flux_err": lc.flux_err.value,
        })
    except Exception:
        return None


def load_sample_kepler_labeled_csv(path: str | Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    required_cols = {"id", "flux", "time", "label"}
    if not required_cols.issubset(df.columns):
        expected_columns = ", ".join(sorted(required_cols))
        actual_columns = ", ".join(sorted(df.columns))
        raise ValueError(
            f"Missing required columns. Expected columns: {expected_columns}. "
            f"Actual columns: {actual_columns}. "
            f"Your CSV must contain 'time', 'flux', 'id', and 'label' columns."
        )
    return df
