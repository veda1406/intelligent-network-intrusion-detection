from typing import Dict, Any
import numpy as np
import pandas as pd
from src.utils.logger import setup_logger

logger = setup_logger("FeatureEngineer")


class FeatureEngineer:
    """
    Constructs domain-specific flow ratios, statistical aggregations, and interaction features
    without assuming static column schemas.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.eps = 1e-6

    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Derives engineered network flow features dynamically based on existing columns.
        """
        logger.info("Deriving engineered network flow interaction features...")
        df_out = df.copy()

        cols = set(df_out.columns)

        # 1. Forward vs Backward Packet Ratio
        if "Total Fwd Packets" in cols and "Total Backward Packets" in cols:
            df_out["Fwd_Bwd_Pkt_Ratio"] = (df_out["Total Fwd Packets"] + self.eps) / (
                df_out["Total Backward Packets"] + self.eps
            )

        # 2. Forward vs Backward Byte Length Ratio
        if "Total Length of Fwd Packets" in cols and "Total Length of Bwd Packets" in cols:
            df_out["Fwd_Bwd_Byte_Ratio"] = (df_out["Total Length of Fwd Packets"] + self.eps) / (
                df_out["Total Length of Bwd Packets"] + self.eps
            )

        # 3. Overall Packet Density per Microsecond
        if "Flow Duration" in cols and "Total Fwd Packets" in cols and "Total Backward Packets" in cols:
            total_pkts = df_out["Total Fwd Packets"] + df_out["Total Backward Packets"]
            df_out["Pkt_Per_Microsec"] = total_pkts / (df_out["Flow Duration"] + self.eps)

        # 4. Payload Byte Density per Packet
        if "Flow Bytes/s" in cols and "Flow Packets/s" in cols:
            df_out["Payload_Byte_Per_Pkt"] = (df_out["Flow Bytes/s"] + self.eps) / (
                df_out["Flow Packets/s"] + self.eps
            )

        # 5. Flow Duration log transform for heavy-tailed distribution
        if "Flow Duration" in cols:
            df_out["Log_Flow_Duration"] = np.log1p(np.maximum(0, df_out["Flow Duration"]))

        new_feature_count = df_out.shape[1] - df.shape[1]
        logger.info(f"Engineered {new_feature_count} new interaction features. Total features: {df_out.shape[1]}")
        return df_out

