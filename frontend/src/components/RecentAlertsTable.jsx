import React, { useState } from 'react';
import { Search, ShieldAlert, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecentAlertsTable({ alerts, selectedAlert, onSelectAlert }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const alertsList = alerts || [];

  const filteredAlerts = alertsList.filter(a => {
    const matchesSearch =
      (a.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.prediction || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.ground_truth || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.threat_severity || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterSeverity === 'ALL' || a.threat_severity === filterSeverity;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="clean-card" style={{ marginBottom: '1.5rem' }}>
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
          <ShieldAlert size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Recent Intrusion Alerts & Evaluated Flows
          </h3>
          <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
            {filteredAlerts.length} of {alertsList.length} Flows
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-surface-muted)',
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
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none',
                width: '160px'
              }}
            />
          </div>

          {/* Severity Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'NORMAL'].map(sev => {
              const isSelected = filterSeverity === sev;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    background: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-muted)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <table className="soc-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Flow ID / Preset</th>
              <th>Ground Truth</th>
              <th>Predicted Category</th>
              <th>Validation</th>
              <th>Certainty</th>
              <th>Severity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No network flow alerts matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = selectedAlert && selectedAlert.id === alert.id;
                const badgeClass = `badge-${(alert.threat_severity || 'normal').toLowerCase()}`;
                const hasGT = alert.ground_truth !== undefined && alert.ground_truth !== null;
                const isMatch = alert.is_correct !== undefined && alert.is_correct !== null
                  ? alert.is_correct
                  : (hasGT && alert.prediction.toUpperCase() === alert.ground_truth.toUpperCase());

                return (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert(alert)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'var(--accent-primary-subtle)' : 'transparent'
                    }}
                  >
                    <td className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {alert.timestamp}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {alert.name || alert.id}
                    </td>
                    <td>
                      <span className={`badge ${alert.ground_truth === 'BENIGN' ? 'badge-normal' : 'badge-low'}`} style={{ fontSize: '0.7rem' }}>
                        {alert.ground_truth || 'N/A'}
                      </span>
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
                      {hasGT ? (
                        <span className={`badge ${isMatch ? 'badge-normal' : 'badge-critical'}`} style={{ fontSize: '0.65rem' }}>
                          {isMatch ? '✓ Match' : '⚠ Mismatch'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {((alert.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{alert.threat_severity}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlert(alert);
                        }}
                        style={{
                          background: 'var(--bg-surface-muted)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--accent-primary)',
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
                        Inspect <ExternalLink size={11} />
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
