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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { CSSProperties, useEffect, useState } from "react";

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
  accuracy: number;
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
    predictions: 0, // Set to 0 to avoid random data
  })),
  input_methods: {
    text: 752,
    file: 314,
    url: 188,
  },
  accuracy: 88,
};

const PerformanceMetrics = ({ stats }: PerformanceMetricsProps) => {
  const [displayStats, setDisplayStats] = useState<SystemStats>(defaultStats);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [usingDemoData, setUsingDemoData] = useState(false);

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

    // Initial fetch
    if (stats) {
      setDisplayStats(stats);
      setLastUpdate(new Date());
    } else {
      fetchStats();
    }

    // Set up SSE for recent activity updates
    const eventSource = new EventSource(
      "http://localhost:5000/recent-activity-stream"
    );
    eventSource.onmessage = (event) => {
      if (event.data === "new_prediction") {
        fetchStats(); // Update stats when a new prediction is received
      }
    };
    eventSource.onerror = () => {
      console.log("SSE error, falling back to demo data");
      setUsingDemoData(true);
    };

    // Poll for other stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [stats]);

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
                : "Real-time tracking of NLP analysis accuracy"}
            </p>
          </div>
        </motion.h3>
        <div className={styles.lastUpdated}>
          <FaRegClock className={styles.greenIcon} /> Updated:{" "}
          {lastUpdate.toLocaleTimeString()}
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

        <div className={styles.groupedCharts}>
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
            <p className={styles.inputDistributionDescription}>
              A breakdown of how users submit content for analysis, showing the
              frequency of submissions through text input, file uploads, and URL
              links.
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
                <Bar dataKey="value" fill="#1abc9c" />
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

          <div className={styles.validations}>
            <motion.div
              className={styles.metricChart}
              whileHover={{ scale: 1.005 }}
            >
              <h4>
                <RiTimerFlashLine className={styles.greenIcon} /> System
                Performance
                <p className={styles.chartDescription}>
                  <FaRegClock className={styles.brownIcon} /> Operational
                  metrics and response time analysis
                </p>
              </h4>
              <div className={styles.simpleStats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {displayStats.accuracy}%
                  </div>
                  <div className={styles.statLabel}>Feedback Accuracy</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {displayStats.feedback_stats.correct}
                  </div>
                  <div className={styles.statLabel}>Correct Analyses</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {displayStats.feedback_stats.incorrect}
                  </div>
                  <div className={styles.statLabel}>Incorrect Analyses</div>
                </div>
              </div>
              <div className={styles.note}>
                <FaInfoCircle /> Based on user feedback submissions
              </div>
            </motion.div>

            <motion.div
              className={styles.metricChart}
              whileHover={{ scale: 1.005 }}
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
          className={`${styles.metricChart} ${styles.fullWidth}`}
          whileHover={{ scale: 1.005 }}
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
              This timeline shows the number of content verifications performed
              each hour over the last 24 hours.
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
              data={displayStats.recent_activity}
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
                dot={{ fill: "#1abc9c", strokeWidth: 2 }}
                activeDot={{
                  r: 8,
                  fill: "#fff",
                  stroke: "#1abc9c",
                  strokeWidth: 2,
                  style: {
                    filter: "drop-shadow(0 2px 4px rgba(26, 188, 156, 0.3))",
                  },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PerformanceMetrics;
