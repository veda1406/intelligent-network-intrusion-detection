import os
import sys
sys.path.insert(0, os.path.abspath("."))
import json
import numpy as np
import pandas as pd
from src.utils.config_loader import load_config
from src.data.loader import DatasetLoader
from src.data.preprocessor import DataPreprocessor
from src.data.sampler import ImbalanceHandler
from src.features.engineering import FeatureEngineer
from src.models.baselines import BaselineModels
from src.models.dnn import DeepNeuralNetwork
from src.models.ensemble import IntrusionEnsemble
from src.models.registry import ModelRegistry
from src.evaluation.metrics import ModelEvaluator
from src.utils.logger import setup_logger

logger = setup_logger("TrainAndEvaluateAll")

def main():
    config = load_config()
    loader = DatasetLoader(config)
    raw_df = loader.load_raw_data()
    train_df, val_df, test_df = loader.split_data(raw_df)

    fe = FeatureEngineer(config)
    train_eng = fe.create_features(train_df)
    test_eng = fe.create_features(test_df)

    prep = DataPreprocessor(config)
    X_train, y_train = prep.fit_transform(train_eng, target_col="Label")
    X_test, y_test = prep.transform(test_eng, target_col="Label")
    prep.save_artifacts("saved_models")

    sampler = ImbalanceHandler(config)
    X_res, y_res = sampler.resample(X_train, y_train)

    evaluator = ModelEvaluator(config)

    # 1. Train Baselines
    logger.info("Training classical ML baselines...")
    baselines = BaselineModels(config)
    base_models = baselines.train_all(X_res, y_res)

    # 2. Train Genuine Deep Neural Network (DNN)
    logger.info("Training Deep Neural Network (128-64-32 Dense Architecture)...")
    dnn = DeepNeuralNetwork(config)
    dnn.fit(X_res, y_res)

    # 3. Build Ensemble (Soft Voting across RF, DT, LR, DNN)
    logger.info("Building Ensemble model...")
    ens_builder = IntrusionEnsemble(config)
    voting_models = {
        "random_forest": base_models["random_forest"],
        "decision_tree": base_models["decision_tree"],
        "logistic_regression": base_models["logistic_regression"],
        "dnn": dnn
    }
    ensemble = ens_builder.build_soft_voting_ensemble(voting_models)

    # 4. Evaluate all models on held-out test split
    models_to_eval = [
        ("Deep Neural Network (DNN)", "dnn", dnn),
        ("Random Forest", "random_forest", base_models["random_forest"]),
        ("Decision Tree", "decision_tree", base_models["decision_tree"]),
        ("Logistic Regression", "logistic_regression", base_models["logistic_regression"]),
        ("Random Forest Ensemble", "ensemble", ensemble)
    ]

    comparison_results = {}
    dnn_detailed_metrics = None

    for display_name, key, model in models_to_eval:
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)
        metrics = evaluator.evaluate(y_test.values, preds, probs)
        
        comparison_results[key] = {
            "model_name": display_name,
            "key": key,
            "accuracy": round(metrics["accuracy"], 4),
            "precision": round(metrics["precision"], 4),
            "recall": round(metrics["recall"], 4),
            "f1_score": round(metrics["f1_score"], 4),
            "false_negative_rate": round(metrics["false_negative_rate"], 4),
            "false_positive_rate": round(metrics["false_positive_rate"], 4),
            "confusion_matrix": metrics["confusion_matrix"]
        }
        
        if key == "dnn":
            dnn_detailed_metrics = {
                "model_name": "Deep Neural Network (DNN)",
                "architecture": {
                    "input_dim": int(X_train.shape[1]),
                    "hidden_layers": [128, 64, 32],
                    "activations": ["relu", "relu", "relu", "softmax"],
                    "dropout_rate": 0.3,
                    "optimizer": "Adam (LR=0.001)",
                    "loss_function": "Sparse Categorical Cross-Entropy",
                    "batch_size": 256,
                    "epochs": 50,
                    "early_stopping": "Patience 10"
                },
                "metrics": {
                    "accuracy": round(metrics["accuracy"], 4),
                    "precision": round(metrics["precision"], 4),
                    "recall": round(metrics["recall"], 4),
                    "f1_score": round(metrics["f1_score"], 4),
                    "false_negative_rate": round(metrics["false_negative_rate"], 4),
                    "false_positive_rate": round(metrics["false_positive_rate"], 4),
                },
                "confusion_matrix": metrics["confusion_matrix"],
                "classes": list(prep.classes_),
                "per_class_report": metrics["per_class_report"]
            }

        logger.info(f"==> {display_name}: Acc={metrics['accuracy']:.4f}, Prec={metrics['precision']:.4f}, Rec={metrics['recall']:.4f}, F1={metrics['f1_score']:.4f}")

    # 5. Persist DNN model and metadata
    registry = ModelRegistry("saved_models")
    registry.save_model(
        dnn,
        "dnn_model",
        {
            "accuracy": comparison_results["dnn"]["accuracy"],
            "model_type": "DeepNeuralNetwork",
            "architecture": "Dense(128)->Dense(64)->Dense(32)->Softmax",
            "hidden_units": [128, 64, 32]
        }
    )

    # 6. Save DNN metrics to saved_models/dnn_metrics.json
    with open("saved_models/dnn_metrics.json", "w", encoding="utf-8") as f:
        json.dump(dnn_detailed_metrics, f, indent=2)

    # 7. Determine winning model empirically
    # Compare F1 score and Accuracy
    best_key = max(comparison_results.keys(), key=lambda k: (comparison_results[k]["f1_score"], comparison_results[k]["accuracy"]))
    logger.info(f"Winning model on test set: {best_key} ({comparison_results[best_key]['model_name']})")

    # If Random Forest or Ensemble won, save as operational best_model
    operational_model = base_models["random_forest"] if best_key == "random_forest" else ensemble if best_key == "ensemble" else dnn
    registry.save_model(
        operational_model,
        "best_model",
        {
            "accuracy": comparison_results[best_key]["accuracy"],
            "f1_score": comparison_results[best_key]["f1_score"],
            "model_type": "RandomForestEnsemble" if best_key in ["random_forest", "ensemble"] else "DeepNeuralNetwork",
            "selected_as_operational": True,
            "winner_key": best_key
        }
    )

    # 8. Save comparison summary to saved_models/model_comparison.json
    comparison_payload = {
        "dataset": config.get("data", {}).get("dataset_name", "CICIDS2017"),
        "total_test_samples": len(test_df),
        "target_classes": list(prep.classes_),
        "winner": {
            "key": best_key,
            "name": comparison_results[best_key]["model_name"],
            "accuracy": comparison_results[best_key]["accuracy"],
            "f1_score": comparison_results[best_key]["f1_score"],
            "reason": "Achieved the strongest empirical performance on the evaluated CICIDS2017 setup."
        },
        "dnn_summary": {
            "name": "Deep Neural Network (DNN)",
            "accuracy": comparison_results["dnn"]["accuracy"],
            "f1_score": comparison_results["dnn"]["f1_score"],
            "status": "Evaluated Deep Learning Model",
            "contribution": "The DNN provides the project's Deep Learning implementation and demonstrates how neural networks learn nonlinear relationships among network-flow features."
        },
        "models": list(comparison_results.values())
    }

    with open("saved_models/model_comparison.json", "w", encoding="utf-8") as f:
        json.dump(comparison_payload, f, indent=2)

    logger.info("Saved all evaluation metrics and model artifacts to saved_models/ successfully!")

if __name__ == "__main__":
    main()
