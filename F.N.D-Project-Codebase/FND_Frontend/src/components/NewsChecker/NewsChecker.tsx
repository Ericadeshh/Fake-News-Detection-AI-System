import { useState, useEffect, useRef } from "react";
import styles from "./NewsChecker.module.css";

type PredictionResult = {
  prediction: "fake" | "true";
  confidence: number;
  id: number;
  status: string;
  input_type: "text" | "file" | "url"; // Add this line
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
  };
};

type InputMethod = "text" | "file" | "url";

const API_BASE_URL = "http://localhost:5000";

const NewsChecker = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
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
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, [result]);

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
  };

  const fetchArticleFromUrl = async (url: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch-article`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch article from URL");
      }

      const data = await response.json();
      return data.content || "";
    } catch (err) {
      console.error("Failed to fetch via API:", err);
      throw new Error(
        "URL content could not be fetched. Please try another method."
      );
    }
  };

  const checkNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let content = "";
      let payload: unknown = {};
      let inputType: "text" | "file" | "url" = "text";

      if (inputMethod === "text") {
        content = text;
        inputType = "text";
        payload = { content, input_type: "text" };
      } else if (inputMethod === "file" && file) {
        content = await extractTextFromFile(file);
        inputType = "file";
        payload = { content, input_type: "file" };
      } else if (inputMethod === "url" && url) {
        content = await fetchArticleFromUrl(url);
        inputType = "url";
        payload = { content, input_type: "url" };
      }

      if (!content.trim()) {
        throw new Error("No content provided for analysis");
      }

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
        id: data.id,
        input_type: data.input_type || inputType,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const submitFeedback = async (feedback: "correct" | "incorrect") => {
    if (!result) return;

    setFeedbackStatus("idle");

    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: result.id,
          feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Feedback submission failed");
      }

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change feedback analysis");
      }

      setFeedbackStatus("changed");
      setResult({
        ...result,
        prediction: oppositePrediction,
      });

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
    setText("");
    setFile(null);
    setUrl("");
    setResult(null);
    setError(null);
    setFeedbackStatus("idle");
  };

  return (
    <div className={`container ${styles.newsChecker}`}>
      <h1 className={styles.heading}>
        <i className="bi bi-shield-exclamation me-2"></i>
        News Authenticity Analyzer
      </h1>

      {stats && (
        <div className={`${styles.statsPanel} mb-4`}>
          <h3>
            <i className="bi bi-graph-up me-2"></i>
            System Statistics
          </h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Analyses:</span>
              <span className={styles.statValue}>
                {stats.total_predictions}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>True News:</span>
              <span className={styles.statValue}>{stats.true_predictions}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Fake News:</span>
              <span className={styles.statValue}>{stats.fake_predictions}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Avg Confidence:</span>
              <span className={styles.statValue}>
                {(stats.average_confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {!result ? (
        <div className={styles.analysisSection}>
          <div className="mb-3">
            <div className="btn-group w-100 mb-3">
              <button
                className={`btn ${
                  inputMethod === "text" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setInputMethod("text")}
              >
                <i className="bi bi-text-paragraph me-2"></i>
                Paste Text
              </button>
              <button
                className={`btn ${
                  inputMethod === "file" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setInputMethod("file")}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Upload File
              </button>
              <button
                className={`btn ${
                  inputMethod === "url" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setInputMethod("url")}
              >
                <i className="bi bi-link-45deg me-2"></i>
                Enter URL
              </button>
            </div>

            {inputMethod === "text" && (
              <div className="mb-4">
                <label htmlFor="newsText" className="form-label">
                  Enter news content to analyze:
                </label>
                <textarea
                  id="newsText"
                  className={`form-control ${styles.textarea}`}
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste news article or snippet here..."
                  disabled={isLoading}
                />
              </div>
            )}

            {inputMethod === "file" && (
              <div className="mb-4">
                <label className="form-label">
                  Upload news article file (TXT only):
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt"
                  className="d-none"
                />
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary me-3"
                    onClick={triggerFileInput}
                  >
                    <i className="bi bi-upload me-2"></i>
                    Choose File
                  </button>
                  <span className="text-muted">
                    {file ? file.name : "No file selected"}
                  </span>
                </div>
              </div>
            )}

            {inputMethod === "url" && (
              <div className="mb-4">
                <label htmlFor="newsUrl" className="form-label">
                  Enter news article URL:
                </label>
                <input
                  id="newsUrl"
                  type="url"
                  className="form-control"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/news-article"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <button
            className={`btn btn-primary ${styles.analyzeButton}`}
            onClick={checkNews}
            disabled={
              isLoading ||
              (inputMethod === "text" && !text.trim()) ||
              (inputMethod === "file" && !file) ||
              (inputMethod === "url" && !url.trim())
            }
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Analyzing...
              </>
            ) : (
              <>
                <i className="bi bi-search me-2"></i>
                Analyze Authenticity
              </>
            )}
          </button>
        </div>
      ) : (
        <div
          className={`${styles.resultsContainer} ${
            result.prediction === "true" ? styles.trueResult : styles.fakeResult
          }`}
        >
          <div className={styles.resultsHeader}>
            <h2>
              Analysis Result:
              <span
                className={
                  result.prediction === "true" ? "text-success" : "text-danger"
                }
              >
                {result.prediction.toUpperCase()}
              </span>
            </h2>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={resetForm}
            >
              <i className="bi bi-arrow-repeat me-1"></i>
              New Analysis
            </button>
          </div>

          <div className={styles.confidenceMeter}>
            <div className={styles.meterLabel}>
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </div>
            <div
              className={styles.meterBar}
              style={{ width: `${result.confidence * 100}%` }}
            ></div>
          </div>

          {feedbackStatus === "success" ? (
            <div className={`alert alert-success ${styles.feedbackAlert}`}>
              <i className="bi bi-check-circle-fill me-2"></i>
              Thank you for your feedback!
              <button
                className={`btn btn-outline-warning mt-2 ${styles.changeFeedbackButton}`}
                onClick={changeFeedbackAnalysis}
              >
                <i className="bi bi-arrow-repeat me-1"></i>
                Change Feedback Analysis
              </button>
            </div>
          ) : feedbackStatus === "changed" ? (
            <div className={`alert alert-info ${styles.feedbackAlert}`}>
              <i className="bi bi-info-circle-fill me-2"></i>
              Feedback analysis has been updated!
            </div>
          ) : (
            <div className={styles.feedbackSection}>
              <p className={styles.feedbackPrompt}>
                Was this analysis accurate?
              </p>
              <div className={styles.feedbackButtons}>
                <button
                  className="btn btn-success"
                  onClick={() => submitFeedback("correct")}
                  disabled={feedbackStatus !== "idle"}
                >
                  <i className="bi bi-check-lg me-1"></i>
                  Correct
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => submitFeedback("incorrect")}
                  disabled={feedbackStatus !== "idle"}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Incorrect
                </button>
              </div>
              {feedbackStatus === "error" && (
                <div className="text-danger mt-2">
                  Failed to submit feedback
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className={`alert alert-danger ${styles.errorAlert}`}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>{error.error}</strong>
          {error.details && <div className="mt-2">{error.details}</div>}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
    </div>
  );
};

export default NewsChecker;
