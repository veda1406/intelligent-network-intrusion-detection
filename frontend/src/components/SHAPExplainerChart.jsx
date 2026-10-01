import React from 'react';
import { Sliders, Sparkles } from 'lucide-react';

export default function SHAPExplainerChart({ topShapFeatures }) {
  if (!topShapFeatures || Object.keys(topShapFeatures).length === 0) {
    return (
      <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem 1rem' }}>
        <Sparkles size={28} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          SHAP feature contribution explanations will render here when a flow is evaluated.
        </p>
      </div>
    );
  }

  const entries = Object.entries(topShapFeatures);
  const maxVal = Math.max(...entries.map(([_, v]) => Math.abs(v))) || 1.0;

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700 }}>
            Explainable AI (SHAP) Feature Contribution
          </h3>
        </div>
        <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
          Top Influential Features
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Key network flow features driving the model's classification decision for the selected flow:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {entries.map(([featName, val], idx) => {
          const pct = Math.min(100, Math.max(5, (Math.abs(val) / maxVal) * 100)).toFixed(1);

          return (
            <div key={featName}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f1f5f9' }}>
                  {idx + 1}. {featName}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {val > 0 ? `+${val.toFixed(4)}` : val.toFixed(4)}
                </span>
              </div>
              <div style={{
                height: '8px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00f2fe 0%, #3b82f6 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
