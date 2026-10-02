import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Activity, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, health, onRefreshHealth }) {
  const isOnline = health && health.status === 'healthy';
  const isModelLoaded = health && health.model_loaded;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 2rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left: Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            background: 'var(--accent-primary-subtle)',
            border: '1px solid var(--accent-primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                INTELLIGENT NIDS
              </h1>
              <span className="badge badge-normal" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                v1.0 Production
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Network Intrusion Detection & Threat Analysis
            </p>
          </div>
        </div>

        {/* Center: Main View Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--bg-surface-muted)',
          padding: '0.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          {[
            { id: 'detection', label: 'Detection' },
            { id: 'overview', label: 'SOC Overview' },
            { id: 'insights', label: 'Model Insights' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                style={{
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                  borderRadius: '7px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Operational Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            background: isOnline ? 'var(--severity-normal-bg)' : 'var(--severity-critical-bg)',
            border: isOnline ? '1px solid var(--severity-normal-border)' : '1px solid var(--severity-critical-border)',
            color: isOnline ? 'var(--severity-normal)' : 'var(--severity-critical)'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'var(--severity-normal)' : 'var(--severity-critical)'
            }} />
            {isOnline ? 'API Online' : 'API Offline'}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            background: isModelLoaded ? 'var(--accent-primary-subtle)' : 'var(--severity-medium-bg)',
            border: isModelLoaded ? '1px solid var(--accent-primary-border)' : '1px solid var(--severity-medium-border)',
            color: isModelLoaded ? 'var(--accent-primary)' : 'var(--severity-medium)'
          }}>
            <Cpu size={13} />
            {isModelLoaded ? 'Model Ready' : 'Demo Mode'}
          </div>

          <button
            onClick={onRefreshHealth}
            title="Refresh System Health"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.4rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
