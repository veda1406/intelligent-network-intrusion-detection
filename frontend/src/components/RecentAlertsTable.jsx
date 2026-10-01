import React, { useState } from 'react';
import { Search, ShieldAlert, Sliders, ExternalLink } from 'lucide-react';

export default function RecentAlertsTable({ alerts, selectedAlert, onSelectAlert }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.threat_severity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterSeverity === 'ALL' || a.threat_severity === filterSeverity;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      {/* Table Header & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700 }}>
            Recent Intrusion Alerts & Network Flows
          </h3>
          <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
            {filteredAlerts.length} Recorded
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.35rem 0.65rem'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search category or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                width: '160px'
              }}
            />
          </div>

          {/* Severity Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'NORMAL'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                style={{
                  background: filterSeverity === sev ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: filterSeverity === sev ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  color: filterSeverity === sev ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table className="soc-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Flow ID / Preset</th>
              <th>Predicted Category</th>
              <th>Model Certainty</th>
              <th>Threat Severity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No network flow alerts matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = selectedAlert && selectedAlert.id === alert.id;
                const badgeClass = `badge-${alert.threat_severity.toLowerCase()}`;

                return (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert(alert)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(0, 242, 254, 0.06)' : 'transparent'
                    }}
                  >
                    <td className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {alert.timestamp}
                    </td>
                    <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                      {alert.name || alert.id}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: alert.prediction === 'BENIGN' ? 'var(--severity-normal)' : 'var(--severity-high)'
                      }}>
                        {alert.prediction}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.8rem' }}>
                          {(alert.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{alert.threat_severity}</span>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlert(alert);
                        }}
                        style={{
                          background: 'rgba(0, 242, 254, 0.1)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        Inspect <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
