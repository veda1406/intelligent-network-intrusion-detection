import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function KPICards({ alerts, modelStats }) {
  const totalFlows = alerts ? alerts.length : 0;
  const maliciousCount = alerts ? alerts.filter(a => a.prediction !== 'BENIGN').length : 0;
  const normalCount = totalFlows - maliciousCount;
  const maliciousPercentage = totalFlows > 0 ? ((maliciousCount / totalFlows) * 100).toFixed(1) : 0;

  const criticalHighCount = alerts
    ? alerts.filter(a => a.threat_severity === 'CRITICAL' || a.threat_severity === 'HIGH').length
    : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      {/* KPI 1: Total Flows */}
      <div className="clean-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Evaluated Flows
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--accent-primary-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Activity size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalFlows}
          </span>
          <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
            Live Stream
          </span>
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Ingested network packet telemetry flows
        </div>
      </div>

      {/* KPI 2: Normal vs Malicious Traffic Ratio */}
      <div className="clean-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Threat Ratio
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--severity-normal-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--severity-normal)'
          }}>
            <ShieldCheck size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {maliciousPercentage}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({maliciousCount} Intrusion / {normalCount} Benign)
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: '#f1f5f9',
          borderRadius: '3px',
          marginTop: '0.75rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${maliciousPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
            borderRadius: '3px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* KPI 3: High/Critical Threats */}
      <div className="clean-card" style={{
        borderLeft: criticalHighCount > 0 ? '4px solid var(--severity-critical)' : '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            High & Critical Alerts
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--severity-critical-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--severity-critical)'
          }}>
            <ShieldAlert size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            fontWeight: 800,
            color: criticalHighCount > 0 ? 'var(--severity-critical)' : 'var(--text-main)'
          }}>
            {criticalHighCount}
          </span>
          <span className={`badge ${criticalHighCount > 0 ? 'badge-critical' : 'badge-normal'}`}>
            {criticalHighCount > 0 ? 'Action Needed' : 'Normal State'}
          </span>
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          High severity attack vector classifications
        </div>
      </div>

      {/* KPI 4: Active Model */}
      <div className="clean-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Production AI
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--accent-primary-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Cpu size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {modelStats ? modelStats.model_name : 'RandomForestEnsemble'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Empirical Test Accuracy:</span>
          <span className="badge badge-normal" style={{ fontSize: '0.75rem' }}>
            {modelStats ? (modelStats.accuracy * 100).toFixed(1) : '98.5'}%
          </span>
        </div>
      </div>
    </div>
  );
}
