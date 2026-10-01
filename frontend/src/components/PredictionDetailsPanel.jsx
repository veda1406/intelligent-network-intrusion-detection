import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PredictionDetailsPanel({ selectedAlert }) {
  if (!selectedAlert) {
    return (
      <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '3rem 1.5rem' }}>
        <ShieldCheck size={36} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
        <h4 style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>No Flow Selected</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
          Select a flow from the alert log or execute a live prediction payload above to inspect details.
        </p>
      </div>
    );
  }

  const { id, name, prediction, confidence, threat_severity, timestamp } = selectedAlert;
  const badgeClass = `badge-${threat_severity.toLowerCase()}`;
  const isMalicious = prediction !== 'BENIGN';

  return (
    <div className="glass-card cyan-glow" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            FLOW INSPECTION ID: {id}
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem' }}>
            {name || id}
          </h3>
        </div>
        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          {threat_severity} SEVERITY
        </span>
      </div>

      {/* Grid Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Prediction Class */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.875rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted Class</div>
          <div style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)',
            marginTop: '0.25rem'
          }}>
            {prediction}
          </div>
        </div>

        {/* Statistical Confidence */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.875rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model Certainty Confidence</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            {(confidence * 100).toFixed(1)}%
          </div>
        </div>

        {/* Timestamp */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.875rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evaluation Timestamp</div>
          <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginTop: '0.5rem' }}>
            {timestamp}
          </div>
        </div>
      </div>

      {/* Action Recommendation Callout */}
      <div style={{
        background: isMalicious ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
        border: isMalicious ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        {isMalicious ? (
          <AlertTriangle size={20} color="var(--severity-critical)" style={{ flexShrink: 0, marginTop: '2px' }} />
        ) : (
          <CheckCircle2 size={20} color="var(--severity-normal)" style={{ flexShrink: 0, marginTop: '2px' }} />
        )}
        <div>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            AUTOMATED SOC ACTION RECOMMENDATION
          </div>
          <p style={{ fontSize: '0.875rem', color: '#f1f5f9', marginTop: '0.25rem' }}>
            {isMalicious
              ? `Action Required for ${prediction}: Initiate automated firewall block rule for source flow IP & log incident for SOC review.`
              : 'Permit traffic flow. No operational security threat detected.'}
          </p>
        </div>
      </div>
    </div>
  );
}
