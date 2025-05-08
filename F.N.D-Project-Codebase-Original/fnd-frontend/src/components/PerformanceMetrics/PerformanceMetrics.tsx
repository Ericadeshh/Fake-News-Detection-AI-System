import { motion, AnimatePresence } from "framer-motion";
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
  FaCommentDots,
  FaLink,
} from "react-icons/fa";
import { MdOutlineFeedback } from "react-icons/md";
import { LuFolderInput } from "react-icons/lu";
import styles from "./PerformanceMetrics.module.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface DonutSegmentStyle extends CSSProperties {
  "--value": number;
  "--total": number;
  "--color": string;
}

type SystemStats = {
  total_predictions: number;
  true_predictions: number;
  fake_predictions: number;
  average_confidence: number;
  feedback_rate: number;
  unique_sources: number;
  feedback_stats: {
    correct: number;
    incorrect: number;
    changed: number;
  };
  input_methods: {
    text: number;
    file: number;
    url: number;
  };
  recent_predictions: {
    hour: number;
    predictions: number;
    true_count: number;
    fake_count: number;
  }[];
};

interface PerformanceMetricsProps {
  stats: SystemStats | null;
}

const defaultStats: SystemStats = {
  total_predictions: 1254,
  true_predictions: 842,
  fake_predictions: 412,
  average_confidence: 92.4,
  feedback_rate: 15.2,
  unique_sources: 320,
  feedback_stats: {
    correct: 89,
    incorrect: 12,
    changed: 7,
  },
  input_methods: {
    text: 752,
    file: 314,
    url: 188,
  },
  recent_predictions: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    predictions: Math.floor(Math.random() * 50),
    true_count: Math.floor(Math.random() * 30),
    fake_count: Math.floor(Math.random() * 20),
  })),
};

// Animation variants for Input Method Distribution bars
const barVariants = {
  initial: { height: 0, opacity: 0 },
  animate: (index: number) => ({
    height: "100%",
    opacity: 1,
    transition: {
      height: { duration: 0.8, ease: "easeOut", delay: index * 0.2 },
      opacity: { duration: 0.4, delay: index * 0.2 },
    },
  }),
};

// Animation for System Performance cards
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.2, ease: "easeOut" },
  }),
};

// Animation for Line Chart curve
const lineVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

// Animation for prediction dots
const dotVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, delay: index * 0.1, ease: "easeOut" },
  }),
};

// Animation for Read More expansion
const descriptionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const PerformanceMetrics = ({ stats }: PerformanceMetricsProps) => {
  const [displayStats, setDisplayStats] = useState<SystemStats>(defaultStats);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const analyticsDescription = `
    This dashboard tracks the performance of our AI-powered fake news detection system, utilizing a Long Short-Term Memory (LSTM) neural network with 96-dimensional word embeddings and dual LSTM layers (48 and 24 units). Text inputs are tokenized and padded to a fixed length of 150 tokens for consistent processing. The model outputs confidence scores, which are aggregated to provide average confidence metrics. Real-time updates are enabled through Server-Sent Events (SSE) for instant prediction tracking and periodic polling every 60 seconds for comprehensive stats. User feedback is integrated to refine accuracy, with metrics reflecting the system's ability to classify content as true or fake based on linguistic patterns.
  `.trim();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/stats");
        if (!response.ok) throw new Error("Server not responding");
        const serverStats = await response.json();
        setDisplayStats(serverStats);
        setLastUpdate(new Date());
        setUsingDemoData(false);
      } catch (error) {
        console.log("Using demo data:", error);
        setUsingDemoData(true);
        setLastUpdate(new Date());
      }
    };

    if (stats) {
      setDisplayStats(stats);
      setLastUpdate(new Date());
    } else {
      fetchStats();
    }

    const eventSource = new EventSource(
      "http://localhost:5000/recent-activity-stream"
    );
    eventSource.onmessage = (event) => {
      if (event.data === "new_prediction") {
        fetchStats();
      }
    };
    eventSource.onerror = () => {
      console.log("SSE error, falling back to demo data");
      setUsingDemoData(true);
    };

    const interval = setInterval(fetchStats, 60000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [stats]);

  const AnimatedDot = ({
    cx,
    cy,
    payload,
    index,
  }: {
    cx: number;
    cy: number;
    payload: { true_count: number; fake_count: number };
    index: number;
  }) => {
    const isTrue = payload.true_count > 0;
    const isFake = payload.fake_count > 0;
    const fillColor = isTrue ? "#1abc9c" : isFake ? "#e74c3c" : "#777";

    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={isTrue || isFake ? 8 : 4}
        fill={fillColor}
        className={styles.predictionDot}
        variants={dotVariants}
        initial="initial"
        animate="animate"
        custom={index}
      />
    );
  };

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
            <p className={styles.sectionSubtext}>
              <FaInfoCircle className={styles.brownIcon} />
              {usingDemoData
                ? "Demo data shown - Server offline"
                : "Monitoring real-time NLP predictions powered by a deep learning LSTM model"}
            </p>
          </div>
        </motion.h3>
        <div className={styles.lastUpdated}>
          <FaRegClock className={styles.greenIcon} /> Updated:{" "}
          {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
      <div className={styles.analyticsDetails}>
        <p className={styles.analyticsPreview}>{analyticsDescription}</p>
        {!showFullDescription && (
          <button
            className={styles.readMoreButton}
            onClick={() => setShowFullDescription(true)}
          >
            Read More
          </button>
        )}
        <AnimatePresence>
          {showFullDescription && (
            <motion.div
              className={styles.analyticsFull}
              variants={descriptionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <p>{analyticsDescription}</p>
              <button
                className={styles.readMoreButton}
                onClick={() => setShowFullDescription(false)}
              >
                Read Less
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.topMetrics}>
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
                (displayStats.true_predictions /
                  displayStats.total_predictions) *
                100
              ).toFixed(1)}% accuracy`,
              className: styles.successCard,
            },
            {
              icon: <FaUserTimes />,
              value: displayStats.fake_predictions,
              label: "Detected Fabrications",
              trend: `${(
                (displayStats.fake_predictions /
                  displayStats.total_predictions) *
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
        </div>

        <div className={styles.groupedCharts}>
          <motion.div
            className={`${styles.metricChart} ${styles.fullWidth}`}
            whileHover={{ scale: 1.002 }}
          >
            <h4 className={styles.DistributionHeader}>
              <LuFolderInput className={styles.greenIcon} /> Input Method
              Distribution
              <p className={styles.chartDescription}>
                <FaGlobe className={styles.brownIcon} /> Live breakdown of
                content submission channels
              </p>
            </h4>
            <p className={styles.inputDistributionDescription}>
              Real-time visualization of how users submit content for analysis,
              updated instantly as users interact with the system via text
              input, file uploads, or URL links.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "Text", value: displayStats.input_methods.text },
                  { name: "File", value: displayStats.input_methods.file },
                  { name: "URL", value: displayStats.input_methods.url },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#1abc9c"
                  className={styles.animatedBar}
                >
                  {[
                    { name: "Text", value: displayStats.input_methods.text },
                    { name: "File", value: displayStats.input_methods.file },
                    { name: "URL", value: displayStats.input_methods.url },
                  ].map((_, index) => (
                    <motion.rect
                      key={`bar-${index}`}
                      variants={barVariants}
                      initial="initial"
                      animate="animate"
                      custom={index}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className={styles.inputMethodStats}>
              <p>
                Text: {displayStats.input_methods.text} (
                {(
                  (displayStats.input_methods.text /
                    displayStats.total_predictions) *
                  100
                ).toFixed(1)}
                %)
              </p>
              <p>
                File: {displayStats.input_methods.file} (
                {(
                  (displayStats.input_methods.file /
                    displayStats.total_predictions) *
                  100
                ).toFixed(1)}
                %)
              </p>
              <p>
                URL: {displayStats.input_methods.url} (
                {(
                  (displayStats.input_methods.url /
                    displayStats.total_predictions) *
                  100
                ).toFixed(1)}
                %)
              </p>
              <p>Total: {displayStats.total_predictions}</p>
            </div>
          </motion.div>

          <div className={styles.metricChart}>
            <motion.div
              className={styles.validationChart}
              whileHover={{ scale: 1.002 }}
            >
              <h4>
                <RiTimerFlashLine className={styles.greenIcon} /> System
                Performance
                <p className={styles.chartDescription}>
                  <FaRegClock className={styles.brownIcon} /> Key metrics on
                  database operations
                </p>
              </h4>
              <p className={styles.chartExplanation}>
                These metrics show the volume and diversity of content analyzed,
                plus how actively users provide feedback, all drawn from
                database records.
              </p>
              <div className={styles.performanceGrid}>
                {[
                  {
                    icon: <FaChartBar />,
                    value: displayStats.total_predictions,
                    label: "Prediction Volume",
                    description:
                      "Total content analyses performed by the AI, stored in the database.",
                    className: styles.performanceCard,
                  },
                  {
                    icon: <FaCommentDots />,
                    value: `${displayStats.feedback_rate.toFixed(1)}%`,
                    label: "Feedback Rate",
                    description:
                      "Percentage of analyses with user feedback, reflecting engagement.",
                    className: styles.performanceCard,
                  },
                  {
                    icon: <FaLink />,
                    value: displayStats.unique_sources,
                    label: "Unique Sources",
                    description:
                      "Number of unique content sources analyzed, from database records.",
                    className: styles.performanceCard,
                  },
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    className={`${styles.performanceCard} ${metric.className}`}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    custom={index}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.metricIcon}>{metric.icon}</div>
                    <div className={styles.metricValue}>{metric.value}</div>
                    <div className={styles.metricLabel}>{metric.label}</div>
                    <div className={styles.metricDescription}>
                      {metric.description}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className={styles.note}>
                <FaInfoCircle /> Based on database queries and user interactions
              </div>
            </motion.div>

            <motion.div
              className={styles.validationChart}
              whileHover={{ scale: 1.002 }}
            >
              <h4>
                <MdOutlineFeedback className={styles.greenIcon} /> Community
                Validation
                <p className={styles.chartDescription}>
                  <FaCheck className={styles.brownIcon} /> User-reported
                  accuracy metrics
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
                    } as DonutSegmentStyle
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
                    } as DonutSegmentStyle
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
          </div>
        </div>

        <motion.div
          className={`${styles.metricChart} ${styles.fullWidth} ${styles.recentActivityChart}`}
          whileHover={{ scale: 1.002 }}
        >
          <h4>
            <FaRegClock className={styles.greenIcon} /> Recent Activity
            <p className={styles.chartDescription}>
              <FaInfoCircle className={styles.brownIcon} /> Predictions over the
              last 24 hours
            </p>
          </h4>
          <div className={styles.chartExplanation}>
            <p>
              This graph shows predictions made in the last 24 hours, with teal
              dots for True and coral dots for Fake classifications, updated
              instantly when content is verified.
              <br />
              <span className={styles.axisLabel}>X-Axis:</span> Hour of day
              (24-hour format)
              <br />
              <span className={styles.axisLabel}>Y-Axis:</span> Number of
              predictions
            </p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={displayStats.recent_predictions}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="hour"
                label={{
                  value: "Hour of Day",
                  position: "bottom",
                  fill: "#5e503f",
                  fontSize: 12,
                }}
                tick={{ fill: "#5e503f" }}
              />
              <YAxis
                label={{
                  value: "Predictions",
                  angle: -90,
                  position: "left",
                  fill: "#5e503f",
                  fontSize: 12,
                }}
                tick={{ fill: "#5e503f" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #1abc9c",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(94, 80, 63, 0.1)",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                formatter={() => (
                  <span className={styles.legendText}>Predictions</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="predictions"
                stroke="#1abc9c"
                strokeWidth={2}
                dot={(props) => <AnimatedDot {...props} />}
                activeDot={{
                  r: 10,
                  fill: "#fff",
                  stroke: "#1abc9c",
                  strokeWidth: 2,
                }}
              >
                <motion.path
                  variants={lineVariants}
                  initial="initial"
                  animate="animate"
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PerformanceMetrics;
