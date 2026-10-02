from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class NetworkFlowInput(BaseModel):
    """Generic network flow features input payload for dynamic datasets."""
    features: Dict[str, float] = Field(
        ...,
        description="Key-value mapping of network flow metrics (e.g., flow duration, packet rates)",
    )
    ground_truth: Optional[str] = Field(
        default=None,
        description="Actual ground-truth label of flow for evaluation verification",
    )
    dataset: Optional[str] = Field(
        default="CICIDS2017",
        description="Origin dataset source (e.g. CICIDS2017)",
    )


class ThreatAssessmentResponse(BaseModel):
    """Inference response payload distinguishing model confidence from threat severity."""
    prediction: str = Field(..., description="Predicted class label")
    confidence: float = Field(..., description="Model statistical prediction confidence [0.0 - 1.0]")
    threat_severity: str = Field(..., description="Impact level: NORMAL, LOW, MEDIUM, HIGH, CRITICAL")
    top_shap_features: Optional[Dict[str, float]] = Field(
        default=None, description="Top SHAP feature importances for prediction explanation"
    )
    ground_truth: Optional[str] = Field(
        default=None, description="Actual ground-truth label if provided with the sample"
    )
    dataset: str = Field(
        default="CICIDS2017", description="Source dataset of the evaluated sample"
    )
    is_correct: Optional[bool] = Field(
        default=None, description="Whether predicted class matches ground truth label"
    )
    dnn_prediction: Optional[str] = Field(
        default=None, description="Prediction from Deep Neural Network on this sample"
    )
    dnn_confidence: Optional[float] = Field(
        default=None, description="Statistical confidence from Deep Neural Network [0.0 - 1.0]"
    )
    dnn_is_correct: Optional[bool] = Field(
        default=None, description="Whether DNN prediction matches ground truth label"
    )


class DnnPredictionResponse(BaseModel):
    """Individual flow prediction computed by the Deep Neural Network."""
    prediction: str = Field(..., description="DNN predicted attack category")
    confidence: float = Field(..., description="DNN statistical softmax certainty [0.0 - 1.0]")
    ground_truth: Optional[str] = Field(default=None, description="True dataset label")
    is_correct: Optional[bool] = Field(default=None, description="Whether DNN prediction matches ground truth")
    probabilities: Dict[str, float] = Field(default_factory=dict, description="Softmax probabilities per class")


class DnnEvaluationResponse(BaseModel):
    """Academic evaluation metrics for the Deep Neural Network."""
    model_name: str
    architecture: Dict[str, Any]
    metrics: Dict[str, float]
    confusion_matrix: List[List[int]]
    classes: List[str]
    per_class_report: Dict[str, Any]


class ModelComparisonResponse(BaseModel):
    """Comparative empirical evaluation across DNN, classical ML, and ensemble models."""
    dataset: str
    total_test_samples: int
    target_classes: List[str]
    winner: Dict[str, Any]
    dnn_summary: Dict[str, Any]
    models: List[Dict[str, Any]]



class SampleFlowPreset(BaseModel):
    id: str
    name: str
    description: str
    category: str
    ground_truth: str
    dataset: str = "CICIDS2017"
    is_representative: bool = True
    sample_idx: Optional[int] = None
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

