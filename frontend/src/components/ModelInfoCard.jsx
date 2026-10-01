import React from 'react';
import { Cpu, Layers, Database, CheckCircle } from 'lucide-react';

export default function ModelInfoCard({ modelStats }) {
  if (!modelStats) return null;

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Layers size={18} color="var(--accent-purple)" />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700 }}>
          Model Architecture & Pipeline Metadata
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          padding: '0.75rem 1rem',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Domain</span>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginTop: '0.15rem' }}>
            {modelStats.project_name}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          padding: '0.75rem 1rem',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classifier Ensemble</span>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>
            {modelStats.model_name}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          padding: '0.75rem 1rem',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preprocessed Feature Count</span>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginTop: '0.15rem' }}>
            {modelStats.total_features} features
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          padding: '0.75rem 1rem',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Class Categories</span>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginTop: '0.15rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {modelStats.target_classes.map(c => (
              <span key={c} className="badge badge-low" style={{ fontSize: '0.65rem' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
