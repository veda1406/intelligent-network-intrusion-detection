import pytest
import numpy as np
import pandas as pd
from src.features.engineering import FeatureEngineer
from src.features.selection import FeatureSelector


@pytest.fixture
def sample_features_df():
    np.random.seed(42)
    n = 100
    df = pd.DataFrame(
        {
            "Total Fwd Packets": np.random.randint(1, 50, size=n),
            "Total Backward Packets": np.random.randint(1, 50, size=n),
            "Total Length of Fwd Packets": np.random.uniform(100, 5000, size=n),
            "Total Length of Bwd Packets": np.random.uniform(100, 5000, size=n),
            "Flow Duration": np.random.uniform(1000, 100000, size=n),
            "Flow Bytes/s": np.random.uniform(10, 1000, size=n),
            "Flow Packets/s": np.random.uniform(1, 100, size=n),
            "Noise_1": np.random.normal(0, 1, size=n),
            "Noise_2": np.random.normal(0, 1, size=n),
            "Label": np.random.choice([0, 1], size=n),
        }
    )
    return df


def test_feature_engineer(sample_features_df):
    config = {}
    fe = FeatureEngineer(config)
    df_engineered = fe.create_features(sample_features_df)

    assert "Fwd_Bwd_Pkt_Ratio" in df_engineered.columns
    assert "Fwd_Bwd_Byte_Ratio" in df_engineered.columns
    assert "Pkt_Per_Microsec" in df_engineered.columns
    assert "Payload_Byte_Per_Pkt" in df_engineered.columns
    assert "Log_Flow_Duration" in df_engineered.columns
    assert df_engineered.shape[1] > sample_features_df.shape[1]


def test_feature_selector_importance(sample_features_df):
    config = {
        "system": {"seed": 42},
        "features": {
            "selection_enabled": True,
            "method": "importance",
            "top_k_features": 4,
        },
    }
    X = sample_features_df.drop(columns=["Label"])
    y = sample_features_df["Label"]

    fs = FeatureSelector(config)
    selected = fs.select_features(X, y)

    assert len(selected) == 4
    X_trans = fs.transform(X)
    assert X_trans.shape[1] == 4
    assert list(X_trans.columns) == selected


def test_feature_selector_mutual_info(sample_features_df):
    config = {
        "system": {"seed": 42},
        "features": {
            "selection_enabled": True,
            "method": "mutual_info",
            "top_k_features": 3,
        },
    }
    X = sample_features_df.drop(columns=["Label"])
    y = sample_features_df["Label"]

    fs = FeatureSelector(config)
    selected = fs.select_features(X, y)

    assert len(selected) == 3
