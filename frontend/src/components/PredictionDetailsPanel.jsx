import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, AlertTriangle, CheckCircle2, XCircle, Database } from 'lucide-react';

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

  const {
    id,
    name,
    prediction,
    confidence,
    threat_severity,
    timestamp,
    ground_truth,
    dataset = 'CICIDS2017',
    is_correct,
  } = selectedAlert;

  const badgeClass = `badge-${threat_severity.toLowerCase()}`;
  const isMalicious = prediction !== 'BENIGN';
  const hasGroundTruth = ground_truth !== undefined && ground_truth !== null;
  const isMatch = is_correct !== undefined && is_correct !== null
    ? is_correct
    : (hasGroundTruth && prediction.toUpperCase() === ground_truth.toUpperCase());

  return (
    <div className="glass-card cyan-glow" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            FLOW INSPECTION ID: {id}
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem' }}>
            {name || id}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-normal" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Database size={12} /> {dataset}
          </span>
          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
            {threat_severity} SEVERITY
          </span>
        </div>
      </div>

      {/* Grid Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.875rem',
        marginBottom: '1.25rem'
      }}>
        {/* Dataset Origin */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.875rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dataset</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
            {dataset}
          </div>
        </div>

        {/* Ground Truth Class */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.875rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ground Truth</div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: hasGroundTruth ? (ground_truth === 'BENIGN' ? 'var(--severity-normal)' : 'var(--severity-high)') : 'var(--text-dim)',
            marginTop: '0.25rem'
          }}>
            {ground_truth || 'N/A (Custom)'}
          </div>
        </div>

        {/* Model Prediction Class */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.875rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model Prediction</div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)',
            marginTop: '0.25rem'
          }}>
            {prediction}
          </div>
        </div>

        {/* Verification Status */}
        {hasGroundTruth && (
          <div style={{
            background: isMatch ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            border: isMatch ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.875rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Validation Status</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '1rem',
              fontWeight: 800,
              color: isMatch ? 'var(--severity-normal)' : 'var(--severity-critical)',
              marginTop: '0.25rem'
            }}>
              {isMatch ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isMatch ? 'Correct (Match)' : 'Misclassified'}
            </div>
          </div>
        )}

        {/* Statistical Confidence */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.875rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prediction Confidence</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timestamp</div>
          <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginTop: '0.4rem' }}>
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
            AUTOMATED SOC ACTION PROTOCOL
          </div>
          <p style={{ fontSize: '0.875rem', color: '#f1f5f9', marginTop: '0.25rem' }}>
            {isMalicious
              ? `Operational protocol for ${prediction} [${threat_severity}]: Automated network rate limiting & host firewall inspection rules deployed.`
              : 'Permit traffic flow. Statistical confidence and threat matrix indicate normal traffic behavior.'}
          </p>
        </div>
      </div>
    </div>
  );
}

