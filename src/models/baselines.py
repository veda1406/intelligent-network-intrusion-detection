from typing import Dict, Any
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from src.utils.logger import setup_logger

logger = setup_logger("BaselineModels")


class BaselineModels:
    """
    Factory & trainer for traditional Machine Learning baseline models:
    - Logistic Regression
    - Decision Tree
    - Random Forest
    - Support Vector Machine (SVM)
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.models_cfg = config.get("models", {})
        self.seed = config.get("system", {}).get("seed", 42)

    def build_logistic_regression(self) -> LogisticRegression:
        """Instantiates Logistic Regression with configured hyperparams."""
        lr_cfg = self.models_cfg.get("logistic_regression", {})
        model = LogisticRegression(
            max_iter=lr_cfg.get("max_iter", 1000),
            C=lr_cfg.get("C", 1.0),
            solver=lr_cfg.get("solver", "lbfgs"),
            random_state=self.seed,
        )
        logger.info(f"Initialized LogisticRegression: {model}")
        return model

    def build_decision_tree(self) -> DecisionTreeClassifier:
        """Instantiates Decision Tree Classifier with configured hyperparams."""
        dt_cfg = self.models_cfg.get("decision_tree", {})
        model = DecisionTreeClassifier(
            max_depth=dt_cfg.get("max_depth", 15),
            criterion=dt_cfg.get("criterion", "gini"),
            random_state=self.seed,
        )
        logger.info(f"Initialized DecisionTreeClassifier: {model}")
        return model

    def build_random_forest(self) -> RandomForestClassifier:
        """Instantiates Random Forest Classifier with configured hyperparams."""
        rf_cfg = self.models_cfg.get("random_forest", {})
        model = RandomForestClassifier(
            n_estimators=rf_cfg.get("n_estimators", 100),
            max_depth=rf_cfg.get("max_depth", 20),
            random_state=rf_cfg.get("random_state", self.seed),
            n_jobs=-1,
        )
        logger.info(f"Initialized RandomForestClassifier: {model}")
        return model

    def build_svm(self) -> SVC:
        """Instantiates SVM Classifier with configured hyperparams."""
        svm_cfg = self.models_cfg.get("svm", {})
        model = SVC(
            kernel=svm_cfg.get("kernel", "rbf"),
            C=svm_cfg.get("C", 1.0),
            probability=svm_cfg.get("probability", True),
            random_state=self.seed,
        )
        logger.info(f"Initialized SVC: {model}")
        return model

    def get_all_baselines(self) -> Dict[str, Any]:
        """Returns a dictionary of all un-trained baseline models."""
        return {
            "logistic_regression": self.build_logistic_regression(),
            "decision_tree": self.build_decision_tree(),
            "random_forest": self.build_random_forest(),
            "svm": self.build_svm(),
        }


    def train_all(
        self, X_train: Any, y_train: Any, sample_weight: Any = None
    ) -> Dict[str, Any]:
        """Trains all baseline models and returns the trained instances."""
        trained_models = {}
        baselines = self.get_all_baselines()

        for name, model in baselines.items():
            logger.info(f"Training baseline model '{name}'...")
            if sample_weight is not None and hasattr(model, "fit"):
                try:
                    model.fit(X_train, y_train, sample_weight=sample_weight)
                except TypeError:
                    model.fit(X_train, y_train)
            else:
                model.fit(X_train, y_train)

            trained_models[name] = model
            logger.info(f"Model '{name}' training complete.")

        return trained_models

