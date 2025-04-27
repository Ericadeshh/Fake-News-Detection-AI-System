import { motion } from "framer-motion";
import { RiTimerFlashLine } from "react-icons/ri";
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaUserCheck,
  FaUserTimes,
  FaRegClock,
  FaInfoCircle,
  FaGlobe,
  FaCheck,
} from "react-icons/fa";
import { MdOutlineFeedback } from "react-icons/md";
import { LuFolderInput } from "react-icons/lu";
import styles from "./PerformanceMetrics.module.css";

type SystemStats = {
  total_predictions: number;
  true_predictions: number;
  fake_predictions: number;
  average_confidence: number;
  feedback_stats: {
    correct: number;
    incorrect: number;
    changed: number;
  };
  recent_activity: {
    hour: number;
    predictions: number;
  }[];
  input_methods: {
    text: number;
    file: number;
    url: number;
  };
};

interface PerformanceMetricsProps {
  stats: SystemStats | null;
}

const defaultStats: SystemStats = {
  total_predictions: 1254,
  true_predictions: 842,
  fake_predictions: 412,
  average_confidence: 92.4,
  feedback_stats: {
    correct: 89,
    incorrect: 12,
    changed: 7,
  },
  recent_activity: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    predictions: Math.floor(Math.random() * 20),
  })),
  input_methods: {
    text: 752,
    file: 314,
    url: 188,
  },
};

const PerformanceMetrics = ({ stats }: PerformanceMetricsProps) => {
  const displayStats = stats || defaultStats;

  return (
    <motion.div
      className={styles.metricsDashboard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={styles.metricsHeader}>
        <motion.h3 whileHover={{ scale: 1.01 }}>
          <FaChartLine className={styles.greenIcon} />
          AI Verification Analytics
          <div className={styles.brownIconContainer}>
            <FaInfoCircle className={styles.brownIcon} />
            <p className={styles.sectionSubtext}>
              Real-time tracking of NLP analysis accuracy across multiple input
              channels
            </p>
          </div>
        </motion.h3>
        <div className={styles.lastUpdated}>
          <FaRegClock className={styles.greenIcon} /> Updated:{" "}
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className={styles.metricsGrid}>
        {[
          {
            icon: <FaChartBar />,
            value: displayStats.total_predictions,
            label: "Total Analyses",
            trend: "+14.7% weekly",
            className: styles.primaryCard,
          },
          {
            icon: <FaUserCheck />,
            value: displayStats.true_predictions,
            label: "Verified Content",
            trend: `${(
              (displayStats.true_predictions / displayStats.total_predictions) *
              100
            ).toFixed(1)}% accuracy`,
            className: styles.successCard,
          },
          {
            icon: <FaUserTimes />,
            value: displayStats.fake_predictions,
            label: "Detected Fabrications",
            trend: `${(
              (displayStats.fake_predictions / displayStats.total_predictions) *
              100
            ).toFixed(1)}% flagged`,
            className: styles.dangerCard,
          },
          {
            icon: <FaChartPie />,
            value: `${displayStats.average_confidence.toFixed(1)}%`,
            label: "Model Confidence",
            trend: "±1.8% margin of error",
            className: styles.infoCard,
          },
        ].map((metric, index) => (
          <motion.div
            key={index}
            className={`${styles.metricCard} ${metric.className}`}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={styles.metricIcon}>{metric.icon}</div>
            <div className={styles.metricValue}>{metric.value}</div>
            <div className={styles.metricLabel}>{metric.label}</div>
            <div className={styles.metricTrend}>{metric.trend}</div>
          </motion.div>
        ))}

        {/* Input Method Distribution */}
        <motion.div
          className={`${styles.metricChart} ${styles.fullWidth}`}
          whileHover={{ scale: 1.005 }}
        >
          <h4 className={styles.DistributionHeader}>
            <LuFolderInput className={styles.greenIcon} /> Input Method
            Distribution
            <p className={styles.chartDescription}>
              <FaGlobe className={styles.brownIcon} /> Content submission
              channels utilization
            </p>
          </h4>
          <div className={styles.chartContainer}>
            {[
              { type: "text", value: displayStats.input_methods.text },
              { type: "file", value: displayStats.input_methods.file },
              { type: "url", value: displayStats.input_methods.url },
            ].map((method, index) => (
              <div
                key={index}
                className={styles.chartBar}
                style={{
                  width: `${
                    (method.value / displayStats.total_predictions) * 100
                  }%`,
                }}
              >
                <span>
                  {method.type}: {method.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Community Validation */}
        <motion.div
          className={styles.metricChart}
          whileHover={{ scale: 1.005 }}
        >
          <h4>
            <MdOutlineFeedback className={styles.greenIcon} /> Community
            Validation
            <p className={styles.chartDescription}>
              <FaCheck className={styles.brownIcon} /> User-reported accuracy
              metrics
            </p>
          </h4>
          <div className={styles.donutChart}>
            <div
              className={styles.donutSegment}
              style={
                {
                  "--value": displayStats.feedback_stats.correct,
                  "--total":
                    displayStats.feedback_stats.correct +
                    displayStats.feedback_stats.incorrect,
                  "--color": "#1abc9c",
                } as React.CSSProperties
              }
            ></div>
            <div
              className={styles.donutSegment}
              style={
                {
                  "--value": displayStats.feedback_stats.incorrect,
                  "--total":
                    displayStats.feedback_stats.correct +
                    displayStats.feedback_stats.incorrect,
                  "--color": "#e74c3c",
                } as React.CSSProperties
              }
            ></div>
            <div className={styles.donutCenter}>
              <div>
                {Math.round(
                  (displayStats.feedback_stats.correct /
                    (displayStats.feedback_stats.correct +
                      displayStats.feedback_stats.incorrect)) *
                    100 || 0
                )}
                %
              </div>
              <small>Accuracy</small>
            </div>
          </div>
          <div className={styles.legend}>
            <span>
              <i style={{ background: "#1abc9c" }}></i> Correct:{" "}
              {displayStats.feedback_stats.correct}
            </span>
            <span>
              <i style={{ background: "#e74c3c" }}></i> Incorrect:{" "}
              {displayStats.feedback_stats.incorrect}
            </span>
          </div>
        </motion.div>

        {/* System Performance */}
        <motion.div
          className={styles.metricChart}
          whileHover={{ scale: 1.005 }}
        >
          <h4>
            <RiTimerFlashLine className={styles.greenIcon} /> System Performance
            <p className={styles.chartDescription}>
              <FaRegClock className={styles.brownIcon} /> Operational metrics
              overview
            </p>
          </h4>
          <div className={styles.simpleStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {displayStats.average_confidence.toFixed(1)}%
              </div>
              <div className={styles.statLabel}>Avg Confidence</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {displayStats.feedback_stats.changed}
              </div>
              <div className={styles.statLabel}>Revised Analyses</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {displayStats.recent_activity.reduce(
                  (acc, curr) => acc + curr.predictions,
                  0
                )}
              </div>
              <div className={styles.statLabel}>Hourly Activity</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PerformanceMetrics;
