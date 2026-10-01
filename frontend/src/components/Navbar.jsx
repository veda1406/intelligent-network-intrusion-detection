import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Activity, Cpu, Server, RefreshCw } from 'lucide-react';

export default function Navbar({ health, onRefreshHealth }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isOnline = health && health.status === 'healthy';
  const isModelLoaded = health && health.model_loaded;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(7, 9, 14, 0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.875rem 2rem'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Brand / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                INTELLIGENT NIDS
              </h1>
              <span className="badge badge-normal" style={{ fontSize: '0.65rem' }}>v1.0</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Security Operations Center (SOC) & Threat Analysis Dashboard
            </p>
          </div>
        </div>

        {/* Right: Operational Health Badges & Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Real-time Clock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '0.375rem 0.875rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <Activity size={14} color="var(--accent-cyan)" />
            {time.toLocaleTimeString()} UTC+5:30
          </div>

          {/* Backend Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.375rem 0.875rem',
              borderRadius: '8px',
              background: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: isOnline ? 'var(--severity-normal)' : 'var(--severity-critical)'
            }}>
              <span className={`status-dot ${isOnline ? 'green' : 'red'}`} />
              {isOnline ? 'API BACKEND ONLINE' : 'API DISCONNECTED'}
            </div>

            {/* Model Artifact Loaded Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.375rem 0.875rem',
              borderRadius: '8px',
              background: isModelLoaded ? 'rgba(0, 242, 254, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: isModelLoaded ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              color: isModelLoaded ? 'var(--accent-cyan)' : 'var(--severity-medium)'
            }}>
              <Cpu size={14} />
              {isModelLoaded ? 'MODEL LOADED' : 'DEMO MODE'}
            </div>

            <button
              onClick={onRefreshHealth}
              title="Refresh Health Status"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.45rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
