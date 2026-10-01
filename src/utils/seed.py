import os
import random
import numpy as np


def set_seed(seed: int = 42) -> None:
    """
    Set random seeds across Python random, NumPy, and TensorFlow for reproducibility.

    Args:
        seed (int): The random seed integer.
    """
    random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    np.random.seed(seed)

    try:
        import tensorflow as tf
        tf.random.set_seed(seed)
    except ImportError:
        pass
