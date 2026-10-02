import React, { useState, useEffect } from 'react';
import { Zap, Play, RotateCcw, Shuffle, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

export default function LivePredictor({
  presets,
  onRunPrediction,
  onLoadRandomTestSample,
  isEvaluating,
  isLoadingRandom,
}) {
  const [activePreset, setActivePreset] = useState(null);
  const [features, setFeatures] = useState({});
  const [activeMetadata, setActiveMetadata] = useState({
    name: 'BENIGN - Representative Normal Flow',
    ground_truth: 'BENIGN',
    dataset: 'CICIDS2017',
    description: 'Representative correctly classified normal network flow from CICIDS2017.',
    is_representative: true,
  });

  // Sync initial preset when loaded from backend
  useEffect(() => {
    if (presets && presets.length > 0 && !activePreset) {
      const initial = presets[0];
      setActivePreset(initial.id);
      setFeatures({ ...initial.features });
      setActiveMetadata({
        name: initial.name,
        ground_truth: initial.ground_truth || initial.category,
        dataset: initial.dataset || 'CICIDS2017',
        description: initial.description,
        is_representative: initial.is_representative !== false,
      });
    }
  }, [presets, activePreset]);

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setFeatures({ ...preset.features });
    setActiveMetadata({
      name: preset.name,
      ground_truth: preset.ground_truth || preset.category,
      dataset: preset.dataset || 'CICIDS2017',
      description: preset.description,
      is_representative: preset.is_representative !== false,
    });
  };

  const handleSelectRandomSample = async () => {
    if (!onLoadRandomTestSample) return;
    try {
      const randomSample = await onLoadRandomTestSample();
      if (randomSample) {
        setActivePreset(randomSample.id);
        setFeatures({ ...randomSample.features });
        setActiveMetadata({
          name: randomSample.name,
          ground_truth: randomSample.ground_truth || randomSample.category,
          dataset: randomSample.dataset || 'CICIDS2017',
          description: randomSample.description,
          is_representative: false,
        });
      }
    } catch (err) {
      console.error("Error loading random test sample:", err);
    }
  };

  const handleFeatureChange = (key, val) => {
    const num = parseFloat(val) || 0;
    setFeatures(prev => ({ ...prev, [key]: num }));
  };

  const handleReset = () => {
    if (presets && presets.length > 0) {
      handleSelectPreset(presets[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRunPrediction(
      features,
      activeMetadata.name,
      activeMetadata.ground_truth,
      activeMetadata.dataset
    );
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700 }}>
            Network Flow Evaluation & Live Predictor
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-normal" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Database size={11} /> Dataset: {activeMetadata.dataset}
          </span>
          <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
            {activeMetadata.is_representative ? 'Representative Test Sample' : 'Random Held-Out Test Flow'}
          </span>
        </div>
      </div>

      {/* Preset Quick-Select & Random Sample Buttons */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            REPRESENTATIVE CORRECTLY CLASSIFIED TEST SAMPLES (CICIDS2017)
          </label>
          <button
            type="button"
            onClick={handleSelectRandomSample}
            disabled={isLoadingRandom || isEvaluating}
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid var(--accent-purple)',
              color: '#d8b4fe',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Shuffle size={13} />
            {isLoadingRandom ? 'Loading Sample...' : 'Random Test Sample'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {presets.map(p => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={{
                  background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{p.category}</span>
                <span style={{ fontSize: '0.65rem', color: isSelected ? '#a5f3fc' : 'var(--text-dim)' }}>
                  (GT: {p.ground_truth || p.category})
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Sample Context Callout */}
        <div style={{
          marginTop: '0.75rem',
          padding: '0.65rem 0.85rem',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.75rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Active Flow: </span>
            <strong style={{ color: '#fff' }}>{activeMetadata.name}</strong>
            <span style={{ color: 'var(--text-dim)', marginLeft: '0.5rem' }}>— {activeMetadata.description}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ground Truth:</span>
            <span className={`badge ${activeMetadata.ground_truth === 'BENIGN' ? 'badge-normal' : 'badge-high'}`}>
              {activeMetadata.ground_truth}
            </span>
          </div>
        </div>
      </div>

      {/* Feature Input Parameters Grid */}
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          {Object.entries(features).map(([key, val]) => (
            <div key={key} style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-color)',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px'
            }}>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={key}>
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
                  fontSize: '0.85rem',
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
            {isEvaluating ? 'Executing AI Inference Pipeline...' : 'Evaluate Flow with Model'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </form>
    </div>
  );
}

