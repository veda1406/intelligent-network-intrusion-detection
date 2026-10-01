import os
import tempfile
import pytest
import numpy as np
import pandas as pd
from src.utils.config_loader import load_config
from src.data.loader import DatasetLoader
from src.data.preprocessor import DataPreprocessor
from src.data.sampler import ImbalanceHandler


@pytest.fixture
def sample_config(tmp_path):
    config = {
        "system": {"seed": 42},
        "data": {
            "dataset_name": "CICIDS2017",
            "raw_data_path": str(tmp_path / "sample_dataset.csv"),
            "processed_data_path": str(tmp_path / "processed_data.parquet"),
            "target_column": "Label",
            "classification_mode": "multiclass",
            "test_size": 0.2,
            "val_size": 0.1,
            "stratify": True,
        },
        "preprocessing": {
            "handle_missing": True,
            "missing_strategy": "drop",
            "remove_duplicates": True,
            "infinite_to_nan": True,
            "scaling_method": "standard",
            "categorical_encoding": "onehot",
        },
        "imbalance_handling": {
            "enabled": True,
            "method": "smote",
            "sampling_strategy": "auto",
        },
    }

    # Generate synthetic network flow DataFrame
    np.random.seed(42)
    n_samples = 200
    df = pd.DataFrame(
        {
            " Flow Duration": np.random.exponential(scale=1000, size=n_samples),
            "Total Fwd Packets": np.random.randint(1, 100, size=n_samples),
            "Total Backward Packets": np.random.randint(1, 100, size=n_samples),
            "Flow Bytes/s": np.random.uniform(10, 5000, size=n_samples),
            "Protocol": np.random.choice(["TCP", "UDP", "ICMP"], size=n_samples),
            "Label": np.random.choice(["BENIGN", "DoS", "DDoS", "PortScan"], size=n_samples, p=[0.7, 0.1, 0.1, 0.1]),
        }
    )
    # Add infinite and NaN values to test robustness
    df.loc[5, "Flow Bytes/s"] = np.inf
    df.loc[10, " Flow Duration"] = np.nan

    df.to_csv(config["data"]["raw_data_path"], index=False)
    return config


def test_dataset_loader(sample_config):
    loader = DatasetLoader(sample_config)
    raw_df = loader.load_raw_data()

    assert "Flow Duration" in raw_df.columns, "Whitespace should be trimmed from column names"
    assert len(raw_df) == 200

    train_df, val_df, test_df = loader.split_data(raw_df)
    assert len(train_df) + len(val_df) + len(test_df) == 200
    assert len(train_df) > len(val_df)
    assert len(test_df) == 40  # 20% of 200


def test_data_preprocessor(sample_config, tmp_path):
    loader = DatasetLoader(sample_config)
    raw_df = loader.load_raw_data()
    train_df, val_df, test_df = loader.split_data(raw_df)

    preprocessor = DataPreprocessor(sample_config)
    X_train, y_train = preprocessor.fit_transform(train_df, target_col="Label")

    assert not X_train.isnull().any().any(), "No NaNs should remain after preprocessing"
    assert len(X_train) == len(y_train)
    assert len(preprocessor.classes_) > 1

    # Transform unseen test data
    X_test, y_test = preprocessor.transform(test_df, target_col="Label")
    assert X_test.shape[1] == X_train.shape[1], "Feature columns must match between train and test"

    # Artifact serialization test
    artifact_path = preprocessor.save_artifacts(str(tmp_path / "models"))
    assert os.path.exists(artifact_path)

    new_preprocessor = DataPreprocessor(sample_config)
    new_preprocessor.load_artifacts(artifact_path)
    X_test_new, y_test_new = new_preprocessor.transform(test_df, target_col="Label")
    pd.testing.assert_frame_equal(X_test, X_test_new)


def test_imbalance_handler(sample_config):
    loader = DatasetLoader(sample_config)
    raw_df = loader.load_raw_data()
    train_df, _, _ = loader.split_data(raw_df)

    preprocessor = DataPreprocessor(sample_config)
    X_train, y_train = preprocessor.fit_transform(train_df, target_col="Label")

    sampler = ImbalanceHandler(sample_config)
    X_res, y_res = sampler.resample(X_train, y_train)

    assert len(X_res) >= len(X_train)
    # Check that minority classes were oversampled
    class_counts = y_res.value_counts()
    assert class_counts.min() == class_counts.max()
