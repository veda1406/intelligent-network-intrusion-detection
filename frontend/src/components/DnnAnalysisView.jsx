import React, { useState, useEffect } from 'react';
import {
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Brain,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { fetchDnnEvaluation, predictWithDnn, fetchSampleFlows } from '../services/api';

export default function DnnAnalysisView({ activeFlow }) {
  const [dnnEval, setDnnEval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sampleFlows, setSampleFlows] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [sampleResult, setSampleResult] = useState(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  useEffect(() => {
    loadDnnData();
  }, []);

  async function loadDnnData() {
    setLoading(true);
    try {
      const [evaluation, samples] = await Promise.all([
        fetchDnnEvaluation(),
        fetchSampleFlows(),
      ]);
      setDnnEval(evaluation);
      setSampleFlows(samples);

      // Use currently active flow from parent if provided, otherwise default to first sample
      const initialFlow = activeFlow || (samples && samples.length > 1 ? samples[1] : null);
      if (initialFlow) {
        setSelectedSample(initialFlow);
        runDnnPrediction(initialFlow);
      }
    } catch (err) {
      console.error('Error loading DNN analysis data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function runDnnPrediction(flow) {
    if (!flow || !flow.features) return;
    setSampleLoading(true);
    try {
      const res = await predictWithDnn(flow.features, flow.ground_truth, flow.dataset || 'CICIDS2017');
      setSampleResult(res);
    } catch (err) {
      console.error('Error running DNN prediction on sample:', err);
    } finally {
      setSampleLoading(false);
    }
  }

  function handleSelectSample(flow) {
    setSelectedSample(flow);
    runDnnPrediction(flow);
  }

  if (loading) {
    return (
      <div className="clean-card" style={{ maxWidth: '1200px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
        <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Deep Neural Network architecture and evaluation metrics...</p>
      </div>
    );
  }

  const metrics = dnnEval ? dnnEval.metrics : { accuracy: 0.525, precision: 0.4855, recall: 0.525, f1_score: 0.5036 };
  const arch = dnnEval ? dnnEval.architecture : {
    input_dim: 14,
    hidden_layers: [128, 64, 32],
    activations: ['relu', 'relu', 'relu', 'softmax'],
    dropout_rate: 0.3,
    optimizer: 'Adam (LR=0.001)',
    loss_function: 'Sparse Categorical Cross-Entropy',
    batch_size: 256,
    epochs: 50,
  };
  const cm = dnnEval ? dnnEval.confusion_matrix : [];
  const classes = dnnEval ? dnnEval.classes : ['BENIGN', 'Bot', 'DDoS', 'DoS', 'PortScan'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(79, 70, 229, 0.1)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4F46E5'
          }}>
            <Brain size={20} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}>
            Deep Neural Network Analysis
          </h2>
        </div>
        <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginLeft: '3rem' }}>
          How Deep Learning learns complex nonlinear representation manifolds for network intrusion detection.
        </p>
      </div>

      {/* 4 Real Metric Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div className="clean-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            DNN Test Accuracy
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4F46E5', marginTop: '0.25rem' }}>
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Held-out evaluation split
          </div>
        </div>

        <div className="clean-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Weighted F1 Score
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {(metrics.f1_score * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Precision-Recall harmonic mean
          </div>
        </div>

        <div className="clean-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Weighted Recall
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--severity-normal)', marginTop: '0.25rem' }}>
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Attack sensitivity rate
          </div>
        </div>

        <div className="clean-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Architecture Depth
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            4 Dense Layers
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            14D $\rightarrow$ 128 $\rightarrow$ 64 $\rightarrow$ 32 $\rightarrow$ 5D
          </div>
        </div>
      </div>

      {/* Real Architecture Layer Visualizer */}
      <div className="clean-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Layers size={18} color="#4F46E5" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Deep Neural Network Layer Architecture
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Constructed in <code className="font-mono" style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>src/models/dnn.py</code> for high-dimensional nonlinear flow pattern recognition:
        </p>

        {/* Layer Blocks Horizontal Flow */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          textAlign: 'center'
        }}>
          {/* Layer 0: Input */}
          <div style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>INPUT LAYER</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {arch.input_dim} Features
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>9 Raw + 5 Engineered Ratios</div>
          </div>

          {/* Layer 1: Dense 128 */}
          <div style={{ background: 'rgba(79, 70, 229, 0.06)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 700 }}>HIDDEN LAYER 1</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#4F46E5', marginTop: '0.25rem' }}>
              Dense ({arch.hidden_layers ? arch.hidden_layers[0] : 128}, ReLU)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>BatchNorm + Dropout (0.3)</div>
          </div>

          {/* Layer 2: Dense 64 */}
          <div style={{ background: 'rgba(79, 70, 229, 0.06)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 700 }}>HIDDEN LAYER 2</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#4F46E5', marginTop: '0.25rem' }}>
              Dense ({arch.hidden_layers ? arch.hidden_layers[1] : 64}, ReLU)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>BatchNorm + Dropout (0.3)</div>
          </div>

          {/* Layer 3: Dense 32 */}
          <div style={{ background: 'rgba(79, 70, 229, 0.06)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 700 }}>HIDDEN LAYER 3</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#4F46E5', marginTop: '0.25rem' }}>
              Dense ({arch.hidden_layers ? arch.hidden_layers[2] : 32}, ReLU)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Nonlinear Feature Reduction</div>
          </div>

          {/* Layer 4: Output */}
          <div style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>OUTPUT LAYER</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              Dense (5, Softmax)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Multiclass Probability Vector</div>
          </div>
        </div>

        {/* Hyperparameter Specification Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Optimizer: </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{arch.optimizer || 'Adam (LR=0.001)'}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loss Function: </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{arch.loss_function || 'Categorical Cross-Entropy'}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Batch Size: </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{arch.batch_size || 256}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Epochs & Early Stop: </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{arch.epochs || 50} epochs (Patience 10)</span>
          </div>
        </div>
      </div>

      {/* Interactive DNN Sample Prediction Test Bench */}
      <div className="clean-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#4F46E5" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Live DNN Sample Prediction Bench
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Executes real forward pass through the trained Deep Neural Network
          </span>
        </div>

        {/* Sample Selector Pills */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Select Test Sample to Feed into DNN:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sampleFlows.map(flow => {
              const isSelected = selectedSample && selectedSample.id === flow.id;
              return (
                <button
                  key={flow.id}
                  type="button"
                  onClick={() => handleSelectSample(flow)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    background: isSelected ? '#4F46E5' : 'var(--bg-surface-muted)',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    border: isSelected ? '1px solid #4F46E5' : '1px solid var(--border-color)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {flow.category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Real DNN Prediction Result Box */}
        {sampleLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <RefreshCw size={22} className="spin" style={{ color: '#4F46E5' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Running DNN forward pass...</p>
          </div>
        ) : sampleResult ? (
          <div style={{
            background: 'var(--bg-surface-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DNN PREDICTED CLASS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: sampleResult.prediction !== 'BENIGN' ? 'var(--severity-critical)' : 'var(--severity-normal)' }}>
                  {sampleResult.prediction !== 'BENIGN' ? `🚨 ${sampleResult.prediction}` : '🛡️ BENIGN'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SOFTMAX CONFIDENCE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4F46E5' }}>
                  {(sampleResult.confidence * 100).toFixed(1)}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>GROUND TRUTH</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {sampleResult.ground_truth || 'N/A'}
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  background: sampleResult.is_correct ? 'var(--severity-normal-bg)' : 'var(--severity-critical-bg)',
                  border: `1px solid ${sampleResult.is_correct ? 'var(--severity-normal-border)' : 'var(--severity-critical-border)'}`,
                  color: sampleResult.is_correct ? 'var(--severity-normal)' : 'var(--severity-critical)',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}>
                  {sampleResult.is_correct ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{sampleResult.is_correct ? '✓ Correct Classification' : '⚠ Misclassification'}</span>
                </div>
              </div>
            </div>

            {/* Softmax Probability Distribution Bar Breakdown */}
            {sampleResult.probabilities && Object.keys(sampleResult.probabilities).length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  Softmax Probability Distribution Across Attack Classes:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(sampleResult.probabilities).map(([cls, prob]) => {
                    const probPct = (prob * 100).toFixed(1);
                    const isWinner = cls === sampleResult.prediction;
                    return (
                      <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                        <span style={{ width: '80px', fontWeight: isWinner ? 700 : 500, color: isWinner ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {cls}
                        </span>
                        <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.max(Number(probPct), 1)}%`,
                            height: '100%',
                            background: isWinner ? '#4F46E5' : '#94a3b8',
                            borderRadius: '6px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <span style={{ width: '50px', textAlign: 'right', fontWeight: isWinner ? 700 : 500, color: isWinner ? '#4F46E5' : 'var(--text-muted)' }}>
                          {probPct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Held-Out Test Split Confusion Matrix */}
      {cm && cm.length > 0 && (
        <div className="clean-card" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={18} color="#4F46E5" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Deep Neural Network Confusion Matrix (Held-out Test Partition, N={cm.flat().reduce((a, b) => a + b, 0)})
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Empirical distribution of true positive diagonal predictions vs. misclassifications across test samples:
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-muted)' }}>
                  <th style={{ padding: '0.65rem', border: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 700 }}>
                    True \ Predicted
                  </th>
                  {classes.map(cls => (
                    <th key={cls} style={{ padding: '0.65rem', border: '1px solid var(--border-color)', fontWeight: 700 }}>
                      {cls}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cm.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td style={{ padding: '0.65rem', border: '1px solid var(--border-color)', fontWeight: 700, textAlign: 'left', background: 'var(--bg-surface-muted)' }}>
                      {classes[rIdx] || `Class ${rIdx}`}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          style={{
                            padding: '0.65rem',
                            border: '1px solid var(--border-color)',
                            fontWeight: isDiagonal ? 800 : 500,
                            background: isDiagonal ? 'rgba(79, 70, 229, 0.12)' : (val > 0 ? 'rgba(239, 68, 68, 0.05)' : 'transparent'),
                            color: isDiagonal ? '#4F46E5' : (val > 0 ? 'var(--text-main)' : 'var(--text-dim)')
                          }}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Academic Defense Rationale Box */}
      <div className="clean-card" style={{ borderLeft: '5px solid #4F46E5', marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Academic Role & Defense Takeaway for Faculty
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          The Deep Neural Network provides the project's primary Deep Learning implementation. It confirms that a 4-layer neural network with batch normalization and dropout can successfully learn multi-class decision surfaces on raw flow telemetry. However, because structured tabular network data exhibits discrete threshold splits rather than smooth topological manifolds, tree-based ensemble models achieved stronger empirical separation on this evaluated CICIDS2017 setup.
        </p>
      </div>
    </div>
  );
}
