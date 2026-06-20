import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

import xgboost as xgb


def train_classifier(
    features: pd.DataFrame,
    labels: pd.Series,
    model_type: str = "rf",
    test_size: float = 0.2,
    random_seed: int = 42,
) -> tuple:
    if model_type not in ("rf", "xgb"):
        raise ValueError(f"Unsupported model_type '{model_type}'. Use 'rf' or 'xgb'.")

    id_col = "id" if "id" in features.columns else None
    feature_cols = features.drop(columns=[id_col], errors="ignore").columns

    X = features[feature_cols].copy()
    y = labels.copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_seed, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    if model_type == "rf":
        clf = RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=5,
            class_weight="balanced",
            random_state=random_seed,
            n_jobs=-1,
        )
    else:
        clf = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=random_seed,
            n_jobs=-1,
        )

    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    y_proba = clf.predict_proba(X_test_scaled)[:, 1]

    cv_scores = cross_val_score(
        clf, X_train_scaled, y_train, cv=5, scoring="roc_auc"
    )

    result = {
        "classifier": clf,
        "scaler": scaler,
        "feature_cols": list(feature_cols),
        "test_report": classification_report(y_test, y_pred, output_dict=True),
        "confusion_matrix": confusion_matrix(y_test, y_pred),
        "roc_auc": roc_auc_score(y_test, y_proba),
        "cv_auc_mean": cv_scores.mean(),
        "cv_auc_std": cv_scores.std(),
        "feature_importances": dict(zip(feature_cols, clf.feature_importances_)),
        "X_test": X_test,
        "y_test": y_test,
        "y_pred": y_pred,
        "y_proba": y_proba,
    }

    return result


def predict_exoplanet(
    features: dict | pd.DataFrame,
    classifier: RandomForestClassifier | xgb.XGBClassifier,
    scaler: StandardScaler,
    feature_cols: list[str],
) -> dict:
    if isinstance(features, dict):
        features = pd.DataFrame([features])

    missing = set(feature_cols) - set(features.columns)
    if missing:
        raise ValueError(f"Missing features: {missing}")

    X = features[feature_cols]
    X_scaled = scaler.transform(X)

    proba = classifier.predict_proba(X_scaled)[:, 1][0]
    pred = classifier.predict(X_scaled)[0]

    return {
        "is_exoplanet": bool(pred),
        "confidence": float(proba),
        "label": "Candidate Exoplanet" if pred else "Not Exoplanet",
    }


def estimate_transit_parameters(
    time: np.ndarray,
    flux: np.ndarray,
    period: float,
) -> dict:
    try:
        import batman

        phase = (time % period) / period
        phase = np.where(phase > 0.5, phase - 1, phase)
        sorted_idx = np.argsort(phase)

        params = batman.TransitParams()
        params.t0 = 0.0
        params.per = period
        params.rp = 0.1
        params.a = 15.0
        params.inc = 87.0
        params.ecc = 0.0
        params.w = 90.0
        params.u = [0.3, 0.2]
        params.limb_dark = "quadratic"

        flux_norm = flux / np.median(flux)
        depth_estimate = 1.0 - np.min(flux_norm)
        params.rp = np.sqrt(max(depth_estimate, 0.0001))

        m = batman.TransitModel(params, phase[sorted_idx])
        model_flux = m.light_curve(params)

        rp_earth = params.rp * 6371
        return {
            "planet_radius_earth": round(rp_earth / 6371, 4),
            "planet_radius_km": round(rp_earth, 1),
            "orbital_period_days": round(period, 4),
            "transit_depth": round(depth_estimate, 6),
        }
    except ImportError:
        return {"error": "batman not installed. Run: pip install batman-package"}
    except Exception as e:
        return {"error": str(e)}
