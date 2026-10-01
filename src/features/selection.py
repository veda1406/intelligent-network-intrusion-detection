from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import mutual_info_classif
from src.utils.logger import setup_logger

logger = setup_logger("FeatureSelector")


class FeatureSelector:
    """
    Selects top informative features using statistical filtering, mutual information, or feature importance.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        feat_cfg = config.get("features", {})
        self.selection_enabled = feat_cfg.get("selection_enabled", False)
        self.method = feat_cfg.get("method", "importance")
        self.top_k = feat_cfg.get("top_k_features", 30)
        self.seed = config.get("system", {}).get("seed", 42)
        self.selected_features: List[str] = []
        self.feature_importances_: Dict[str, float] = {}

    def select_features(
        self, X_train: pd.DataFrame, y_train: pd.Series
    ) -> List[str]:
        """
        Identifies optimal subset of network traffic features.
        """
        if not self.selection_enabled or self.top_k >= X_train.shape[1]:
            logger.info(
                f"Feature selection disabled or top_k ({self.top_k}) >= total features ({X_train.shape[1]}). "
                "Retaining all features."
            )
            self.selected_features = list(X_train.columns)
            return self.selected_features

        logger.info(f"Performing feature selection using method='{self.method}', selecting top_{self.top_k} features...")

        if self.method == "importance":
            rf = RandomForestClassifier(n_estimators=50, random_state=self.seed, n_jobs=-1)
            rf.fit(X_train, y_train)
            importances = rf.feature_importances_
            feature_scores = dict(zip(X_train.columns, importances))
            sorted_feats = sorted(feature_scores.items(), key=lambda x: x[1], reverse=True)
            self.feature_importances_ = dict(sorted_feats)
            self.selected_features = [feat for feat, _ in sorted_feats[: self.top_k]]

        elif self.method == "mutual_info":
            mi_scores = mutual_info_classif(X_train, y_train, random_state=self.seed)
            feature_scores = dict(zip(X_train.columns, mi_scores))
            sorted_feats = sorted(feature_scores.items(), key=lambda x: x[1], reverse=True)
            self.feature_importances_ = dict(sorted_feats)
            self.selected_features = [feat for feat, _ in sorted_feats[: self.top_k]]

        elif self.method == "correlation":
            corr_matrix = X_train.corr().abs()
            upper_tri = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
            to_drop = [column for column in upper_tri.columns if any(upper_tri[column] > 0.95)]
            remaining = [col for col in X_train.columns if col not in to_drop]
            self.selected_features = remaining[: self.top_k]

        else:
            logger.warning(f"Unknown feature selection method '{self.method}'. Retaining all features.")
            self.selected_features = list(X_train.columns)

        logger.info(f"Selected top {len(self.selected_features)} features: {self.selected_features[:5]}...")
        return self.selected_features

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Subsets input feature DataFrame to the selected features.
        """
        if not self.selected_features:
            return X

        missing_cols = [col for col in self.selected_features if col not in X.columns]
        if missing_cols:
            raise KeyError(f"Selected features missing from input DataFrame: {missing_cols}")

        return X[self.selected_features]

