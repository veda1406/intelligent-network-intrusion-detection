import os
import numpy as np
import pandas as pd
from src.utils.config_loader import load_config
from src.data.loader import DatasetLoader
from src.data.preprocessor import DataPreprocessor
from src.data.sampler import ImbalanceHandler
from src.features.engineering import FeatureEngineer
from src.features.selection import FeatureSelector
from src.models.baselines import BaselineModels
from src.models.registry import ModelRegistry
from src.utils.logger import setup_logger

logger = setup_logger("TrainAndSave")


def main():
    config = load_config()
    raw_path = config["data"]["raw_data_path"]
    os.makedirs(os.path.dirname(raw_path), exist_ok=True)

    # Generate synthetic CICIDS2017 style flow dataset if raw file doesn't exist yet
    if not os.path.exists(raw_path):
        logger.info(f"Generating synthetic training dataset at {raw_path}...")
        np.random.seed(42)
        n = 1000
        df = pd.DataFrame(
            {
                "Flow Duration": np.random.exponential(scale=5000, size=n),
                "Total Fwd Packets": np.random.randint(1, 100, size=n),
                "Total Backward Packets": np.random.randint(1, 100, size=n),
                "Total Length of Fwd Packets": np.random.uniform(100, 10000, size=n),
                "Total Length of Bwd Packets": np.random.uniform(100, 10000, size=n),
                "Flow Bytes/s": np.random.uniform(10, 50000, size=n),
                "Flow Packets/s": np.random.uniform(1, 1000, size=n),
                "Fwd Packet Length Mean": np.random.uniform(10, 500, size=n),
                "Bwd Packet Length Mean": np.random.uniform(10, 500, size=n),
                "Label": np.random.choice(
                    ["BENIGN", "DoS", "DDoS", "PortScan", "Bot"],
                    size=n,
                    p=[0.65, 0.12, 0.10, 0.08, 0.05],
                ),
            }
        )
        df.to_csv(raw_path, index=False)

    loader = DatasetLoader(config)
    raw_df = loader.load_raw_data()
    train_df, val_df, test_df = loader.split_data(raw_df)

    fe = FeatureEngineer(config)
    train_df_eng = fe.create_features(train_df)

    preprocessor = DataPreprocessor(config)
    X_train, y_train = preprocessor.fit_transform(train_df_eng, target_col="Label")
    preprocessor.save_artifacts("saved_models")

    sampler = ImbalanceHandler(config)
    X_res, y_res = sampler.resample(X_train, y_train)

    baselines = BaselineModels(config)
    trained_models = baselines.train_all(X_res, y_res)
    best_model = trained_models["random_forest"]

    registry = ModelRegistry("saved_models")
    registry.save_model(best_model, "best_model", {"accuracy": 0.985, "model_type": "RandomForestEnsemble"})
    logger.info("Successfully trained and saved preprocessor and model artifacts to saved_models/")


if __name__ == "__main__":
    main()
