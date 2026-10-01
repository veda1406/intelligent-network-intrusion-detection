import React, { useState } from 'react';
import { Zap, Play, RotateCcw, AlertTriangle } from 'lucide-react';

export default function LivePredictor({ presets, onRunPrediction, isEvaluating }) {
  const defaultFeatures = {
    "Flow Duration": 4500.0,
    "Total Fwd Packets": 12.0,
    "Total Backward Packets": 15.0,
    "Total Length of Fwd Packets": 850.0,
    "Total Length of Bwd Packets": 2400.0,
    "Flow Bytes/s": 722.2,
    "Flow Packets/s": 6.0,
    "Fwd Packet Length Mean": 70.8,
    "Bwd Packet Length Mean": 160.0,
  };

  const [features, setFeatures] = useState(defaultFeatures);
  const [activePreset, setActivePreset] = useState('flow-benign-1');

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setFeatures({ ...preset.features });
  };

  const handleFeatureChange = (key, val) => {
    const num = parseFloat(val) || 0;
    setFeatures(prev => ({ ...prev, [key]: num }));
  };

  const handleReset = () => {
    setFeatures(defaultFeatures);
    setActivePreset('flow-benign-1');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const activeObj = presets.find(p => p.id === activePreset);
    const flowName = activeObj ? activeObj.name : 'Custom Network Flow';
    onRunPrediction(features, flowName);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700 }}>
            Live Network Flow Predictor & Simulator
          </h3>
        </div>
        <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
          Interactive Demonstration Mode
        </span>
      </div>

      {/* Preset Quick-Select Buttons */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
          1-CLICK ATTACK VECTOR PRESETS
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {presets.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              style={{
                background: activePreset === p.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: activePreset === p.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                color: activePreset === p.id ? 'var(--accent-cyan)' : 'var(--text-main)',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Input Parameters Grid */}
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.875rem',
          marginBottom: '1.25rem'
        }}>
          {Object.entries(features).map(([key, val]) => (
            <div key={key} style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-color)',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px'
            }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                {key}
              </label>
              <input
                type="number"
                step="any"
                value={val}
                onChange={e => handleFeatureChange(key, e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isEvaluating}
            style={{ opacity: isEvaluating ? 0.6 : 1 }}
          >
            <Play size={16} />
            {isEvaluating ? 'Executing AI Inference...' : 'Evaluate Flow Payload'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            <RotateCcw size={16} /> Reset Parameters
          </button>
        </div>
      </form>
    </div>
  );
}
