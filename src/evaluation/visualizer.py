import os
from typing import Dict, Any, List
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, auc
from sklearn.preprocessing import label_binarize
from src.utils.logger import setup_logger

logger = setup_logger("MetricVisualizer")


class MetricVisualizer:
    """
    Renders diagnostic charts:
    - Confusion Matrix Heatmaps
    - ROC & Precision-Recall Curves
    - Per-class Recall/Precision comparison charts
    """

    def __init__(self, output_dir: str = "reports/figures"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def plot_confusion_matrix(
        self, cm: np.ndarray, labels: List[str], title: str = "Confusion Matrix", filename: str = "confusion_matrix.png"
    ) -> str:
        """Plots and saves confusion matrix heatmap."""
        plt.figure(figsize=(8, 6))
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=labels,
            yticklabels=labels,
        )
        plt.title(title, fontsize=14, fontweight="bold")
        plt.xlabel("Predicted Class", fontsize=12)
        plt.ylabel("Actual Class", fontsize=12)
        plt.tight_layout()

        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Saved confusion matrix plot to: {save_path}")
        return save_path

    def plot_roc_curves(
        self, y_true: np.ndarray, y_prob: np.ndarray, labels: List[str], filename: str = "roc_curves.png"
    ) -> str:
        """Plots and saves ROC-AUC curves for single or multiclass labels."""
        plt.figure(figsize=(8, 6))
        n_classes = len(labels)

        if n_classes == 2 or y_prob.ndim == 1 or y_prob.shape[1] == 1:
            prob_col = y_prob[:, 1] if y_prob.ndim > 1 else y_prob
            fpr, tpr, _ = roc_curve(y_true, prob_col)
            roc_auc_val = auc(fpr, tpr)
            plt.plot(fpr, tpr, label=f"Binary ROC (AUC = {roc_auc_val:.3f})", lw=2)
        else:
            y_true_bin = label_binarize(y_true, classes=list(range(n_classes)))
            for i in range(n_classes):
                fpr, tpr, _ = roc_curve(y_true_bin[:, i], y_prob[:, i])
                roc_auc_val = auc(fpr, tpr)
                label_name = labels[i] if i < len(labels) else f"Class {i}"
                plt.plot(fpr, tpr, label=f"{label_name} (AUC = {roc_auc_val:.3f})", lw=1.5)

        plt.plot([0, 1], [0, 1], "k--", lw=1.5, label="Random Guess")
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel("False Positive Rate (FPR)", fontsize=12)
        plt.ylabel("True Positive Rate (TPR / Recall)", fontsize=12)
        plt.title("Receiver Operating Characteristic (ROC) Curves", fontsize=14, fontweight="bold")
        plt.legend(loc="lower right", fontsize=10)
        plt.tight_layout()

        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Saved ROC curves plot to: {save_path}")
        return save_path

