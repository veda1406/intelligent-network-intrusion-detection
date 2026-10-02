import React from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, Sparkles, BarChart2 } from 'lucide-react';

export default function ExplainableAiStep({
  predictionResult,
  onGoBack,
  onProceedToThreatResponse,
}) {
  if (!predictionResult) {
    return (
      <div className="clean-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No prediction result available to explain.</p>
        <button type="button" className="btn btn-primary" onClick={onGoBack} style={{ marginTop: '1rem' }}>
          ← Back
        </button>
      </div>
    );
  }

  const {
    prediction,
    confidence,
    top_shap_features,
  } = predictionResult;

  const shapEntries = top_shap_features ? Object.entries(top_shap_features) : [];
  const maxVal = shapEntries.length > 0 ? Math.max(...shapEntries.map(([_, v]) => Math.abs(v))) : 1;

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
            WHY DID THE MODEL MAKE THIS DECISION?
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Explainable AI (XAI) feature attribution powered by SHAP (SHapley Additive exPlanations).
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={onGoBack} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
          <ArrowLeft size={14} /> Back to Prediction
        </button>
      </div>

      {/* Main SHAP Explanation Card */}
      <div className="clean-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Top Influential Flow Features (SHAP Values)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Relative contribution toward predicting <strong style={{ color: 'var(--text-main)' }}>{prediction}</strong> (Confidence: {(confidence * 100).toFixed(1)}%)
            </div>
          </div>
          <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>
            <Sparkles size={12} /> Local TreeExplainer
          </span>
        </div>

        {/* Feature Horizontal Bars */}
        {shapEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No feature importance attributions returned for this flow.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {shapEntries.map(([featName, val]) => {
              const absVal = Math.abs(val);
              const percentage = maxVal > 0 ? (absVal / maxVal) * 100 : 0;
              const formattedVal = val >= 0 ? `+${val.toFixed(4)}` : val.toFixed(4);

              return (
                <div key={featName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {featName}
                    </span>
                    <span className="font-mono" style={{
                      fontWeight: 700,
                      color: val >= 0 ? 'var(--accent-primary)' : 'var(--severity-high)',
                      fontSize: '0.85rem'
                    }}>
                      {formattedVal}
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '10px',
                    background: '#f1f5f9',
                    borderRadius: '5px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: val >= 0 ? 'var(--accent-primary)' : 'var(--severity-high)',
                      borderRadius: '5px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Explanatory "What does this mean?" Card */}
        <div style={{
          background: 'var(--bg-surface-muted)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <HelpCircle size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              What does this mean?
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
              The highlighted features had the strongest influence on the model's classification of this network flow. SHAP values mathematically isolate the marginal contribution of each packet metric toward the final probability output, providing auditable decision transparency for security operations analysts.
            </p>
          </div>
        </div>
      </div>

      {/* Step Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem'
      }}>
        <button type="button" className="btn btn-secondary" onClick={onGoBack}>
          <ArrowLeft size={16} /> Back to Prediction
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onProceedToThreatResponse}
          style={{ padding: '0.75rem 1.5rem' }}
        >
          Assess Threat → <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
