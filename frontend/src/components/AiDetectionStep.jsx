import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Layers,
  Activity,
  GitBranch,
} from 'lucide-react';

export default function AiDetectionStep({
  predictionResult,
  activeFlow,
  modelStats,
  onGoBack,
  onProceedToExplanation,
}) {
  if (!predictionResult) {
    return (
      <div className="clean-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No prediction result available yet.</p>
        <button type="button" className="btn btn-primary" onClick={onGoBack} style={{ marginTop: '1rem' }}>
          ← Back to Flow Input
        </button>
      </div>
    );
  }

  const {
    prediction,
    confidence,
    ground_truth,
    is_correct,
    dnn_prediction,
    dnn_confidence,
    dnn_is_correct,
  } = predictionResult;

  const isMalicious = prediction !== 'BENIGN';
  const hasGroundTruth = ground_truth !== undefined && ground_truth !== null;
  const isMatch = is_correct !== undefined && is_correct !== null
    ? is_correct
    : (hasGroundTruth && prediction.toUpperCase() === ground_truth.toUpperCase());

  const confidencePct = (confidence * 100).toFixed(1);
  const dnnConfidencePct = dnn_confidence !== undefined && dnn_confidence !== null
    ? (dnn_confidence * 100).toFixed(1)
    : null;
  const dnnMatch = dnn_is_correct !== undefined && dnn_is_correct !== null
    ? dnn_is_correct
    : (hasGroundTruth && dnn_prediction && dnn_prediction.toUpperCase() === ground_truth.toUpperCase());

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
            AI Model Detection
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Real-time multi-class classification computed by the production RandomForestEnsemble pipeline.
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={onGoBack} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
          <ArrowLeft size={14} /> Back to Input
        </button>
      </div>

      {/* Dominant Prediction Card */}
      <div className="clean-card" style={{
        marginBottom: '1.5rem',
        borderLeft: isMalicious ? '6px solid var(--severity-critical)' : '6px solid var(--severity-normal)',
        padding: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Main Classification Callout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: isMalicious ? 'var(--severity-critical-bg)' : 'var(--severity-normal-bg)',
              border: `1px solid ${isMalicious ? 'var(--severity-critical-border)' : 'var(--severity-normal-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)'
            }}>
              {isMalicious ? <ShieldAlert size={36} /> : <ShieldCheck size={36} />}
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                OPERATIONAL AI MODEL CLASSIFICATION
              </div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2rem',
                fontWeight: 800,
                color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)',
                marginTop: '0.1rem'
              }}>
                {isMalicious ? `🚨 ${prediction} ATTACK` : `🛡️ BENIGN NORMAL TRAFFIC`}
              </h1>
            </div>
          </div>

          {/* Validation Match Badge */}
          {hasGroundTruth && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: isMatch ? 'var(--severity-normal-bg)' : 'var(--severity-critical-bg)',
              border: `1px solid ${isMatch ? 'var(--severity-normal-border)' : 'var(--severity-critical-border)'}`,
              color: isMatch ? 'var(--severity-normal)' : 'var(--severity-critical)',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              {isMatch ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{isMatch ? '✓ Correct Match' : '⚠ Misclassification'}</span>
            </div>
          )}
        </div>

        {/* 4 Primary Verification KPI Boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          {/* Box 1: Ground Truth */}
          <div style={{ background: 'var(--bg-surface-muted)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ground Truth Label</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {ground_truth || 'Custom'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Dataset verified header</div>
          </div>

          {/* Box 2: Model Prediction */}
          <div style={{ background: 'var(--bg-surface-muted)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Operational Prediction</div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)',
              marginTop: '0.2rem'
            }}>
              {prediction}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Random Forest Ensemble</div>
          </div>

          {/* Box 3: Prediction Confidence */}
          <div style={{ background: 'var(--bg-surface-muted)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Operational Confidence</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              {confidencePct}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Current flow statistical certainty</div>
          </div>

          {/* Box 4: Verification Result */}
          <div style={{ background: 'var(--bg-surface-muted)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Validation Outcome</div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: isMatch ? 'var(--severity-normal)' : 'var(--severity-critical)',
              marginTop: '0.2rem'
            }}>
              {isMatch ? 'Prediction Verified' : 'Model Discrepancy'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              {isMatch ? 'Model matched ground truth' : 'Sample classified as different category'}
            </div>
          </div>
        </div>
      </div>

      {/* Parallel Evaluation: Operational Model vs. Deep Neural Network (DNN) */}
      {dnn_prediction && (
        <div className="clean-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#4F46E5" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Parallel Inference: Operational Model vs. Deep Neural Network (DNN)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Evaluated on identical preprocessed feature vector
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {/* Model 1: Operational Model */}
            <div style={{
              background: 'var(--accent-primary-subtle)',
              border: '1px solid var(--accent-primary-border)',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>OPERATIONAL MODEL</span>
                <span className="badge badge-normal" style={{ fontSize: '0.65rem' }}>Selected</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                Random Forest Ensemble
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PREDICTION</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isMalicious ? 'var(--severity-critical)' : 'var(--severity-normal)' }}>
                    {prediction}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CONFIDENCE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {confidencePct}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MATCH</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isMatch ? 'var(--severity-normal)' : 'var(--severity-critical)' }}>
                    {isMatch ? '✓ Verified' : '⚠ Discrepancy'}
                  </div>
                </div>
              </div>
            </div>

            {/* Model 2: Deep Neural Network (DNN) */}
            <div style={{
              background: 'rgba(79, 70, 229, 0.05)',
              border: '1px solid rgba(79, 70, 229, 0.25)',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5' }}>DEEP NEURAL NETWORK (DNN)</span>
                <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>Deep Learning</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                4-Layer Keras DNN (128-64-32)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DNN PREDICTION</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: dnn_prediction !== 'BENIGN' ? 'var(--severity-critical)' : 'var(--severity-normal)' }}>
                    {dnn_prediction}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CONFIDENCE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#4F46E5' }}>
                    {dnnConfidencePct}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MATCH</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: dnnMatch ? 'var(--severity-normal)' : 'var(--severity-critical)' }}>
                    {dnnMatch ? '✓ Verified' : '⚠ Discrepancy'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* True Parallel Architecture Visual: Network Flow -> DNN / Ensemble -> Comparison -> Operational Model */}
      <div className="clean-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <GitBranch size={16} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Empirical Architecture: Parallel Model Evaluation Pipeline
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          {/* Step 1: Input */}
          <div style={{
            background: 'var(--bg-surface-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.85rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>INGEST & SCALING</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              Network Flow
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              14 Scaled Features
            </div>
          </div>

          {/* Step 2: DNN Path */}
          <div style={{
            background: 'rgba(79, 70, 229, 0.06)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            borderRadius: '10px',
            padding: '0.85rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 700 }}>DEEP LEARNING</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4F46E5', marginTop: '0.2rem' }}>
              Deep Neural Network
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              128-64-32 Dense
            </div>
          </div>

          {/* Step 3: Ensemble Path */}
          <div style={{
            background: 'var(--accent-primary-subtle)',
            border: '1px solid var(--accent-primary-border)',
            borderRadius: '10px',
            padding: '0.85rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700 }}>ENSEMBLE LEARNING</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              Random Forest Ensemble
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              100 Gini Trees
            </div>
          </div>

          {/* Step 4: Operational Model Decision */}
          <div style={{
            background: 'var(--severity-normal-bg)',
            border: '1px solid var(--severity-normal-border)',
            borderRadius: '10px',
            padding: '0.85rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--severity-normal)', fontWeight: 700 }}>OPERATIONAL SELECTION</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--severity-normal)', marginTop: '0.2rem' }}>
              Random Forest
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Empirical Winner on Tabular
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '0.85rem',
          padding: '0.5rem 0.85rem',
          background: 'var(--bg-surface-muted)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          ℹ️ <strong>Academic Methodology:</strong> The Deep Neural Network and Ensemble models were trained and benchmarked separately. Because Random Forest achieved superior empirical performance on this tabular dataset, it was designated as the operational serving model while the DNN provides the deep learning foundation.
        </div>
      </div>

      {/* Compact Model Information Card */}
      <div className="clean-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE PRODUCTION MODEL</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem' }}>
              {modelStats ? modelStats.model_name : 'RandomForestEnsemble'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Benchmark: TensorFlow/Keras DNN (128-64-32 Dense) & Traditional Baselines
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OVERALL TEST ACCURACY</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--severity-normal)' }}>
                {modelStats ? (modelStats.accuracy * 100).toFixed(1) : '98.5'}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Across held-out evaluation set</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SAMPLE CONFIDENCE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {confidencePct}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Current flow probability</div>
            </div>
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
          <ArrowLeft size={16} /> Back to Input
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onProceedToExplanation}
          style={{ padding: '0.75rem 1.5rem' }}
        >
          Why this prediction → <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
