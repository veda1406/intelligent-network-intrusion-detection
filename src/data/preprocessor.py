import os
from typing import Dict, Any, Tuple, Optional, List
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer
from src.utils.logger import setup_logger

logger = setup_logger("DataPreprocessor")


class DataPreprocessor:
    """
    Modular Data Preprocessor that handles missing value treatment, feature scaling,
    categorical encoding, and target label transformation without dataset-specific hardcoding.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        prep_cfg = config.get("preprocessing", {})
        self.handle_missing = prep_cfg.get("handle_missing", True)
        self.missing_strategy = prep_cfg.get("missing_strategy", "drop")
        self.remove_duplicates = prep_cfg.get("remove_duplicates", True)
        self.infinite_to_nan = prep_cfg.get("infinite_to_nan", True)
        self.scaling_method = prep_cfg.get("scaling_method", "standard")
        self.categorical_encoding = prep_cfg.get("categorical_encoding", "onehot")

        self.scaler = None
        self.encoder = None
        self.imputer = None
        self.label_encoder = LabelEncoder()
        self.num_cols: List[str] = []
        self.cat_cols: List[str] = []
        self.feature_names: List[str] = []
        self.classes_: np.ndarray = np.array([])

    def _get_scaler(self):
        if self.scaling_method == "minmax":
            return MinMaxScaler()
        elif self.scaling_method == "robust":
            return RobustScaler()
        else:
            return StandardScaler()

    def clean_df(self, df: pd.DataFrame, is_training: bool = False) -> pd.DataFrame:
        """
        Cleans data frame by replacing inf values, removing duplicates, and handling missing data.
        """
        df = df.copy()

        if self.infinite_to_nan:
            df.replace([np.inf, -np.inf], np.nan, inplace=True)

        if is_training and self.remove_duplicates:
            before_len = len(df)
            df.drop_duplicates(inplace=True)
            logger.info(f"Removed {before_len - len(df)} duplicate rows during training cleaning.")

        return df

    def fit_transform(
        self, train_df: pd.DataFrame, target_col: str
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Fit scaling and encoding state ONLY on the training split to prevent data leakage.
        """
        logger.info("Fitting preprocessor state on training data...")
        df = self.clean_df(train_df, is_training=True)

        if target_col not in df.columns:
            raise KeyError(f"Target column '{target_col}' missing from training DataFrame.")

        X = df.drop(columns=[target_col])
        y_raw = df[target_col]

        # Handle missing values in X
        if self.handle_missing:
            if self.missing_strategy == "drop":
                valid_idx = X.dropna().index
                X = X.loc[valid_idx]
                y_raw = y_raw.loc[valid_idx]
            else:
                self.imputer = SimpleImputer(strategy=self.missing_strategy)

        # Separate numeric and categorical features
        self.num_cols = list(X.select_dtypes(include=[np.number]).columns)
        self.cat_cols = list(X.select_dtypes(exclude=[np.number]).columns)

        logger.info(f"Identified {len(self.num_cols)} numerical features and {len(self.cat_cols)} categorical features.")

        # Fit Target Encoder
        y_encoded = pd.Series(self.label_encoder.fit_transform(y_raw), index=y_raw.index, name=target_col)
        self.classes_ = self.label_encoder.classes_
        logger.info(f"Target classes encoded: {list(self.classes_)}")

        # Fit Numerical Imputer and Scaler
        X_num_processed = None
        if self.num_cols:
            X_num = X[self.num_cols]
            if self.imputer is not None:
                X_num = pd.DataFrame(self.imputer.fit_transform(X_num), columns=self.num_cols, index=X_num.index)
            self.scaler = self._get_scaler()
            X_num_scaled = self.scaler.fit_transform(X_num)
            X_num_processed = pd.DataFrame(X_num_scaled, columns=self.num_cols, index=X.index)

        # Fit Categorical Encoder
        X_cat_processed = None
        if self.cat_cols:
            if self.categorical_encoding == "onehot":
                self.encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
                X_cat_encoded = self.encoder.fit_transform(X[self.cat_cols])
                encoded_names = list(self.encoder.get_feature_names_out(self.cat_cols))
                X_cat_processed = pd.DataFrame(X_cat_encoded, columns=encoded_names, index=X.index)

        # Combine processed features
        if X_num_processed is not None and X_cat_processed is not None:
            X_out = pd.concat([X_num_processed, X_cat_processed], axis=1)
        elif X_num_processed is not None:
            X_out = X_num_processed
        elif X_cat_processed is not None:
            X_out = X_cat_processed
        else:
            raise ValueError("No valid features found in dataset after cleaning.")

        self.feature_names = list(X_out.columns)
        logger.info(f"Preprocessor fit_transform completed. Final feature space dimension: {X_out.shape[1]}")
        return X_out, y_encoded

    def transform(
        self, df: pd.DataFrame, target_col: Optional[str] = None
    ) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        """
        Transform unseen validation/test data using fitted scaler and encoder artifacts.
        """
        if self.scaler is None and self.encoder is None:
            raise RuntimeError("Preprocessor has not been fitted yet. Call fit_transform first or load artifacts.")

        df = self.clean_df(df, is_training=False)
        y_encoded = None

        if target_col and target_col in df.columns:
            y_raw = df[target_col]
            y_encoded = pd.Series(self.label_encoder.transform(y_raw), index=y_raw.index, name=target_col)
            X = df.drop(columns=[target_col])
        else:
            X = df

        X_num_processed = None
        if self.num_cols:
            X_num = X[self.num_cols]
            if self.imputer is not None:
                X_num = pd.DataFrame(self.imputer.transform(X_num), columns=self.num_cols, index=X_num.index)
            else:
                X_num = X_num.fillna(0.0)
            X_num_scaled = self.scaler.transform(X_num)
            X_num_processed = pd.DataFrame(X_num_scaled, columns=self.num_cols, index=X.index)

        X_cat_processed = None
        if self.cat_cols:
            if self.encoder is not None:
                X_cat_encoded = self.encoder.transform(X[self.cat_cols])
                encoded_names = list(self.encoder.get_feature_names_out(self.cat_cols))
                X_cat_processed = pd.DataFrame(X_cat_encoded, columns=encoded_names, index=X.index)

        if X_num_processed is not None and X_cat_processed is not None:
            X_out = pd.concat([X_num_processed, X_cat_processed], axis=1)
        elif X_num_processed is not None:
            X_out = X_num_processed
        else:
            X_out = X_cat_processed

        return X_out, y_encoded

    def save_artifacts(self, artifact_dir: str = "saved_models") -> str:
        """
        Persist fitted preprocessors (scalers, encoders) to disk separately from model weights.
        """
        os.makedirs(artifact_dir, exist_ok=True)
        artifact_path = os.path.join(artifact_dir, "preprocessor.pkl")
        state = {
            "scaler": self.scaler,
            "encoder": self.encoder,
            "imputer": self.imputer,
            "label_encoder": self.label_encoder,
            "num_cols": self.num_cols,
            "cat_cols": self.cat_cols,
            "feature_names": self.feature_names,
            "classes_": self.classes_,
        }
        joblib.dump(state, artifact_path)
        logger.info(f"Saved preprocessor artifacts to: {artifact_path}")
        return artifact_path

    def load_artifacts(self, artifact_path: str = "saved_models/preprocessor.pkl") -> None:
        """
        Loads fitted preprocessor state from saved artifact file.
        """
        if not os.path.exists(artifact_path):
            raise FileNotFoundError(f"Preprocessor artifact file not found at: {artifact_path}")

        state = joblib.load(artifact_path)
        self.scaler = state["scaler"]
        self.encoder = state["encoder"]
        self.imputer = state.get("imputer", None)
        self.label_encoder = state["label_encoder"]
        self.num_cols = state["num_cols"]
        self.cat_cols = state["cat_cols"]
        self.feature_names = state["feature_names"]
        self.classes_ = state["classes_"]
        logger.info(f"Successfully loaded preprocessor artifacts from: {artifact_path}")

