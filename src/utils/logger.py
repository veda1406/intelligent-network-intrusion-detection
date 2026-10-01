import logging
import sys
from typing import Optional


def setup_logger(name: str = "NIDS", level: int = logging.INFO) -> logging.Logger:
    """
    Configure and return a structured logger instance.

    Args:
        name (str): Name of the logger.
        level (int): Logging severity level.

    Returns:
        logging.Logger: Configured logger.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
