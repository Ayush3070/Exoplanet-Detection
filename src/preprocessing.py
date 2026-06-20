import numpy as np
import pandas as pd
from scipy.signal import lombscargle
from scipy.ndimage import uniform_filter1d


def detrend_light_curve(
    time: np.ndarray,
    flux: np.ndarray,
    window_length: int = 101,
) -> np.ndarray:
    if len(flux) < window_length:
        raise ValueError(
            f"Light curve too short ({len(flux)} points) for window "
            f"length {window_length}. Reduce 'window_length' or "
            f"provide more data."
        )

    trend = uniform_filter1d(flux, size=window_length, mode="reflect")
    detrended = flux / trend
    return detrended


def find_best_period(
    time: np.ndarray,
    flux: np.ndarray,
    min_period: float = 0.5,
    max_period: float = 20.0,
    samples_per_peak: int = 10,
) -> dict:
    duration = time.max() - time.min()
    if max_period > duration / 2:
        max_period = duration / 2

    frequency = np.linspace(1 / max_period, 1 / min_period, 10000)
    power = lombscargle(time, flux - np.mean(flux), frequency * 2 * np.pi)

    best_idx = np.argmax(power)
    best_freq = frequency[best_idx]
    best_period = 1 / best_freq
    best_power = power[best_idx]

    return {
        "period": best_period,
        "frequency": best_freq,
        "power": best_power,
        "all_frequencies": frequency,
        "all_powers": power,
    }


def phase_fold(
    time: np.ndarray,
    flux: np.ndarray,
    period: float,
    num_bins: int = 200,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    phase = (time % period) / period
    sorted_idx = np.argsort(phase)
    phase_sorted = phase[sorted_idx]
    flux_sorted = flux[sorted_idx]

    bin_edges = np.linspace(0, 1, num_bins + 1)
    bin_indices = np.digitize(phase_sorted, bin_edges) - 1
    bin_indices = np.clip(bin_indices, 0, num_bins - 1)

    binned_phase = np.array([
        phase_sorted[bin_indices == i].mean() if np.any(bin_indices == i)
        else (bin_edges[i] + bin_edges[i + 1]) / 2
        for i in range(num_bins)
    ])

    binned_flux = np.array([
        flux_sorted[bin_indices == i].mean() if np.any(bin_indices == i)
        else 1.0
        for i in range(num_bins)
    ])

    return phase_sorted, flux_sorted, binned_flux


def extract_transit_shape(folded_flux: np.ndarray) -> dict:
    baseline = np.median(folded_flux)
    depth = baseline - folded_flux.min()
    duration_pixels = np.sum(folded_flux < baseline - depth * 0.5)
    ingress = np.sum(np.diff(folded_flux[:len(folded_flux)//2]) < -depth * 0.1)
    egress = np.sum(np.diff(folded_flux[len(folded_flux)//2:]) > depth * 0.1)

    return {
        "depth": depth,
        "depth_ratio": depth / baseline if baseline > 0 else 0,
        "duration_fraction": duration_pixels / len(folded_flux),
        "ingress_pixels": ingress,
        "egress_pixels": egress,
    }
