import os
import json
from typing import Any, Dict, Optional, Tuple
import joblib
from src.utils.logger import setup_logger

logger = setup_logger("ModelRegistry")


class ModelRegistry:
    """
    Manages saving and loading trained ML models, DNN artifacts, and metadata.
    """

    def __init__(self, artifacts_dir: str = "saved_models"):
        self.artifacts_dir = artifacts_dir
        os.makedirs(self.artifacts_dir, exist_ok=True)

    def save_model(self, model: Any, model_name: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Saves a trained model instance to the artifacts directory along with JSON metadata.
        """
        model_path = os.path.join(self.artifacts_dir, f"{model_name}.pkl")
        meta_path = os.path.join(self.artifacts_dir, f"{model_name}_meta.json")

        joblib.dump(model, model_path)

        meta = metadata or {}
        meta["model_name"] = model_name
        meta["saved_file"] = os.path.basename(model_path)

        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        logger.info(f"Saved model '{model_name}' to {model_path} with metadata to {meta_path}")
        return model_path

    def load_model(self, model_name: str) -> Tuple[Any, Dict[str, Any]]:
        """
        Loads a trained model artifact and its metadata from disk.
        """
        model_path = os.path.join(self.artifacts_dir, f"{model_name}.pkl")
        meta_path = os.path.join(self.artifacts_dir, f"{model_name}_meta.json")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        model = joblib.load(model_path)
        metadata = {}
        if os.path.exists(meta_path):
            with open(meta_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)

        logger.info(f"Loaded model '{model_name}' successfully from {model_path}")
        return model, metadata

