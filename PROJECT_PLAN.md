# Intelligent Network Intrusion Detection & Threat Analysis — Project Implementation Plan

## Course Project Roadmap (Semester-Long Deep Learning Project)

This document outlines the phased development plan for building an end-to-end Intelligent Network Intrusion Detection System (NIDS). Each phase is structured to maintain strict separation of concerns, reproducibility, statistical rigor, and production-ready modularity.

---

## Phase Overview & Roadmap Summary

| Phase | Milestone | Core Deliverables | Status |
|---|---|---|---|
| **Phase 1** | Project Architecture & Environment Setup | Folder structure, config management, `.gitignore`, dependencies, skeleton modules | **Completed** |
| **Phase 2** | Data Ingestion, Cleaning & Preprocessing | Generic loader, missing value handling, leak-free splitters, scalers, class imbalance logic | **Completed** |
| **Phase 3** | Exploratory Data Analysis (EDA) & Feature Engineering | Flow ratio features, mutual information / importance feature selection, correlation plots | **Completed** |
| **Phase 4** | Traditional Machine Learning Baselines | Logistic Regression, Decision Tree, Random Forest, SVM training & hyperparameter tuning | **Completed** |
| **Phase 5** | Deep Neural Network (DNN) Implementation | Configurable TensorFlow/Keras 4-layer DNN architecture (Binary & Multiclass) | **Completed** |
| **Phase 6** | Ensemble Learning & Empirical Suitability Analysis | Soft Voting Classifier & Meta-Learner Stacking; empirical evaluation against single models | **Completed** |
| **Phase 7** | Comprehensive Model Evaluation & Security Metrics | Recall, FPR, FNR, Confusion Matrices, ROC-AUC, Per-class metrics prioritizing False Negatives | **Completed** |
| **Phase 8** | Explainable AI (SHAP) & Threat Severity Engine | Local/Global SHAP feature importance & Threat Severity mapping vs Model Confidence | **Completed** |
| **Phase 9** | Model Persistence & FastAPI Inference Service | Artifact serialization, REST API endpoints (`/health`, `/predict`), Pydantic validation | **Completed** |
| **Phase 10** | React Dashboard Frontend Development | Live threat telemetry UI, SHAP explanations view, Model performance dashboard | Planned |
| **Phase 11** | Integration, Testing, Benchmarking & Final Report | End-to-end integration tests, reproducibility audit, final course documentation | In Progress |


---

## Detailed Phase Breakdown

### Phase 1: Architecture & Scaffolding (Current Phase)
- **Goal**: Establish a scalable, reproducible, and modular project directory structure.
- **Key Tasks**:
  - Propose and create `src/` modules (`utils`, `data`, `features`, `models`, `evaluation`, `explainability`, `threat_analysis`, `api`).
  - Set up `configs/config.yaml` for dynamic dataset paths, hyperparameters, and thresholds.
  - Formulate `.gitignore` to prevent committing large datasets (`*.csv`, `*.parquet`) and binary artifacts (`*.h5`, `*.pkl`).
  - Define `requirements.txt` with dependencies (TensorFlow, PyYAML, FastAPI, SHAP, Scikit-learn).
- **Deliverables**: Repository structure, `README.md`, `PROJECT_PLAN.md`, initial skeleton code.

### Phase 2: Data Ingestion & Preprocessing Pipeline
- **Goal**: Ingest network flow data dynamically and prepare leak-free train/validation/test splits.
- **Key Tasks**:
  - Implement `src/data/loader.py` supporting datasets like CICIDS2017 and UNSW-NB15 via configuration parameters.
  - Implement stratified splitting (80% train, 10% validation, 10% test) to preserve class ratios.
  - Build `src/data/preprocessor.py` for handling infinite/NaN values, standard numerical scaling (`StandardScaler`/`RobustScaler`), and one-hot/label encoding.
  - Implement `src/data/sampler.py` using SMOTE / class weighting to address extreme class imbalance inherent to intrusion traffic.
  - Save fitted preprocessor state separately in `saved_models/` to prevent data leakage during inference.

### Phase 3: Exploratory Data Analysis & Feature Engineering
- **Goal**: Discover flow pattern statistics and reduce feature dimensionality.
- **Key Tasks**:
  - Create Jupyter notebook `notebooks/01_eda.ipynb` for distribution plots, target imbalance counts, and correlation heatmaps.
  - Implement `src/features/engineering.py` for constructing flow interaction metrics (e.g. packet rates, byte ratios).
  - Implement `src/features/selection.py` using Mutual Information and Random Forest feature importance to select the top $K$ features.

### Phase 4: Traditional Machine Learning Baseline Models
- **Goal**: Train baseline ML models to establish performance benchmarks.
- **Key Tasks**:
  - Implement in `src/models/baselines.py`:
    1. **Logistic Regression** (Linear baseline)
    2. **Decision Tree Classifier** (Non-linear rule-based baseline)
    3. **Random Forest Classifier** (Tree ensemble baseline)
    4. **Support Vector Machine (SVM)** (Margin-based classifier with probability output)
  - Execute hyperparameter tuning via grid/random search.
  - Document baseline metrics (Accuracy, Precision, Recall, F1, ROC-AUC).

### Phase 5: Deep Neural Network (DNN) Implementation
- **Goal**: Construct a configurable TensorFlow/Keras Deep Neural Network tailored for network flow pattern recognition.
- **Key Tasks**:
  - Implement `src/models/dnn.py` matching specified architecture:
    - **Input Layer**: Configurable input dimension ($K$ features)
    - **Hidden Layer 1**: Dense(128, ReLU) $\rightarrow$ Batch Normalization $\rightarrow$ Dropout(0.3)
    - **Hidden Layer 2**: Dense(64, ReLU) $\rightarrow$ Batch Normalization $\rightarrow$ Dropout(0.3)
    - **Hidden Layer 3**: Dense(32, ReLU)
    - **Output Layer**: Dense(1, Sigmoid) for Binary OR Dense($N$, Softmax) for Multiclass.
  - Implement training callbacks: `EarlyStopping`, `ReduceLROnPlateau`, and `ModelCheckpoint`.
  - Log loss/accuracy convergence curves.

### Phase 6: Ensemble Learning Strategy & Suitability Analysis
- **Goal**: Investigate and implement ensemble strategies combining baselines and DNN models.
- **Key Tasks**:
  - Implement `src/models/ensemble.py`:
    - **Soft Voting Classifier**: Weighted probability averaging across trained baselines + DNN.
    - **Stacking Classifier**: Base estimators feed probability predictions into a meta-learner (e.g., Logistic Regression).
  - Conduct objective empirical comparative study: Compare individual models vs ensembles.
  - Determine if the ensemble yields statistically significant improvements in Recall and F1-score without excessive latency.

### Phase 7: Comprehensive Evaluation Framework
- **Goal**: Rigorously evaluate intrusion detection capabilities with focus on cybersecurity risk.
- **Key Tasks**:
  - Implement `src/evaluation/metrics.py` computing:
    - Accuracy, Precision, Recall, F1-Score
    - False Positive Rate (FPR) and False Negative Rate (FNR)
    - ROC-AUC curves & Precision-Recall curves
    - Per-class metrics for multi-attack classification (DoS, DDoS, PortScan, Bot, Infiltration, etc.)
  - Implement `src/evaluation/visualizer.py` to generate confusion matrix heatmaps and saved report figures in `reports/figures/`.
  - **Priority**: Minimize False Negatives (uncaught malicious attacks represent severe security breaches).

### Phase 8: Explainable AI (SHAP) & Threat Severity Engine
- **Goal**: Provide transparent model interpretability and distinguish operational threat severity from statistical confidence.
- **Key Tasks**:
  - Implement `src/explainability/explainer.py` using `SHAP` (`TreeExplainer` / `KernelExplainer` / `DeepExplainer`).
  - Generate local flow explanations (waterfall plots) and global feature importance summary plots.
  - Implement `src/threat_analysis/severity_analyzer.py`:
    - **Model Confidence**: Raw statistical probability score $[0.0 - 1.0]$.
    - **Threat Severity**: Impact rating (`NORMAL`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) tied to attack category capability.
    - Resolve edge cases (e.g., Low Confidence + Critical Threat Category $\rightarrow$ Escalated Security Alert).

### Phase 9: Model Persistence & FastAPI Backend Service
- **Goal**: Serve trained models and preprocessing artifacts through a high-performance REST API.
- **Key Tasks**:
  - Implement `src/models/registry.py` to save and load model binaries (`.keras`, `.joblib`) and preprocessors (`scaler.pkl`, `encoder.pkl`).
  - Build `src/api/main.py` and `src/api/schemas.py` using FastAPI and Pydantic:
    - `GET /health`: System health and model load state.
    - `POST /predict`: Ingest network flow JSON payload, apply preprocessing, return prediction class, model confidence, threat severity level, and top SHAP features.
  - Optionally integrate MongoDB for persistent prediction and alert history logging.

### Phase 10: React Frontend Dashboard
- **Goal**: Provide a modern, responsive security operations center (SOC) dashboard.
- **Key Tasks**:
  - Build React app under `frontend/` using modern CSS design tokens, smooth animations, and dynamic charts.
  - Dashboard Panels:
    1. **Live Network Telemetry & Alert Stream**
    2. **Threat Severity vs Confidence Matrix**
    3. **Interactive SHAP Feature Importance Explainer**
    4. **Model Performance & Confusion Matrix Metrics Viewer**

### Phase 11: End-to-End Testing, Benchmarking & Final Documentation
- **Goal**: Validate reproducible deployment and finalize course deliverables.
- **Key Tasks**:
  - Run full integration test suite (`pytest`).
  - Execute end-to-end pipeline verification from raw CSV ingest to API response.
  - Complete final course documentation, report, and slide deck summarizing findings.
