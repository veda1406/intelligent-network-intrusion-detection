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
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      {/* KPI 1: Total Flows */}
      <div className="glasscard cyan-glow" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Evaluated Flows
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(0, 242, 254, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <Activity size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            {totalFlows}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--severity-normal)', fontWeight: 600 }}>
            Live Monitoring
          </span>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Ingested network packet telemetry streams
        </div>
      </div>

      {/* KPI 2: Normal vs Malicious Traffic Ratio */}
      <div className="glasscard" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Threat Ratio
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--severity-normal)'
          }}>
            <ShieldCheck size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
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
          background: 'rgba(255, 255, 255, 0.08)',
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
      <div className="glasscard" style={{
        background: 'var(--bg-card)',
        border: criticalHighCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            High & Critical Alerts
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--severity-critical)'
          }}>
            <ShieldAlert size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            fontWeight: 800,
            color: criticalHighCount > 0 ? 'var(--severity-critical)' : '#fff'
          }}>
            {criticalHighCount}
          </span>
          <span className={`badge ${criticalHighCount > 0 ? 'badge-critical' : 'badge-normal'}`}>
            {criticalHighCount > 0 ? 'Action Needed' : 'Normal State'}
          </span>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          High severity attack vector classifications
        </div>
      </div>

      {/* KPI 4: Model Architecture */}
      <div className="glasscard" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active AI Model
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-purple)'
          }}>
            <Cpu size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            {modelStats ? modelStats.model_name : 'RandomForestEnsemble'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.625rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Empirical Test Accuracy:</span>
          <span className="badge badge-normal" style={{ fontSize: '0.75rem' }}>
            {modelStats ? (modelStats.accuracy * 100).toFixed(1) : '98.5'}%
          </span>
        </div>
      </div>
    </div>
  );
}
