import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FlowInputStep from './components/FlowInputStep';
import AiDetectionStep from './components/AiDetectionStep';
import ExplainableAiStep from './components/ExplainableAiStep';
import ThreatResponseStep from './components/ThreatResponseStep';
import DnnAnalysisView from './components/DnnAnalysisView';
import ModelComparisonView from './components/ModelComparisonView';
import SocOverviewView from './components/SocOverviewView';
import {
  fetchHealth,
  fetchModelStats,
  fetchSampleFlows,
  predictFlow,
  fetchRandomTestSample,
} from './services/api';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  // Navigation & Workflow state: 'detection', 'dnn-analysis', 'model-comparison', 'overview'
  const [activeTab, setActiveTab] = useState('detection');
  const [detectionStep, setDetectionStep] = useState(1); // 1: Input, 2: AI Detection, 3: Explanation, 4: Threat Response

  // Backend telemetry & model state
  const [health, setHealth] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [presets, setPresets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Active Flow and Active Prediction state for guided workflow
  const [activeFlow, setActiveFlow] = useState(null);
  const [activePrediction, setActivePrediction] = useState(null);

  // Loading states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  // Load initial backend telemetry & sample presets on mount
  const loadInitialData = async () => {
    setApiError(null);
    const healthRes = await fetchHealth();
    setHealth(healthRes);

    const statsRes = await fetchModelStats();
    if (statsRes) setModelStats(statsRes);

    const flowsRes = await fetchSampleFlows();
    if (flowsRes && flowsRes.length > 0) {
      setPresets(flowsRes);
      // Select the first preset as initial active flow
      setActiveFlow(flowsRes[0]);
      // Run automated baseline predictions across all representative samples to seed initial event store
      runInitialSeed(flowsRes);
    }
  };

  const runInitialSeed = async (sampleFlows) => {
    try {
      const initialAlerts = [];
      let firstPred = null;

      for (let i = 0; i < sampleFlows.length; i++) {
        const preset = sampleFlows[i];
        const res = await predictFlow(preset.features, preset.ground_truth, preset.dataset);
        const alertObj = {
          id: preset.id || `FLOW-${Math.floor(1000 + Math.random() * 9000)}`,
          name: preset.name,
          category: preset.category,
          ground_truth: preset.ground_truth || preset.category,
          dataset: preset.dataset || 'CICIDS2017',
          prediction: res.prediction,
          confidence: res.confidence,
          threat_severity: res.threat_severity,
          top_shap_features: res.top_shap_features,
          is_correct: res.is_correct,
          timestamp: new Date().toLocaleTimeString(),
        };
        initialAlerts.push(alertObj);
        if (i === 0) {
          firstPred = res;
        }
      }
      setAlerts(initialAlerts);
      if (firstPred) {
        setActivePrediction(firstPred);
      }
    } catch (err) {
      console.warn("Error running seed flow predictions:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Execute inference on current active flow and transition to Step 2 (AI Detection)
  const handleAnalyzeFlow = async () => {
    if (!activeFlow || !activeFlow.features) return;

    setIsEvaluating(true);
    setApiError(null);
    try {
      const res = await predictFlow(
        activeFlow.features,
        activeFlow.ground_truth || activeFlow.category,
        activeFlow.dataset || 'CICIDS2017'
      );

      setActivePrediction(res);

      const newAlert = {
        id: activeFlow.id || `FLOW-${Math.floor(1000 + Math.random() * 9000)}`,
        name: activeFlow.name || 'Evaluated Network Flow',
        category: activeFlow.category || res.prediction,
        ground_truth: activeFlow.ground_truth || activeFlow.category || null,
        dataset: activeFlow.dataset || 'CICIDS2017',
        prediction: res.prediction,
        confidence: res.confidence,
        threat_severity: res.threat_severity,
        top_shap_features: res.top_shap_features,
        is_correct: res.is_correct,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Add to central alerts event store
      setAlerts(prev => [newAlert, ...prev]);

      // Move to Step 2
      setDetectionStep(2);
    } catch (err) {
      setApiError(err.message || 'Failed to execute flow inference on FastAPI backend.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Load random held-out test sample from backend
  const handleLoadRandomSample = async () => {
    setIsLoadingRandom(true);
    setApiError(null);
    try {
      const randomSample = await fetchRandomTestSample();
      if (randomSample) {
        setActiveFlow(randomSample);
        setActivePrediction(null);
        setDetectionStep(1);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to draw random held-out test sample from backend.');
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Switch preset in Step 1
  const handleSelectPreset = (preset) => {
    setActiveFlow(preset);
    setActivePrediction(null);
    setDetectionStep(1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="cyber-grid-bg" />

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        health={health}
        onRefreshHealth={loadInitialData}
      />

      {/* API Connection Error Banner */}
      {apiError && (
        <div style={{
          background: 'var(--severity-critical-bg)',
          borderBottom: '1px solid var(--severity-critical-border)',
          color: 'var(--severity-critical)',
          padding: '0.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span><strong>Backend Communication Error:</strong> {apiError}</span>
          </div>
          <button
            onClick={() => setApiError(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--severity-critical)', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        
        {/* VIEW 1: GUIDED DETECTION WORKFLOW (DEFAULT) */}
        {activeTab === 'detection' && (
          <div>
            {/* Horizontal 4-Step Progress Indicator */}
            <div className="workflow-stepper" style={{ maxWidth: '1000px', margin: '0 auto 1.75rem auto' }}>
              {[
                { step: 1, label: 'FLOW INPUT' },
                { step: 2, label: 'AI DETECTION' },
                { step: 3, label: 'EXPLANATION' },
                { step: 4, label: 'THREAT RESPONSE' },
              ].map((item, idx) => {
                const isActive = detectionStep === item.step;
                const isCompleted = detectionStep > item.step;

                return (
                  <React.Fragment key={item.step}>
                    <button
                      type="button"
                      className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => {
                        // Allow clicking back to earlier steps or to step 2 if prediction exists
                        if (item.step < detectionStep || (item.step === 2 && activePrediction)) {
                          setDetectionStep(item.step);
                        }
                      }}
                      style={{ cursor: (item.step <= detectionStep || activePrediction) ? 'pointer' : 'default' }}
                    >
                      <span className="step-badge">
                        {isCompleted ? '✓' : item.step}
                      </span>
                      <span>{item.label}</span>
                    </button>

                    {idx < 3 && <span className="step-divider">→</span>}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step 1: Flow Input */}
            {detectionStep === 1 && (
              <FlowInputStep
                presets={presets}
                activeFlow={activeFlow}
                onSelectPreset={handleSelectPreset}
                onLoadRandomSample={handleLoadRandomSample}
                onAnalyze={handleAnalyzeFlow}
                isEvaluating={isEvaluating}
                isLoadingRandom={isLoadingRandom}
              />
            )}

            {/* Step 2: AI Detection */}
            {detectionStep === 2 && (
              <AiDetectionStep
                predictionResult={activePrediction}
                activeFlow={activeFlow}
                modelStats={modelStats}
                onGoBack={() => setDetectionStep(1)}
                onProceedToExplanation={() => setDetectionStep(3)}
              />
            )}

            {/* Step 3: Explainable AI (SHAP) */}
            {detectionStep === 3 && (
              <ExplainableAiStep
                predictionResult={activePrediction}
                onGoBack={() => setDetectionStep(2)}
                onProceedToThreatResponse={() => setDetectionStep(4)}
              />
            )}

            {/* Step 4: Threat Response */}
            {detectionStep === 4 && (
              <ThreatResponseStep
                predictionResult={activePrediction}
                onGoBack={() => setDetectionStep(3)}
                onEvaluateAnother={() => {
                  setDetectionStep(1);
                }}
                onViewSocOverview={() => setActiveTab('overview')}
              />
            )}
          </div>
        )}

        {/* VIEW 2: DEEP NEURAL NETWORK (DNN) ANALYSIS */}
        {activeTab === 'dnn-analysis' && (
          <DnnAnalysisView activeFlow={activeFlow} />
        )}

        {/* VIEW 3: MODEL COMPARISON & EMPIRICAL BENCHMARK */}
        {activeTab === 'model-comparison' && (
          <ModelComparisonView />
        )}

        {/* VIEW 4: SOC OVERVIEW TELEMETRY */}
        {activeTab === 'overview' && (
          <SocOverviewView
            alerts={alerts}
            modelStats={modelStats}
          />
        )}

      </main>

      {/* Professional Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        background: 'var(--bg-surface)'
      }}>
        Intelligent Network Intrusion Detection System — Semester Deep Learning Final Project Presentation © 2026
      </footer>
    </div>
  );
}
