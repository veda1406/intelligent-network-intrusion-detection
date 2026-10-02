import React, { useState } from 'react';
import KPICards from './KPICards';
import TrafficDistributionChart from './TrafficDistributionChart';
import SeverityDistributionChart from './SeverityDistributionChart';
import RecentAlertsTable from './RecentAlertsTable';
import { ShieldCheck, ShieldAlert, X, Database } from 'lucide-react';

export default function SocOverviewView({
  alerts,
  modelStats,
}) {
  const [inspectedAlert, setInspectedAlert] = useState(null);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* View Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '0.25rem'
        }}>
          Security Operations Center (SOC) Telemetry Overview
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Consolidated network flow telemetry, threat distributions, and cumulative intrusion alert logs.
        </p>
      </div>

      {/* KPI Metric Cards */}
      <KPICards alerts={alerts} modelStats={modelStats} />

      {/* Distribution Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <TrafficDistributionChart alerts={alerts} />
        <SeverityDistributionChart alerts={alerts} />
      </div>

      {/* Inspected Alert Modal / Callout if selected */}
      {inspectedAlert && (
        <div className="clean-card" style={{
          marginBottom: '1.5rem',
          borderLeft: inspectedAlert.prediction !== 'BENIGN' ? '5px solid var(--severity-critical)' : '5px solid var(--severity-normal)',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {inspectedAlert.prediction !== 'BENIGN' ? (
                <ShieldAlert size={20} color="var(--severity-critical)" />
              ) : (
                <ShieldCheck size={20} color="var(--severity-normal)" />
              )}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Inspected Flow: {inspectedAlert.name || inspectedAlert.id}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setInspectedAlert(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{ background: 'var(--bg-surface-muted)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ground Truth:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inspectedAlert.ground_truth || 'N/A'}</div>
            </div>
            <div style={{ background: 'var(--bg-surface-muted)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Prediction:</span>
              <div style={{ fontWeight: 700, color: inspectedAlert.prediction !== 'BENIGN' ? 'var(--severity-critical)' : 'var(--severity-normal)' }}>
                {inspectedAlert.prediction}
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface-muted)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Confidence:</span>
              <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                {((inspectedAlert.confidence || 0) * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface-muted)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Threat Severity:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inspectedAlert.threat_severity}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts & Flows Table */}
      <RecentAlertsTable
        alerts={alerts}
        selectedAlert={inspectedAlert}
        onSelectAlert={setInspectedAlert}
      />
    </div>
  );
}
