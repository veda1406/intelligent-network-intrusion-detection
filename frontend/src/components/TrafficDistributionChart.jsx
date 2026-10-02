import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';

const CATEGORY_COLORS = {
  BENIGN: 'var(--severity-normal)',
  DoS: 'var(--severity-high)',
  DDoS: 'var(--severity-critical)',
  PortScan: 'var(--severity-medium)',
  Bot: 'var(--accent-purple)',
  DEFAULT: 'var(--accent-primary)',
};

export default function TrafficDistributionChart({ alerts }) {
  const total = alerts ? alerts.length : 0;

  // Calculate counts per category
  const counts = {};
  if (alerts) {
    alerts.forEach(a => {
      const cat = a.prediction || 'BENIGN';
      counts[cat] = (counts[cat] || 0) + 1;
    });
  }

  const normalCount = counts['BENIGN'] || 0;
  const maliciousCount = total - normalCount;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      {/* Chart 1: Normal vs Malicious Breakout */}
      <div className="clean-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <PieChart size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Normal vs Malicious Traffic
          </h3>
        </div>

        {total === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No traffic flows evaluated yet.
          </div>
        ) : (
          <div>
            {/* Visual Multi-Segment Bar */}
            <div style={{
              height: '20px',
              width: '100%',
              background: '#f1f5f9',
              borderRadius: '6px',
              overflow: 'hidden',
              display: 'flex',
              marginBottom: '1.25rem'
            }}>
              <div style={{
                width: `${(normalCount / total) * 100}%`,
                background: 'var(--severity-normal)',
                transition: 'width 0.4s ease'
              }} title={`BENIGN: ${normalCount}`} />
              <div style={{
                width: `${(maliciousCount / total) * 100}%`,
                background: 'var(--severity-critical)',
                transition: 'width 0.4s ease'
              }} title={`MALICIOUS: ${maliciousCount}`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{
                background: 'var(--severity-normal-bg)',
                border: '1px solid var(--severity-normal-border)',
                padding: '0.75rem 1rem',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--severity-normal)', fontWeight: 700 }}>
                  BENIGN (Normal)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {normalCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({((normalCount / total) * 100).toFixed(1)}%)</span>
                </div>
              </div>

              <div style={{
                background: 'var(--severity-critical-bg)',
                border: '1px solid var(--severity-critical-border)',
                padding: '0.75rem 1rem',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--severity-critical)', fontWeight: 700 }}>
                  INTRUSION (Malicious)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {maliciousCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({((maliciousCount / total) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart 2: Attack Category Breakdown */}
      <div className="clean-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BarChart3 size={18} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Attack Category Distribution
          </h3>
        </div>

        {total === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No traffic flows evaluated yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(counts).map(([cat, cnt]) => {
              const pct = ((cnt / total) * 100).toFixed(1);
              const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.DEFAULT;

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {cnt} flow(s) ({pct}%)
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#f1f5f9',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
