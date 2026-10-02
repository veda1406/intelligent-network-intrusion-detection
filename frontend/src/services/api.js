const BASE_URL = '';

/**
 * Checks backend health status
 */
export async function fetchHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API Error (fetchHealth):", err);
    return { status: 'offline', model_loaded: false, version: '1.0.0', error: err.message };
  }
}

/**
 * Fetches model statistics, target classes, and threat threshold definitions
 */
export async function fetchModelStats() {
  try {
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (!res.ok) throw new Error(`Failed to fetch model stats (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error("API Error (fetchModelStats):", err);
    return null;
  }
}

/**
 * Fetches pre-configured sample network flow presets
 */
export async function fetchSampleFlows() {
  try {
    const res = await fetch(`${BASE_URL}/api/sample-flows`);
    if (!res.ok) throw new Error(`Failed to fetch sample flows (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error("API Error (fetchSampleFlows):", err);
    return [];
  }
}

/**
 * Fetches an arbitrary random held-out test sample from the CICIDS2017 test partition
 */
export async function fetchRandomTestSample() {
  try {
    const res = await fetch(`${BASE_URL}/api/random-test-sample`);
    if (!res.ok) throw new Error(`Failed to fetch random test sample (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error("API Error (fetchRandomTestSample):", err);
    throw err;
  }
}

/**
 * Sends network flow feature dictionary to FastAPI /predict endpoint
 * @param {Object} featuresDict - Key-value pair of network flow features
 * @param {string} [groundTruth] - Optional ground truth label
 * @param {string} [dataset] - Optional dataset identifier
 */
export async function predictFlow(featuresDict, groundTruth = null, dataset = "CICIDS2017") {
  try {
    const payload = {
      features: featuresDict,
      ground_truth: groundTruth,
      dataset: dataset,
    };

    const res = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Prediction request failed (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.error("API Error (predictFlow):", err);
    throw err;
  }
}

