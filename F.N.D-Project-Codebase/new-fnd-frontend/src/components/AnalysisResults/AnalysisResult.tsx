import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaTimes,
  FaRedo,
  FaArrowLeft,
  FaExclamationTriangle,
  FaInfoCircle,
  FaClock,
} from "react-icons/fa";
import styles from "./AnalysisResult.module.css";

type PredictionResult = {
  prediction: "fake" | "true";
  confidence: number;
  id: number;
  input_type: "text" | "file" | "url";
};

interface AnalysisResultProps {
  result: PredictionResult | null;
  resetForm: () => void;
  submitFeedback: (feedback: "correct" | "incorrect") => void;
  feedbackStatus: "idle" | "success" | "error" | "changed";
  changeFeedbackAnalysis: () => void;
  error: { error: string; details?: string } | null;
  setError: (error: null) => void;
}

const AnalysisResult = ({
  result,
  resetForm,
  submitFeedback,
  feedbackStatus,
  changeFeedbackAnalysis,
  error,
  setError,
}: AnalysisResultProps) => {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  useEffect(() => {
    if (result) {
      // Animate confidence from 0 to the actual value
      const targetConfidence = result.confidence * 100;
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = targetConfidence / (duration / 16); // Approx 60fps

      const animate = () => {
        start += increment;
        if (start >= targetConfidence) {
          setAnimatedConfidence(targetConfidence);
        } else {
          setAnimatedConfidence(start);
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [result]);

  if (!result) return null;

  return (
    <>
      <motion.div
        className={`${styles.resultCard} ${
          result.prediction === "true" ? styles.true : styles.fake
        }`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className={styles.resultHeader}>
          <h2>
            Analysis Result: <span>{result.prediction.toUpperCase()}</span>
          </h2>
          <motion.button
            onClick={resetForm}
            className={styles.newAnalysisButton}
            whileHover={{ x: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <FaArrowLeft /> New Analysis
          </motion.button>
        </div>

        <div className={styles.confidenceMeter}>
          <div className={styles.meterInfo}>
            <span>Confidence Level:</span>
            <span className={styles.confidenceValue}>
              {animatedConfidence.toFixed(1)}%
              <motion.span
                className={styles.confidenceIcon}
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              >
                <FaInfoCircle />
              </motion.span>
            </span>
          </div>
          <div className={styles.meterTrack}>
            <motion.div
              className={styles.meterFill}
              initial={{ width: "0%" }}
              animate={{ width: `${animatedConfidence}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>
        </div>

        <motion.div
          className={styles.analysisDetails}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        >
          <h3>Analysis Details</h3>
          <div className={styles.detailItem}>
            <FaInfoCircle /> Input Type: {result.input_type.toUpperCase()}
          </div>
          <div className={styles.detailItem}>
            <FaClock /> Analyzed: {new Date().toLocaleString()}
          </div>
        </motion.div>

        <AnimatePresence>
          {feedbackStatus === "success" ? (
            <motion.div
              className={styles.feedbackSuccess}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <FaCheck /> Thank you for your feedback!
              <motion.button
                onClick={changeFeedbackAnalysis}
                className={styles.changeFeedbackButton}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <FaRedo /> Modify Assessment
              </motion.button>
            </motion.div>
          ) : feedbackStatus === "changed" ? (
            <motion.div
              className={styles.feedbackChanged}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <FaInfoCircle /> Analysis updated successfully!
            </motion.div>
          ) : (
            <motion.div
              className={styles.feedbackSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <p>How accurate was this analysis?</p>
              <div className={styles.feedbackButtons}>
                <motion.button
                  onClick={() => submitFeedback("correct")}
                  className={styles.correctButton}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 4px 12px rgba(46, 204, 113, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <FaCheck /> Accurate
                </motion.button>
                <motion.button
                  onClick={() => submitFeedback("incorrect")}
                  className={styles.incorrectButton}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <FaTimes /> Inaccurate
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            className={styles.errorAlert}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div>
              <FaExclamationTriangle /> <strong>{error.error}</strong>
              {error.details && <p>{error.details}</p>}
            </div>
            <motion.button
              onClick={() => setError(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400 }}
              aria-label="Close"
            >
              ×
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnalysisResult;
