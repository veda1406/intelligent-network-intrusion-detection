import React from 'react';
import { ShieldAlert } from 'lucide-react';

const SEVERITY_CONFIG = {
  NORMAL: { color: 'var(--severity-normal)', label: 'Normal' },
  LOW: { color: 'var(--severity-low)', label: 'Low Severity' },
  MEDIUM: { color: 'var(--severity-medium)', label: 'Medium Severity' },
  HIGH: { color: 'var(--severity-high)', label: 'High Severity' },
  CRITICAL: { color: 'var(--severity-critical)', label: 'Critical Severity' },
};

export default function SeverityDistributionChart({ alerts }) {
  const total = alerts.length;

  const counts = {
    NORMAL: 0,
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  alerts.forEach(a => {
    const sev = a.threat_severity || 'NORMAL';
    if (counts[sev] !== undefined) {
      counts[sev] += 1;
    } else {
      counts.HIGH += 1;
    }
  });

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} color="var(--severity-high)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700 }}>
            Operational Threat Severity Distribution
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Impact Breakdown
        </span>
      </div>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No severity data recorded yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
          {Object.entries(SEVERITY_CONFIG).map(([sevKey, cfg]) => {
            const cnt = counts[sevKey] || 0;
            const pct = total > 0 ? ((cnt / total) * 100).toFixed(1) : 0;
            const badgeClass = `badge-${sevKey.toLowerCase()}`;

            return (
              <div key={sevKey} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className={`badge ${badgeClass}`}>{sevKey}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                  {cnt} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-dim)' }}>events</span>
                </div>
                <div style={{
                  height: '4px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '2px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: cfg.color,
                    borderRadius: '2px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
