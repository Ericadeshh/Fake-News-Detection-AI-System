import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaTimes,
  FaRedo,
  FaArrowLeft,
  FaExclamationTriangle,
  FaInfoCircle,
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
  if (!result) return null;

  return (
    <>
      <motion.div
        className={`${styles.resultCard} ${
          result.prediction === "true" ? styles.true : styles.fake
        }`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className={styles.resultHeader}>
          <h2>
            Analysis Result: <span>{result.prediction.toUpperCase()}</span>
          </h2>
          <motion.button
            onClick={resetForm}
            className={styles.newAnalysisButton}
            whileHover={{ x: -3 }}
          >
            <FaArrowLeft /> New Analysis
          </motion.button>
        </div>

        <div className={styles.confidenceMeter}>
          <div className={styles.meterInfo}>
            <span>Confidence Level:</span>
            <span>{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className={styles.meterTrack}>
            <div
              className={styles.meterFill}
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence>
          {feedbackStatus === "success" ? (
            <motion.div
              className={styles.feedbackSuccess}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaCheck /> Thank you for your feedback!
              <motion.button
                onClick={changeFeedbackAnalysis}
                className={styles.changeFeedbackButton}
                whileHover={{ scale: 1.05 }}
              >
                <FaRedo /> Modify Assessment
              </motion.button>
            </motion.div>
          ) : feedbackStatus === "changed" ? (
            <motion.div
              className={styles.feedbackChanged}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaInfoCircle /> Analysis updated successfully!
            </motion.div>
          ) : (
            <motion.div
              className={styles.feedbackSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>How accurate was this analysis?</p>
              <div className={styles.feedbackButtons}>
                <motion.button
                  onClick={() => submitFeedback("correct")}
                  className={styles.correctButton}
                  whileHover={{ scale: 1.05 }}
                >
                  <FaCheck /> Accurate
                </motion.button>
                <motion.button
                  onClick={() => submitFeedback("incorrect")}
                  className={styles.incorrectButton}
                  whileHover={{ scale: 1.05 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <FaExclamationTriangle /> <strong>{error.error}</strong>
              {error.details && <p>{error.details}</p>}
            </div>
            <button onClick={() => setError(null)} aria-label="Close">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnalysisResult;
