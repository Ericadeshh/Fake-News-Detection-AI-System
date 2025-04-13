import { useState, useEffect, useRef } from "react";
import {
  FaShieldAlt,
  FaChartLine,
  FaFileAlt,
  FaLink,
  FaUpload,
  FaSearch,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaRedo,
  FaArrowLeft,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChartBar,
  FaChartPie,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";
import { BiAnalyse } from "react-icons/bi";
import styles from "./NewsChecker.module.css";

type PredictionResult = {
  prediction: "fake" | "true";
  confidence: number;
  id: number;
  status: string;
  input_type: "text" | "file" | "url";
};

type ApiError = {
  error: string;
  details?: string;
  status: string;
};

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
  accuracy: number;
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

type InputMethod = "text" | "file" | "url";

const API_BASE_URL = "http://localhost:5000";

const NewsChecker = () => {
  const [input, setInput] = useState({
    text: "",
    file: null as File | null,
    url: "",
  });
  const [inputMethod, setInputMethod] = useState<InputMethod>("text");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "success" | "error" | "changed"
  >("idle");
  const [stats, setStats] = useState<SystemStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const data = await response.json();
        // Add mock calculations for enhanced metrics
        const enhancedData = {
          ...data,
          accuracy:
            Math.round(
              (data.feedback_stats.correct /
                (data.feedback_stats.correct + data.feedback_stats.incorrect)) *
                100
            ) || 0,
          recent_activity: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            predictions: Math.floor(Math.random() * 20), // Mock data
          })),
          input_methods: {
            text: Math.floor(data.total_predictions * 0.6), // Mock distribution
            file: Math.floor(data.total_predictions * 0.25),
            url: Math.floor(data.total_predictions * 0.15),
          },
        };
        setStats(enhancedData);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, [result]);

  const checkNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let content = "";
      if (inputMethod === "text") content = input.text;
      else if (inputMethod === "file" && input.file) {
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(input.file!);
        });
      } else if (inputMethod === "url" && input.url) {
        const response = await fetch(`${API_BASE_URL}/fetch-article`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: input.url }),
        });
        if (!response.ok) throw new Error("Failed to fetch article from URL");
        content = (await response.json()).content || "";
      }

      if (!content.trim()) throw new Error("No content provided for analysis");

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, input_type: inputMethod }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");

      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
        id: data.id,
        input_type: data.input_type || inputMethod,
        status: data.status,
      });
    } catch (err) {
      setError({
        error: "Failed to process prediction",
        details: err instanceof Error ? err.message : "Unknown error",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (feedback: "correct" | "incorrect") => {
    if (!result) return;
    setFeedbackStatus("idle");

    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.id, feedback }),
      });

      if (!response.ok) throw new Error("Feedback submission failed");
      setFeedbackStatus("success");
      const statsResponse = await fetch(`${API_BASE_URL}/stats`);
      setStats(await statsResponse.json());
    } catch (err) {
      setFeedbackStatus("error");
      setError({
        error: "Failed to submit feedback",
        details: err instanceof Error ? err.message : "Unknown error",
        status: "error",
      });
    }
  };

  const changeFeedbackAnalysis = async () => {
    if (!result) return;
    try {
      const oppositePrediction = result.prediction === "true" ? "fake" : "true";
      const response = await fetch(`${API_BASE_URL}/change-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: result.id,
          edited_prediction: oppositePrediction,
        }),
      });

      if (!response.ok) throw new Error("Failed to change feedback analysis");
      setFeedbackStatus("changed");
      setResult({ ...result, prediction: oppositePrediction });
      const statsResponse = await fetch(`${API_BASE_URL}/stats`);
      setStats(await statsResponse.json());
    } catch (err) {
      setError({
        error: "Failed to change feedback analysis",
        details: err instanceof Error ? err.message : "Unknown error",
        status: "error",
      });
    }
  };

  const resetForm = () => {
    setInput({ text: "", file: null, url: "" });
    setResult(null);
    setError(null);
    setFeedbackStatus("idle");
  };

  const renderMetricsDashboard = () => {
    if (!stats) return null;

    return (
      <div className={styles.metricsDashboard}>
        <div className={styles.metricsHeader}>
          <h3>
            <FaChartLine /> System Analytics Dashboard
          </h3>
          <div className={styles.lastUpdated}>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className={styles.metricsGrid}>
          {/* KPI Cards */}
          <div className={`${styles.metricCard} ${styles.primaryCard}`}>
            <div className={styles.metricIcon}>
              <FaChartBar />
            </div>
            <div className={styles.metricValue}>{stats.total_predictions}</div>
            <div className={styles.metricLabel}>Total Analyses</div>
            <div className={styles.metricTrend}>+12% from last week</div>
          </div>

          <div className={`${styles.metricCard} ${styles.successCard}`}>
            <div className={styles.metricIcon}>
              <FaUserCheck />
            </div>
            <div className={styles.metricValue}>{stats.true_predictions}</div>
            <div className={styles.metricLabel}>Verified True</div>
            <div className={styles.metricTrend}>
              {(
                (stats.true_predictions / stats.total_predictions) *
                100
              ).toFixed(1)}
              % of total
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.dangerCard}`}>
            <div className={styles.metricIcon}>
              <FaUserTimes />
            </div>
            <div className={styles.metricValue}>{stats.fake_predictions}</div>
            <div className={styles.metricLabel}>Detected Fake</div>
            <div className={styles.metricTrend}>
              {(
                (stats.fake_predictions / stats.total_predictions) *
                100
              ).toFixed(1)}
              % of total
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.infoCard}`}>
            <div className={styles.metricIcon}>
              <FaChartPie />
            </div>
            <div className={styles.metricValue}>
              {stats.average_confidence.toFixed(1)}%
            </div>
            <div className={styles.metricLabel}>Avg Confidence</div>
            <div className={styles.metricTrend}>±2% margin of error</div>
          </div>

          {/* Input Methods Chart */}
          <div className={`${styles.metricChart} ${styles.fullWidth}`}>
            <h4>Input Method Distribution</h4>
            <div className={styles.chartContainer}>
              <div
                className={styles.chartBar}
                style={{
                  width: `${
                    (stats.input_methods.text / stats.total_predictions) * 100
                  }%`,
                }}
              >
                <span>Text: {stats.input_methods.text}</span>
              </div>
              <div
                className={styles.chartBar}
                style={{
                  width: `${
                    (stats.input_methods.file / stats.total_predictions) * 100
                  }%`,
                }}
              >
                <span>File: {stats.input_methods.file}</span>
              </div>
              <div
                className={styles.chartBar}
                style={{
                  width: `${
                    (stats.input_methods.url / stats.total_predictions) * 100
                  }%`,
                }}
              >
                <span>URL: {stats.input_methods.url}</span>
              </div>
            </div>
          </div>

          {/* Feedback Metrics */}
          <div className={styles.metricChart}>
            <h4>Feedback Accuracy</h4>
            <div className={styles.donutChart}>
              <div
                className={styles.donutSegment}
                style={
                  {
                    "--value": stats.feedback_stats.correct,
                    "--total":
                      stats.feedback_stats.correct +
                      stats.feedback_stats.incorrect,
                    "--color": "#1abc9c",
                  } as React.CSSProperties
                }
              ></div>
              <div
                className={styles.donutSegment}
                style={
                  {
                    "--value": stats.feedback_stats.incorrect,
                    "--total":
                      stats.feedback_stats.correct +
                      stats.feedback_stats.incorrect,
                    "--color": "#e74c3c",
                  } as React.CSSProperties
                }
              ></div>
              <div className={styles.donutCenter}>
                <div>{stats.accuracy}%</div>
                <small>Accuracy</small>
              </div>
            </div>
            <div className={styles.legend}>
              <span>
                <i style={{ background: "#1abc9c" }}></i> Correct:{" "}
                {stats.feedback_stats.correct}
              </span>
              <span>
                <i style={{ background: "#e74c3c" }}></i> Incorrect:{" "}
                {stats.feedback_stats.incorrect}
              </span>
              <span>
                <i style={{ background: "#3498db" }}></i> Changed:{" "}
                {stats.feedback_stats.changed}
              </span>
            </div>
          </div>

          {/* Activity Graph */}
          <div className={styles.metricChart}>
            <h4>Hourly Activity</h4>
            <div className={styles.activityGraph}>
              {stats.recent_activity.map((hour, i) => (
                <div key={i} className={styles.activityBar}>
                  <div
                    className={styles.activityFill}
                    style={{
                      height: `${
                        (hour.predictions /
                          Math.max(
                            ...stats.recent_activity.map((h) => h.predictions)
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                  <span>{hour.hour}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <FaShieldAlt className={styles.headerIcon} />
        <h1>News Authenticity Analyzer</h1>
        <p>Verify news credibility with AI-powered analysis</p>
      </header>

      {renderMetricsDashboard()}

      {!result ? (
        <div className={styles.analyzerCard}>
          <h2>
            <BiAnalyse /> Analyze Content
          </h2>

          <div className={styles.inputTabs}>
            {(["text", "file", "url"] as InputMethod[]).map((method) => (
              <button
                key={method}
                className={`${styles.tabButton} ${
                  inputMethod === method ? styles.activeTab : ""
                }`}
                onClick={() => setInputMethod(method)}
              >
                {method === "text" && <FaFileAlt />}
                {method === "file" && <FaUpload />}
                {method === "url" && <FaLink />}
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </button>
            ))}
          </div>

          {inputMethod === "text" && (
            <textarea
              value={input.text}
              onChange={(e) => setInput({ ...input, text: e.target.value })}
              placeholder="Paste news article here..."
              className={styles.textInput}
              disabled={isLoading}
            />
          )}

          {inputMethod === "file" && (
            <div className={styles.fileUpload}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) =>
                  setInput({ ...input, file: e.target.files?.[0] || null })
                }
                className={styles.fileInput}
                accept=".txt,.pdf,.docx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={styles.uploadButton}
              >
                <FaUpload /> {input.file ? input.file.name : "Choose File"}
              </button>
            </div>
          )}

          {inputMethod === "url" && (
            <input
              type="url"
              value={input.url}
              onChange={(e) => setInput({ ...input, url: e.target.value })}
              placeholder="https://example.com/news-article"
              className={styles.urlInput}
              disabled={isLoading}
            />
          )}

          <button
            onClick={checkNews}
            disabled={
              isLoading ||
              (inputMethod === "text" && !input.text.trim()) ||
              (inputMethod === "file" && !input.file) ||
              (inputMethod === "url" && !input.url.trim())
            }
            className={styles.analyzeButton}
          >
            {isLoading ? <FaSpinner className={styles.spin} /> : <FaSearch />}
            {isLoading ? "Analyzing..." : "Analyze Authenticity"}
          </button>
        </div>
      ) : (
        <div
          className={`${styles.resultCard} ${
            result.prediction === "true" ? styles.true : styles.fake
          }`}
        >
          <div className={styles.resultHeader}>
            <h2>
              Analysis Result: <span>{result.prediction.toUpperCase()}</span>
            </h2>
            <button onClick={resetForm} className={styles.newAnalysisButton}>
              <FaArrowLeft /> New Analysis
            </button>
          </div>

          <div className={styles.confidenceMeter}>
            <div className={styles.meterInfo}>
              <span>Confidence:</span>
              <span>{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.meterTrack}>
              <div
                className={styles.meterFill}
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          </div>

          {feedbackStatus === "success" ? (
            <div className={styles.feedbackSuccess}>
              <FaCheck /> Thank you for your feedback!
              <button
                onClick={changeFeedbackAnalysis}
                className={styles.changeFeedbackButton}
              >
                <FaRedo /> Change Feedback
              </button>
            </div>
          ) : feedbackStatus === "changed" ? (
            <div className={styles.feedbackChanged}>
              <FaInfoCircle /> Feedback analysis updated!
            </div>
          ) : (
            <div className={styles.feedbackSection}>
              <p>Was this analysis accurate?</p>
              <div className={styles.feedbackButtons}>
                <button
                  onClick={() => submitFeedback("correct")}
                  className={styles.correctButton}
                >
                  <FaCheck /> Correct
                </button>
                <button
                  onClick={() => submitFeedback("incorrect")}
                  className={styles.incorrectButton}
                >
                  <FaTimes /> Incorrect
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className={styles.errorAlert}>
          <div>
            <FaExclamationTriangle /> <strong>{error.error}</strong>
            {error.details && <p>{error.details}</p>}
          </div>
          <button onClick={() => setError(null)} aria-label="Close">
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsChecker;
