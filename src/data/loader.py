import os
from typing import Dict, Any, Tuple
import pandas as pd
from sklearn.model_selection import train_test_split
from src.utils.logger import setup_logger

logger = setup_logger("DatasetLoader")


class DatasetLoader:
    """
    Generic dataset loader supporting configurable paths and split logic.
    Handles dynamic ingestion for dataset formats (CICIDS2017, UNSW-NB15, etc.).
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.raw_data_path = config["data"]["raw_data_path"]
        self.target_column = config["data"]["target_column"]
        self.classification_mode = config["data"].get("classification_mode", "multiclass")
        self.binary_positive_label = config["data"].get("binary_positive_label", "ATTACK")
        self.test_size = config["data"].get("test_size", 0.2)
        self.val_size = config["data"].get("val_size", 0.1)
        self.stratify = config["data"].get("stratify", True)
        self.seed = config.get("system", {}).get("seed", 42)

    def load_raw_data(self) -> pd.DataFrame:
        """
        Loads raw flow data from CSV or Parquet file.
        Strips whitespace from column names to standardize raw headers.
        """
        if not os.path.exists(self.raw_data_path):
            raise FileNotFoundError(f"Raw dataset file not found at: {self.raw_data_path}")

        logger.info(f"Loading raw dataset from {self.raw_data_path}")
        if self.raw_data_path.endswith(".parquet") or self.raw_data_path.endswith(".pqt"):
            df = pd.read_parquet(self.raw_data_path)
        else:
            df = pd.read_csv(self.raw_data_path)

        # Standardize column headers by trimming whitespace
        df.columns = df.columns.str.strip()
        logger.info(f"Successfully loaded dataset with shape: {df.shape}")
        return df

    def split_data(
        self, df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Splits dataset into Train, Validation, and Test sets using stratified sampling
        to prevent data leakage.
        """
        if self.target_column not in df.columns:
            raise KeyError(f"Target column '{self.target_column}' not found in dataframe columns: {list(df.columns)}")

        df = df.copy()

        # Apply binary transformation if specified
        if self.classification_mode == "binary":
            logger.info(f"Applying binary classification encoding (Positive: '{self.binary_positive_label}')")
            df[self.target_column] = df[self.target_column].apply(
                lambda val: self.binary_positive_label if str(val).upper() != "BENIGN" else "BENIGN"
            )

        target = df[self.target_column]
        stratify_labels = target if self.stratify else None

        # First split: train+val vs test
        train_val_df, test_df = train_test_split(
            df,
            test_size=self.test_size,
            random_state=self.seed,
            stratify=stratify_labels,
        )

        # Calculate adjusted validation size relative to train_val pool
        adjusted_val_size = self.val_size / (1.0 - self.test_size)
        val_stratify = train_val_df[self.target_column] if self.stratify else None

        train_df, val_df = train_test_split(
            train_val_df,
            test_size=adjusted_val_size,
            random_state=self.seed,
            stratify=val_stratify,
        )

        logger.info(
            f"Data split complete - Train: {train_df.shape[0]}, "
            f"Val: {val_df.shape[0]}, Test: {test_df.shape[0]}"
        )
        return train_df, val_df, test_df

