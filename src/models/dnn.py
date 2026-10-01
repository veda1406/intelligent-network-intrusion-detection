from typing import Dict, Any, Optional, Tuple
import os
import numpy as np
import pandas as pd
from sklearn.neural_network import MLPClassifier
from src.utils.logger import setup_logger

try:
    import tensorflow as tf
    from tensorflow.keras import layers, models, optimizers, callbacks
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False

logger = setup_logger("DeepNeuralNetwork")


class DeepNeuralNetwork:
    """
    Deep Neural Network Architecture:
    - TensorFlow/Keras 4-layer DNN (Input -> Dense(128) -> Dense(64) -> Dense(32) -> Output)
    - Fallback: Scikit-learn MLPClassifier if TensorFlow is unavailable.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        dnn_cfg = config.get("models", {}).get("dnn", {})
        self.hidden_units = tuple(dnn_cfg.get("hidden_units", [128, 64, 32]))
        self.activation = dnn_cfg.get("activation", "relu")
        self.dropout_rate = dnn_cfg.get("dropout_rate", 0.3)
        self.use_batch_norm = dnn_cfg.get("use_batch_norm", True)
        self.learning_rate = dnn_cfg.get("learning_rate", 0.001)
        self.batch_size = dnn_cfg.get("batch_size", 256)
        self.epochs = dnn_cfg.get("epochs", 50)
        self.patience = dnn_cfg.get("early_stopping_patience", 10)
        self.seed = config.get("system", {}).get("seed", 42)

        if HAS_TENSORFLOW:
            tf.random.set_seed(self.seed)

        self.model: Any = None
        self.history = None
        self.classes_: np.ndarray = np.array([])
        self.is_tf = HAS_TENSORFLOW

    def build_model(
        self, input_dim: int, num_classes: int, mode: str = "multiclass"
    ) -> Any:
        """
        Builds Keras DNN model (or MLPClassifier fallback) based on input dimensions.
        """
        logger.info(f"Designing DNN Architecture (TensorFlow={self.is_tf}) for mode={mode}, input_dim={input_dim}")

        if self.is_tf:
            model = models.Sequential()
            model.add(layers.Input(shape=(input_dim,)))

            for idx, units in enumerate(self.hidden_units):
                model.add(layers.Dense(units, activation=self.activation, name=f"dense_{idx+1}"))
                if self.use_batch_norm and idx < len(self.hidden_units) - 1:
                    model.add(layers.BatchNormalization(name=f"batch_norm_{idx+1}"))
                if self.dropout_rate > 0 and idx < len(self.hidden_units) - 1:
                    model.add(layers.Dropout(self.dropout_rate, name=f"dropout_{idx+1}"))

            if mode == "binary" or num_classes <= 2:
                model.add(layers.Dense(1, activation="sigmoid", name="output_layer"))
                loss = "binary_crossentropy"
                metrics = ["accuracy", tf.keras.metrics.AUC(name="auc")]
            else:
                model.add(layers.Dense(num_classes, activation="softmax", name="output_layer"))
                loss = "sparse_categorical_crossentropy"
                metrics = ["accuracy"]

            optimizer = optimizers.Adam(learning_rate=self.learning_rate)
            model.compile(optimizer=optimizer, loss=loss, metrics=metrics)
            self.model = model
        else:
            logger.warning("TensorFlow not detected. Instantiating Scikit-learn MLPClassifier fallback.")
            self.model = MLPClassifier(
                hidden_layer_sizes=self.hidden_units,
                activation=self.activation,
                learning_rate_init=self.learning_rate,
                max_iter=self.epochs,
                random_state=self.seed,
                early_stopping=True,
                n_iter_no_change=self.patience,
            )

        return self.model

    def fit(
        self,
        X_train: Any,
        y_train: Any,
        validation_data: Optional[Tuple[Any, Any]] = None,
        class_weight: Optional[Dict[int, float]] = None,
    ):
        """
        Trains the DNN model.
        """
        if isinstance(X_train, (pd.DataFrame, pd.Series)):
            X_train = X_train.values
        if isinstance(y_train, (pd.DataFrame, pd.Series)):
            y_train = y_train.values

        input_dim = X_train.shape[1]
        self.classes_ = np.unique(y_train)
        num_classes = len(self.classes_)
        mode = self.config.get("data", {}).get("classification_mode", "multiclass")

        if self.model is None:
            self.build_model(input_dim=input_dim, num_classes=num_classes, mode=mode)

        logger.info(f"Starting DNN training for up to {self.epochs} epochs...")

        if self.is_tf:
            cb_list = [
                callbacks.EarlyStopping(monitor="val_loss" if validation_data else "loss", patience=self.patience, restore_best_weights=True),
                callbacks.ReduceLROnPlateau(monitor="val_loss" if validation_data else "loss", factor=0.5, patience=5, min_lr=1e-6),
            ]

            if validation_data:
                val_X, val_y = validation_data
                if isinstance(val_X, (pd.DataFrame, pd.Series)):
                    val_X = val_X.values
                if isinstance(val_y, (pd.DataFrame, pd.Series)):
                    val_y = val_y.values
                validation_data = (val_X, val_y)

            self.history = self.model.fit(
                X_train,
                y_train,
                epochs=self.epochs,
                batch_size=self.batch_size,
                validation_data=validation_data,
                class_weight=class_weight,
                callbacks=cb_list,
                verbose=1,
            )
        else:
            self.model.fit(X_train, y_train)

        return self

    def predict_proba(self, X: Any) -> np.ndarray:
        """
        Returns class probabilities for inputs X.
        """
        if self.model is None:
            raise RuntimeError("DNN model is not fitted yet.")

        if isinstance(X, (pd.DataFrame, pd.Series)):
            X = X.values

        if self.is_tf:
            preds = self.model.predict(X, verbose=0)
            if preds.ndim == 1 or preds.shape[1] == 1:
                preds_binary = preds.flatten()
                return np.vstack([1.0 - preds_binary, preds_binary]).T
            return preds
        else:
            return self.model.predict_proba(X)

    def predict(self, X: Any) -> np.ndarray:
        """
        Returns predicted class labels for inputs X.
        """
        if self.is_tf:
            probs = self.predict_proba(X)
            return np.argmax(probs, axis=1)
        else:
            if isinstance(X, (pd.DataFrame, pd.Series)):
                X = X.values
            return self.model.predict(X)


