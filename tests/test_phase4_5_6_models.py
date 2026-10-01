import pytest
import numpy as np
import pandas as pd
from src.models.baselines import BaselineModels
from src.models.dnn import DeepNeuralNetwork
from src.models.ensemble import IntrusionEnsemble, SoftVotingEnsemble, StackingEnsemble


@pytest.fixture
def sample_training_data():
    np.random.seed(42)
    n = 120
    n_features = 10
    X = pd.DataFrame(np.random.randn(n, n_features), columns=[f"feat_{i}" for i in range(n_features)])
    y = pd.Series(np.random.choice([0, 1, 2], size=n), name="target")
    return X, y


def test_baseline_models(sample_training_data):
    X, y = sample_training_data
    config = {
        "system": {"seed": 42},
        "models": {
            "logistic_regression": {"max_iter": 100},
            "decision_tree": {"max_depth": 5},
            "random_forest": {"n_estimators": 10, "max_depth": 5},
            "svm": {"C": 1.0, "probability": True},
        },
    }

    bm = BaselineModels(config)
    trained = bm.train_all(X, y)

    assert "logistic_regression" in trained
    assert "decision_tree" in trained
    assert "random_forest" in trained
    assert "svm" in trained

    for name, model in trained.items():
        preds = model.predict(X)
        assert len(preds) == len(y)
        probs = model.predict_proba(X)
        assert probs.shape == (len(y), 3)


def test_deep_neural_network(sample_training_data):
    X, y = sample_training_data
    config = {
        "system": {"seed": 42},
        "data": {"classification_mode": "multiclass"},
        "models": {
            "dnn": {
                "hidden_units": [32, 16],
                "epochs": 3,
                "batch_size": 32,
                "dropout_rate": 0.1,
            }
        },
    }

    dnn = DeepNeuralNetwork(config)
    dnn.fit(X, y)

    preds = dnn.predict(X)
    assert len(preds) == len(y)

    probs = dnn.predict_proba(X)
    assert probs.shape == (len(y), 3)


def test_ensemble_models(sample_training_data):
    X, y = sample_training_data
    config = {
        "system": {"seed": 42},
        "models": {
            "logistic_regression": {"max_iter": 100},
            "random_forest": {"n_estimators": 10, "max_depth": 5},
        },
    }

    bm = BaselineModels(config)
    trained = bm.train_all(X, y)

    ie = IntrusionEnsemble(config)

    # Soft Voting Test
    soft_vote = ie.build_soft_voting_ensemble(trained)
    sv_preds = soft_vote.predict(X)
    assert len(sv_preds) == len(y)
    sv_probs = soft_vote.predict_proba(X)
    assert sv_probs.shape == (len(y), 3)

    # Stacking Test
    stacker = ie.build_stacking_ensemble(trained)
    stacker.fit(X, y)
    st_preds = stacker.predict(X)
    assert len(st_preds) == len(y)
    st_probs = stacker.predict_proba(X)
    assert st_probs.shape == (len(y), 3)
