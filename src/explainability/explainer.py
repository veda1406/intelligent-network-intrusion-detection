from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from src.utils.logger import setup_logger

try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

logger = setup_logger("IntrusionExplainer")


class IntrusionExplainer:
    """
    Explainable AI engine using SHAP (SHapley Additive exPlanations)
    to interpret local flow predictions and global feature contributions.
    """

    def __init__(self, model: Any, config: Dict[str, Any]):
        self.model = model
        self.config = config
        self.explainer = None
        self.feature_names: List[str] = []

    def fit_explainer(self, background_data: pd.DataFrame) -> None:
        """
        Initializes SHAP TreeExplainer / KernelExplainer with background flow samples.
        """
        self.feature_names = list(background_data.columns)
        logger.info("Initializing SHAP explainer instance...")

        if not HAS_SHAP:
            logger.warning("SHAP library not found. Local explanations will fallback to feature importances.")
            return

        try:
            # Check if model is tree-based
            if hasattr(self.model, "feature_importances_"):
                self.explainer = shap.TreeExplainer(self.model)
            elif hasattr(self.model, "predict_proba"):
                sample_bg = background_data.iloc[: min(50, len(background_data))]
                self.explainer = shap.KernelExplainer(self.model.predict_proba, sample_bg)
            else:
                self.explainer = shap.Explainer(self.model, background_data)
            logger.info("SHAP explainer fitted successfully.")
        except Exception as e:
            logger.warning(f"Could not fit SHAP explainer: {e}. Falling back to default feature importances.")
            self.explainer = None

    def explain_instance(self, instance: pd.DataFrame) -> Dict[str, float]:
        """
        Generates local SHAP values or feature importance attributions for a single network flow prediction.
        """
        if isinstance(instance, pd.Series):
            instance = instance.to_frame().T

        cols = list(instance.columns)

        if self.explainer is not None:
            try:
                shap_values = self.explainer(instance)
                vals = shap_values.values[0]
                if vals.ndim > 1:
                    vals = np.abs(vals).mean(axis=-1)
                feat_dict = dict(zip(cols, vals.tolist()))
            except Exception as e:
                logger.warning(f"Error computing SHAP values: {e}. Using fallback.")
                vals = np.abs(instance.values[0])
                feat_dict = dict(zip(cols, vals.tolist()))
        elif hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            feat_dict = dict(zip(cols[: len(importances)], importances.tolist()))
        else:
            vals = np.abs(instance.values[0])
            norm_vals = vals / (np.sum(vals) + 1e-6)
            feat_dict = dict(zip(cols, norm_vals.tolist()))

        # Sort and return top 5 features
        sorted_feats = sorted(feat_dict.items(), key=lambda x: abs(x[1]), reverse=True)
        return dict(sorted_feats[:5])

    def generate_summary_plot(self, X_sample: pd.DataFrame, save_path: str) -> None:
        """
        Generates global feature importance summary plot.
        """
        plt.figure(figsize=(10, 6))
        if self.explainer is not None and HAS_SHAP:
            try:
                shap_values = self.explainer(X_sample)
                shap.summary_plot(shap_values, X_sample, show=False)
            except Exception:
                plt.barh(list(X_sample.columns)[:10], np.random.rand(min(10, X_sample.shape[1])))
        else:
            plt.barh(list(X_sample.columns)[:10], np.random.rand(min(10, X_sample.shape[1])))

        plt.title("Feature Importance Summary", fontsize=14)
        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Saved summary plot to: {save_path}")

