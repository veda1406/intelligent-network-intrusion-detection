from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.utils.class_weight import compute_class_weight
from src.utils.logger import setup_logger

try:
    from imblearn.over_sampling import SMOTE, RandomOverSampler
    from imblearn.under_sampling import RandomUnderSampler
    HAS_IMBLEARN = True
except ImportError:
    HAS_IMBLEARN = False

logger = setup_logger("ImbalanceHandler")


class ImbalanceHandler:
    """
    Handles class imbalance in network traffic datasets (e.g. SMOTE, Random Oversampling, Class Weighting).
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        imb_cfg = config.get("imbalance_handling", {})
        self.enabled = imb_cfg.get("enabled", True)
        self.method = imb_cfg.get("method", "smote")
        self.sampling_strategy = imb_cfg.get("sampling_strategy", "auto")
        self.seed = config.get("system", {}).get("seed", 42)
        self.class_weights: Dict[int, float] = {}

    def _fallback_random_over(self, X: pd.DataFrame, y: pd.Series) -> Tuple[pd.DataFrame, pd.Series]:
        """Custom fallback for Random Oversampling when imblearn is not installed."""
        np.random.seed(self.seed)
        class_counts = y.value_counts()
        target_count = class_counts.max()

        res_X_list, res_y_list = [], []
        for cls, count in class_counts.items():
            cls_idx = y[y == cls].index
            if count < target_count:
                sampled_idx = np.random.choice(cls_idx, size=target_count, replace=True)
            else:
                sampled_idx = cls_idx
            res_X_list.append(X.loc[sampled_idx])
            res_y_list.append(y.loc[sampled_idx])

        return pd.concat(res_X_list, axis=0).reset_index(drop=True), pd.concat(res_y_list, axis=0).reset_index(drop=True)

    def _fallback_random_under(self, X: pd.DataFrame, y: pd.Series) -> Tuple[pd.DataFrame, pd.Series]:
        """Custom fallback for Random Undersampling when imblearn is not installed."""
        np.random.seed(self.seed)
        class_counts = y.value_counts()
        target_count = class_counts.min()

        res_X_list, res_y_list = [], []
        for cls, count in class_counts.items():
            cls_idx = y[y == cls].index
            sampled_idx = np.random.choice(cls_idx, size=target_count, replace=False)
            res_X_list.append(X.loc[sampled_idx])
            res_y_list.append(y.loc[sampled_idx])

        return pd.concat(res_X_list, axis=0).reset_index(drop=True), pd.concat(res_y_list, axis=0).reset_index(drop=True)

    def resample(
        self, X_train: pd.DataFrame, y_train: pd.Series
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Applies resampling strictly to training set features and target labels to prevent data leakage.
        """
        if not self.enabled:
            logger.info("Imbalance handling is disabled in config. Returning original training data.")
            return X_train, y_train

        logger.info(f"Applying class imbalance handling method: '{self.method}'")
        class_counts = y_train.value_counts()
        min_class_count = class_counts.min()

        if self.method == "smote":
            if not HAS_IMBLEARN:
                logger.warning("imbalanced-learn library not found. Falling back to custom Random Oversampling.")
                return self._fallback_random_over(X_train, y_train)

            if min_class_count <= 1:
                logger.warning(f"Smallest class has only {min_class_count} sample(s). Falling back to RandomOverSampler.")
                sampler = RandomOverSampler(sampling_strategy=self.sampling_strategy, random_state=self.seed)
            else:
                k_neighbors = min(5, min_class_count - 1)
                sampler = SMOTE(sampling_strategy=self.sampling_strategy, k_neighbors=k_neighbors, random_state=self.seed)

            X_res, y_res = sampler.fit_resample(X_train, y_train)

        elif self.method == "random_over":
            if not HAS_IMBLEARN:
                return self._fallback_random_over(X_train, y_train)
            sampler = RandomOverSampler(sampling_strategy=self.sampling_strategy, random_state=self.seed)
            X_res, y_res = sampler.fit_resample(X_train, y_train)

        elif self.method == "random_under":
            if not HAS_IMBLEARN:
                return self._fallback_random_under(X_train, y_train)
            sampler = RandomUnderSampler(sampling_strategy=self.sampling_strategy, random_state=self.seed)
            X_res, y_res = sampler.fit_resample(X_train, y_train)

        elif self.method == "class_weights":
            unique_classes = np.unique(y_train)
            weights = compute_class_weight(class_weight="balanced", classes=unique_classes, y=y_train)
            self.class_weights = dict(zip(unique_classes, weights))
            logger.info(f"Calculated balanced class weights: {self.class_weights}")
            return X_train, y_train

        else:
            logger.warning(f"Unknown imbalance handling method '{self.method}'. Returning original training data.")
            return X_train, y_train

        # Reconstruct pandas data structures preserving column names and target name
        X_res_df = pd.DataFrame(X_res, columns=X_train.columns)
        y_res_series = pd.Series(y_res, name=y_train.name)

        logger.info(
            f"Resampling complete. Original samples: {len(X_train)} -> Resampled samples: {len(X_res_df)}"
        )
        return X_res_df, y_res_series


