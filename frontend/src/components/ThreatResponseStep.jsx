import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Server,
  Activity,
  Layers,
} from 'lucide-react';

export default function ThreatResponseStep({
  predictionResult,
  onGoBack,
  onEvaluateAnother,
  onViewSocOverview,
}) {
  if (!predictionResult) {
    return (
      <div className="clean-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No prediction result available to assess.</p>
        <button type="button" className="btn btn-primary" onClick={onGoBack} style={{ marginTop: '1rem' }}>
          ← Back
        </button>
      </div>
    );
  }

  const {
    prediction,
    confidence,
    threat_severity,
  } = predictionResult;

  const isMalicious = prediction !== 'BENIGN';
  const confidencePct = (confidence * 100).toFixed(1);

  const getActionRecommendation = (sev, pred) => {
    if (sev === 'CRITICAL') {
      return 'Trigger automated network host isolation, apply emergency upstream BGP drop rules & dispatch P1 Incident Alert.';
    }
    if (pred === 'DoS') {
      return 'Rate-limit suspicious traffic on ingress interface, trigger firewall SYN-flood filters & inspect affected target hosts.';
    }
    if (pred === 'DDoS') {
      return 'Activate upstream volumetric traffic scrubbers, deploy geo-blocking filters & trigger automated firewall drop rules.';
    }
    if (pred === 'PortScan') {
      return 'Enforce dynamic firewall block rule on reconnaissance source IP & flag host for intrusion escalation monitoring.';
    }
    if (pred === 'Bot') {
      return 'Sever active Command & Control (C2) socket connection, isolate endpoint machine & initiate malware forensic triage.';
    }
    if (sev === 'HIGH') {
      return 'Flag flow for Deep Packet Inspection (DPI) & restrict bandwidth on target interface.';
    }
    if (sev === 'MEDIUM') {
      return 'Log security event & heighten monitoring on client IP address.';
    }
    return 'Permit network traffic. Continuous passive telemetry logging with zero active threat containment required.';
  };

  const recommendedAction = getActionRecommendation(threat_severity, prediction);

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'CRITICAL': return 'var(--severity-critical)';
      case 'HIGH': return 'var(--severity-high)';
      case 'MEDIUM': return 'var(--severity-medium)';
      case 'LOW': return 'var(--severity-low)';
      default: return 'var(--severity-normal)';
    }
  };

  const sevColor = getSeverityColor(threat_severity);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Step Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.25rem'
          }}>
            THREAT ASSESSMENT
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Decoupled operational security risk evaluation and automated Incident Response protocol.
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={onGoBack} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
          <ArrowLeft size={14} /> Back to Explanation
        </button>
      </div>

      {/* Large Severity Card */}
      <div className="clean-card" style={{
        marginBottom: '1.5rem',
        borderLeft: `6px solid ${sevColor}`,
        padding: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`badge badge-${threat_severity.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', fontWeight: 800 }}>
                {threat_severity} SEVERITY
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Confidence: {confidencePct}%
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: '0.5rem'
            }}>
              {isMalicious ? `${prediction} Intrusion Attempt` : 'Normal Benign Network Flow'}
            </h1>
          </div>

          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: isMalicious ? 'var(--severity-critical-bg)' : 'var(--severity-normal-bg)',
            border: `1px solid ${isMalicious ? 'var(--severity-critical-border)' : 'var(--severity-normal-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)'
          }}>
            {isMalicious ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
          </div>
        </div>

        {/* 3-Part Operational Distinction Matrix */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          {/* Card 1: What is happening */}
          <div style={{
            background: 'var(--bg-surface-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              1. MODEL CLASSIFICATION
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontStyle: 'italic' }}>
              "What is happening?"
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
              {prediction}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Statistical pattern detected in packet timings, payload byte sizes, and flow rates with {confidencePct}% confidence.
            </p>
          </div>

          {/* Card 2: How serious is it */}
          <div style={{
            background: 'var(--bg-surface-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: sevColor,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              2. THREAT SEVERITY
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontStyle: 'italic' }}>
              "How serious is it?"
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: sevColor, marginTop: '0.5rem' }}>
              {threat_severity}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Decoupled operational security impact rating defined in the Threat Matrix regardless of statistical probability.
            </p>
          </div>

          {/* Card 3: What should the analyst do */}
          <div style={{
            background: isMalicious ? 'var(--severity-critical-bg)' : 'var(--severity-normal-bg)',
            border: `1px solid ${isMalicious ? 'var(--severity-critical-border)' : 'var(--severity-normal-border)'}`,
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              3. RECOMMENDED SOC ACTION
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontStyle: 'italic' }}>
              "What should the analyst do?"
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem', lineHeight: 1.4 }}>
              {recommendedAction}
            </div>
          </div>
        </div>
      </div>

      {/* Step Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button type="button" className="btn btn-secondary" onClick={onGoBack}>
          <ArrowLeft size={16} /> Back to Explanation
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onEvaluateAnother}>
            <RotateCcw size={16} /> Evaluate Another Flow
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onViewSocOverview}
            style={{ padding: '0.75rem 1.5rem' }}
          >
            View in SOC Overview → <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
