from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class NetworkFlowInput(BaseModel):
    """Generic network flow features input payload for dynamic datasets."""
    features: Dict[str, float] = Field(
        ...,
        description="Key-value mapping of network flow metrics (e.g., flow duration, packet rates)",
    )


class ThreatAssessmentResponse(BaseModel):
    """Inference response payload distinguishing model confidence from threat severity."""
    prediction: str = Field(..., description="Predicted class label")
    confidence: float = Field(..., description="Model statistical prediction confidence [0.0 - 1.0]")
    threat_severity: str = Field(..., description="Impact level: NORMAL, LOW, MEDIUM, HIGH, CRITICAL")
    top_shap_features: Optional[Dict[str, float]] = Field(
        default=None, description="Top SHAP feature importances for prediction explanation"
    )


class SampleFlowPreset(BaseModel):
    id: str
    name: str
    description: str
    category: str
    features: Dict[str, float]


class ModelStatsResponse(BaseModel):
    project_name: str
    model_name: str
    model_loaded: bool
    target_classes: List[str]
    total_features: int
    features_list: List[str]
    accuracy: float
    threat_thresholds: Dict[str, float]
class HealthCheckResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
