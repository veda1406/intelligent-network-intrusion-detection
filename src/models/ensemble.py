from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from src.utils.logger import setup_logger

logger = setup_logger("IntrusionEnsemble")


class SoftVotingEnsemble:
    """
    Combines predicted class probability distributions from multiple base models using weighted averaging.
    """

    def __init__(self, models: Dict[str, Any], weights: Optional[Dict[str, float]] = None):
        self.models = models
        self.weights = weights
        self.classes_ = list(models.values())[0].classes_ if hasattr(list(models.values())[0], "classes_") else None

    def predict_proba(self, X: Any) -> np.ndarray:
        if isinstance(X, (pd.DataFrame, pd.Series)):
            X = X.values

        probs_list = []
        weight_list = []

        for name, model in self.models.items():
            prob = model.predict_proba(X)
            w = self.weights.get(name, 1.0) if self.weights else 1.0
            probs_list.append(prob * w)
            weight_list.append(w)

        total_weight = sum(weight_list)
        avg_probs = sum(probs_list) / total_weight
        return avg_probs

    def predict(self, X: Any) -> np.ndarray:
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)


class StackingEnsemble:
    """
    Constructs a two-stage stacking classifier where predictions from base estimators feed into a meta-learner.
    """

    def __init__(self, base_models: Dict[str, Any], meta_learner: Optional[Any] = None):
        self.base_models = base_models
        self.meta_learner = meta_learner or LogisticRegression(max_iter=1000)
        self.classes_ = None

    def fit(self, X_train: Any, y_train: Any):
        if isinstance(X_train, (pd.DataFrame, pd.Series)):
            X_train = X_train.values
        if isinstance(y_train, (pd.DataFrame, pd.Series)):
            y_train = y_train.values

        meta_features = []
        for name, model in self.base_models.items():
            prob = model.predict_proba(X_train)
            meta_features.append(prob)

        X_meta = np.hstack(meta_features)
        logger.info(f"Training meta-learner on stacked probability features with shape {X_meta.shape}...")
        self.meta_learner.fit(X_meta, y_train)
        self.classes_ = getattr(self.meta_learner, "classes_", np.unique(y_train))
        return self

    def predict_proba(self, X: Any) -> np.ndarray:
        if isinstance(X, (pd.DataFrame, pd.Series)):
            X = X.values

        meta_features = []
        for name, model in self.base_models.items():
            prob = model.predict_proba(X)
            meta_features.append(prob)

        X_meta = np.hstack(meta_features)
        return self.meta_learner.predict_proba(X_meta)

    def predict(self, X: Any) -> np.ndarray:
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)


class IntrusionEnsemble:
    """
    Ensemble Learning Framework for Network Intrusion Detection.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        ens_cfg = config.get("ensemble", {})
        self.method = ens_cfg.get("method", "stacking")

    def build_soft_voting_ensemble(
        self, models: Dict[str, Any], weights: Optional[Dict[str, float]] = None
    ) -> SoftVotingEnsemble:
        """Constructs soft voting ensemble wrapper."""
        logger.info("Building Soft Voting Ensemble across trained base models...")
        return SoftVotingEnsemble(models, weights=weights)

    def build_stacking_ensemble(
        self, base_models: Dict[str, Any], meta_learner: Optional[Any] = None
    ) -> StackingEnsemble:
        """Constructs meta-learner stacking ensemble wrapper."""
        logger.info("Building Meta-Learner Stacking Ensemble...")
        return StackingEnsemble(base_models, meta_learner=meta_learner)

