import os
from typing import Any, Dict
import yaml


def load_config(config_path: str = "configs/config.yaml") -> Dict[str, Any]:
    """
    Load project configuration from a YAML file.

    Args:
        config_path (str): Relative or absolute path to the configuration YAML.

    Returns:
        Dict[str, Any]: Dictionary containing nested configuration options.
    """
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found at: {config_path}")

    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    return config
