from typing import Dict, Any, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    classification_report,
)
from src.utils.logger import setup_logger

logger = setup_logger("ModelEvaluator")


class ModelEvaluator:
    """
    Evaluation framework focusing on cybersecurity-critical intrusion metrics:
    - Accuracy, Precision, Recall, F1-Score
    - False Positive Rate (FPR) & False Negative Rate (FNR)
    - Confusion Matrix
    - ROC-AUC (where applicable)
    - Per-class metrics breakdown for multiclass intrusion labels
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config

    def evaluate(
        self, y_true: np.ndarray, y_pred: np.ndarray, y_prob: Optional[np.ndarray] = None
    ) -> Dict[str, Any]:
        """
        Computes evaluation metrics prioritizing Recall and False Negative Rate (FNR).
        """
        logger.info("Computing intrusion evaluation metrics (Recall & False Negatives prioritized)...")

        acc = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
        rec = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
        f1 = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

        cm = confusion_matrix(y_true, y_pred)

        # Calculate FPR and FNR
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
            fpr = float(fp / (fp + tn + 1e-6))
            fnr = float(fn / (fn + tp + 1e-6))
        else:
            # Multiclass micro-average FPR and FNR
            FP = cm.sum(axis=0) - np.diag(cm)
            FN = cm.sum(axis=1) - np.diag(cm)
            TP = np.diag(cm)
            TN = cm.sum() - (FP + FN + TP)

            fpr = float(np.mean(FP / (FP + TN + 1e-6)))
            fnr = float(np.mean(FN / (FN + TP + 1e-6)))

        roc_auc = None
        if y_prob is not None:
            try:
                if len(np.unique(y_true)) == 2:
                    if y_prob.ndim > 1 and y_prob.shape[1] == 2:
                        roc_auc = float(roc_auc_score(y_true, y_prob[:, 1]))
                    else:
                        roc_auc = float(roc_auc_score(y_true, y_prob))
                else:
                    roc_auc = float(roc_auc_score(y_true, y_prob, multi_class="ovr"))
            except Exception as e:
                logger.warning(f"Could not compute ROC-AUC score: {e}")

        report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)

        metrics_result = {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "false_positive_rate": fpr,
            "false_negative_rate": fnr,
            "roc_auc": roc_auc,
            "confusion_matrix": cm.tolist(),
            "per_class_report": report,
        }

        logger.info(
            f"Evaluation complete - Accuracy: {acc:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}, FNR: {fnr:.4f}, FPR: {fpr:.4f}"
        )
        return metrics_result

