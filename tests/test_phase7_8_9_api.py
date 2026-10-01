import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
from src.evaluation.metrics import ModelEvaluator
from src.threat_analysis.severity_analyzer import ThreatSeverityAnalyzer
from src.explainability.explainer import IntrusionExplainer
from src.models.registry import ModelRegistry
from src.api.main import app


@pytest.fixture
def test_client():
    return TestClient(app)


def test_model_evaluator():
    config = {}
    evaluator = ModelEvaluator(config)

    y_true = np.array([0, 1, 1, 0, 1, 0])
    y_pred = np.array([0, 1, 0, 0, 1, 0])
    y_prob = np.array([
        [0.9, 0.1],
        [0.2, 0.8],
        [0.6, 0.4],
        [0.85, 0.15],
        [0.1, 0.9],
        [0.95, 0.05],
    ])

    metrics = evaluator.evaluate(y_true, y_pred, y_prob)

    assert "accuracy" in metrics
    assert "recall" in metrics
    assert "false_positive_rate" in metrics
    assert "false_negative_rate" in metrics
    assert metrics["accuracy"] > 0.5


def test_threat_severity_analyzer():
    config = {
        "threat_analysis": {
            "severity_mapping": {
                "BENIGN": "NORMAL",
                "DoS": "HIGH",
                "DDoS": "CRITICAL",
                "PortScan": "MEDIUM",
            },
            "confidence_thresholds": {
                "high_confidence": 0.85,
                "medium_confidence": 0.60,
                "low_confidence": 0.0,
            },
        }
    }

    analyzer = ThreatSeverityAnalyzer(config)

    res1 = analyzer.evaluate_threat("DDoS", 0.95)
    assert res1["threat_severity"] == "CRITICAL"
    assert res1["confidence_level"] == "HIGH_CERTAINTY"

    res2 = analyzer.evaluate_threat("BENIGN", 0.99)
    assert res2["threat_severity"] == "NORMAL"


def test_model_registry(tmp_path):
    registry = ModelRegistry(str(tmp_path / "models"))

    dummy_model = {"name": "test_model_weights"}
    meta = {"accuracy": 0.98}

    path = registry.save_model(dummy_model, "my_model", meta)
    assert path.endswith(".pkl")

    loaded_model, loaded_meta = registry.load_model("my_model")
    assert loaded_model["name"] == "test_model_weights"
    assert loaded_meta["accuracy"] == 0.98


def test_api_health_endpoint(test_client):
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_api_predict_endpoint(test_client):
    payload = {
        "features": {
            "Flow Duration": 5000.0,
            "Total Fwd Packets": 10.0,
            "Total Backward Packets": 8.0,
            "Flow Bytes/s": 1500.0,
        }
    }

    response = test_client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence" in data
    assert "threat_severity" in data
