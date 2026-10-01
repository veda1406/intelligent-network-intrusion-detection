import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KPICards from './components/KPICards';
import TrafficDistributionChart from './components/TrafficDistributionChart';
import SeverityDistributionChart from './components/SeverityDistributionChart';
import RecentAlertsTable from './components/RecentAlertsTable';
import LivePredictor from './components/LivePredictor';
import PredictionDetailsPanel from './components/PredictionDetailsPanel';
import SHAPExplainerChart from './components/SHAPExplainerChart';
import ModelInfoCard from './components/ModelInfoCard';
import { fetchHealth, fetchModelStats, fetchSampleFlows, predictFlow } from './services/api';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [presets, setPresets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Load initial backend telemetry & run sample flow inference
  const loadInitialData = async () => {
    setApiError(null);
    const healthRes = await fetchHealth();
    setHealth(healthRes);

    const statsRes = await fetchModelStats();
    if (statsRes) setModelStats(statsRes);

    const flowsRes = await fetchSampleFlows();
    if (flowsRes && flowsRes.length > 0) {
      setPresets(flowsRes);
      // Run automated baseline predictions across sample presets to seed initial alert log
      runInitialSeed(flowsRes);
    }
  };

  const runInitialSeed = async (sampleFlows) => {
    try {
      const initialAlerts = [];
      for (const preset of sampleFlows.slice(0, 4)) {
        const res = await predictFlow(preset.features);
        initialAlerts.push({
          id: `FLOW-${Math.floor(1000 + Math.random() * 9000)}`,
          name: preset.name,
          prediction: res.prediction,
          confidence: res.confidence,
          threat_severity: res.threat_severity,
          top_shap_features: res.top_shap_features,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
      setAlerts(initialAlerts);
      if (initialAlerts.length > 0) {
        setSelectedAlert(initialAlerts[0]);
      }
    } catch (err) {
      console.warn("Error running seed flow predictions:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRunPrediction = async (featuresDict, flowName) => {
    setIsEvaluating(true);
    setApiError(null);
    try {
      const res = await predictFlow(featuresDict);
      const newAlert = {
        id: `FLOW-${Math.floor(1000 + Math.random() * 9000)}`,
        name: flowName || 'Custom Evaluated Flow',
        prediction: res.prediction,
        confidence: res.confidence,
        threat_severity: res.threat_severity,
        top_shap_features: res.top_shap_features,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAlerts(prev => [newAlert, ...prev]);
      setSelectedAlert(newAlert);
    } catch (err) {
      setApiError(err.message || 'Failed to execute flow inference on FastAPI backend.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="cyber-grid-bg" />

      {/* Navbar Header */}
      <Navbar health={health} onRefreshHealth={loadInitialData} />

      {/* API Connection Error Banner */}
      {apiError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.4)',
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
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        
        {/* KPI Metric Summary Cards */}
        <KPICards alerts={alerts} modelStats={modelStats} />

        {/* Live Predictor & Flow Inspection Panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <LivePredictor
            presets={presets}
            onRunPrediction={handleRunPrediction}
            isEvaluating={isEvaluating}
          />

          <PredictionDetailsPanel selectedAlert={selectedAlert} />
        </div>

        {/* SHAP Feature Contribution & Threat Severity Distribution */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <SHAPExplainerChart topShapFeatures={selectedAlert ? selectedAlert.top_shap_features : null} />
          
          <SeverityDistributionChart alerts={alerts} />
        </div>

        {/* Traffic Category Breakdown */}
        <TrafficDistributionChart alerts={alerts} />

        {/* Recent Alerts Log Table */}
        <RecentAlertsTable
          alerts={alerts}
          selectedAlert={selectedAlert}
          onSelectAlert={setSelectedAlert}
        />

        {/* Model & System Info Card */}
        <ModelInfoCard modelStats={modelStats} />

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 2rem',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        background: 'rgba(7, 9, 14, 0.95)'
      }}>
        Intelligent Network Intrusion Detection System — Semester Deep Learning Course Project Dashboard © 2026
      </footer>
    </div>
  );
}
