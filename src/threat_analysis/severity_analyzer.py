from typing import Dict, Any
from src.utils.logger import setup_logger

logger = setup_logger("ThreatSeverityAnalyzer")


class ThreatSeverityAnalyzer:
    """
    Threat Severity Analyzer.

    CRITICAL DISTINCTION:
    - Model Confidence: Statistical probability [0.0 - 1.0] output by the model classifier.
    - Threat Severity: Operational impact assessment (NORMAL, LOW, MEDIUM, HIGH, CRITICAL)
      based on attack category characteristics regardless of raw prediction confidence.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        threat_cfg = config.get("threat_analysis", {})
        self.severity_mapping = threat_cfg.get("severity_mapping", {})
        self.confidence_thresholds = threat_cfg.get(
            "confidence_thresholds",
            {"high_confidence": 0.85, "medium_confidence": 0.60, "low_confidence": 0.00},
        )

    def evaluate_threat(
        self, predicted_class: str, confidence_score: float
    ) -> Dict[str, Any]:
        """
        Calculates threat assessment combining operational severity rank and model certainty level.
        """
        logger.info(f"Analyzing threat for class '{predicted_class}' with confidence {confidence_score:.4f}")

        clean_class = str(predicted_class).strip()

        # Lookup base threat severity
        base_severity = self.severity_mapping.get(
            clean_class, self.severity_mapping.get("DEFAULT_MALICIOUS", "HIGH")
        )
        if clean_class.upper() == "BENIGN":
            base_severity = "NORMAL"

        # Determine confidence certainty tier
        if confidence_score >= self.confidence_thresholds.get("high_confidence", 0.85):
            confidence_level = "HIGH_CERTAINTY"
        elif confidence_score >= self.confidence_thresholds.get("medium_confidence", 0.60):
            confidence_level = "MODERATE_CERTAINTY"
        else:
            confidence_level = "LOW_CERTAINTY"

        # Formulate actionable response recommendation
        if base_severity == "CRITICAL":
            recommendation = "CRITICAL: Trigger automated network isolation, block source IP & dispatch P1 Incident Alert."
        elif base_severity == "HIGH":
            recommendation = "HIGH: Flag flow for Deep Packet Inspection (DPI) & restrict bandwidth on target interface."
        elif base_severity == "MEDIUM":
            recommendation = "MEDIUM: Log security event & heighten monitoring on client IP."
        elif base_severity == "LOW":
            recommendation = "LOW: Log flow telemetry for passive anomaly audit."
        else:
            recommendation = "NORMAL: Permit network packet flow."

        # Escalation edge case: Low Confidence + High/Critical Category -> Flag for SOC Review
        if confidence_level == "LOW_CERTAINTY" and base_severity in ["HIGH", "CRITICAL"]:
            recommendation += " [ESCALATED: Low model confidence on high-impact threat requires immediate human SOC review]"

        threat_report = {
            "predicted_class": clean_class,
            "confidence_score": round(float(confidence_score), 4),
            "threat_severity": base_severity,
            "confidence_level": confidence_level,
            "action_recommendation": recommendation,
        }

        logger.info(f"Threat evaluation result: {base_severity} severity ({confidence_level})")
        return threat_report

