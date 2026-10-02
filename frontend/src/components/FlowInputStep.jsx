import React, { useState } from 'react';
import { Database, Shuffle, ChevronDown, ChevronUp, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export default function FlowInputStep({
  presets,
  activeFlow,
  onSelectPreset,
  onLoadRandomSample,
  onAnalyze,
  isEvaluating,
  isLoadingRandom,
}) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const formatValue = (key, val) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    const num = Number(val);
    if (Number.isInteger(num)) {
      return num.toLocaleString();
    }
    // Round to 2 decimal places with comma separation
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const primaryFeatureKeys = [
    'Flow Duration',
    'Total Fwd Packets',
    'Total Backward Packets',
    'Total Length of Fwd Packets',
    'Total Length of Bwd Packets',
    'Flow Bytes/s',
    'Flow Packets/s',
    'Fwd Packet Length Mean',
    'Bwd Packet Length Mean',
  ];

  const features = activeFlow ? (activeFlow.features || {}) : {};
  const allFeatureKeys = Object.keys(features);
  const secondaryFeatureKeys = allFeatureKeys.filter(k => !primaryFeatureKeys.includes(k));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Step Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '0.25rem'
        }}>
          Network Flow Input
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Select or load realistic network flow telemetry from the CICIDS2017 benchmark dataset to feed into the AI model.
        </p>
      </div>

      {/* Main Flow Selection & Configuration Card */}
      <div className="clean-card" style={{ marginBottom: '1.5rem' }}>
        {/* Dataset & Mode Indicators */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              BENCHMARK DATASET:
            </span>
            <span className="badge badge-normal" style={{ fontSize: '0.75rem' }}>
              <Database size={12} /> {activeFlow ? (activeFlow.dataset || 'CICIDS2017') : 'CICIDS2017'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              SAMPLE TYPE:
            </span>
            <span className={`badge ${activeFlow && activeFlow.is_representative !== false ? 'badge-low' : 'badge-neutral'}`}>
              {activeFlow && activeFlow.is_representative !== false ? 'Representative Test Sample' : 'Random Held-Out Test Sample'}
            </span>
          </div>
        </div>

        {/* Sample Selector Buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Select Intrusion Category Sample:
            </span>
            <button
              type="button"
              onClick={onLoadRandomSample}
              disabled={isLoadingRandom || isEvaluating}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
            >
              <Shuffle size={13} color="var(--accent-purple)" />
              {isLoadingRandom ? 'Loading Sample...' : 'Random Test Sample'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.625rem' }}>
            {presets.map(p => {
              const isSelected = activeFlow && activeFlow.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPreset(p)}
                  style={{
                    background: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-muted)',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.65rem 0.875rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{p.category}</span>
                    {isSelected && <CheckCircle2 size={14} color="#ffffff" />}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-muted)',
                    marginTop: '0.2rem'
                  }}>
                    GT: {p.ground_truth || p.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Sample Context Callout */}
        <div style={{
          background: 'var(--bg-surface-muted)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '0.875rem 1.15rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Test Flow Payload:</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>
              {activeFlow ? activeFlow.name : 'No sample selected'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {activeFlow ? activeFlow.description : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ground-Truth:</span>
            <span className={`badge ${activeFlow && activeFlow.ground_truth === 'BENIGN' ? 'badge-normal' : 'badge-high'}`}>
              {activeFlow ? (activeFlow.ground_truth || activeFlow.category) : 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Numerical Features Display Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.75rem' }}>
            Extracted Network Flow Features (Telemetry):
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.75rem'
          }}>
            {primaryFeatureKeys.map(key => (
              <div key={key} style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={key}>
                  {key}
                </div>
                <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {formatValue(key, features[key])}
                </div>
              </div>
            ))}
          </div>

          {/* Expandable Section for Remaining Features */}
          {secondaryFeatureKeys.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowAllFeatures(!showAllFeatures)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {showAllFeatures ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showAllFeatures ? 'Hide additional features' : `View all features (${allFeatureKeys.length} total)`}
              </button>

              {showAllFeatures && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px dashed var(--border-color)'
                }}>
                  {secondaryFeatureKeys.map(key => (
                    <div key={key} style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }} title={key}>
                        {key}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {formatValue(key, features[key])}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Action CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAnalyze}
            disabled={isEvaluating}
            style={{
              padding: '0.75rem 1.75rem',
              fontSize: '0.95rem',
              fontWeight: 700
            }}
          >
            {isEvaluating ? (
              'Executing AI Inference Pipeline...'
            ) : (
              <>
                Analyze with AI <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
