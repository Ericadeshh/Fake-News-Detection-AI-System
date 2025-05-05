import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import Introduction from "../../components/Introduction/Introduction";
import ContentAuthentication from "../../components/ContentAuthentication/ContentAuthentication";
import PerformanceMetrics from "../../components/PerformanceMetrics/PerformanceMetrics";
import AnalysisResult from "../../components/AnalysisResults/AnalysisResults";
import Message from "../../components/Message/Message";
import ScrollToTopButton from "../../components/ScrollToTop/ScrollToTop";
import styles from "./FND-Home.module.css";

type PredictionResult = {
  prediction: "fake" | "true";
  confidence: number;
  id: number;
  input_type: "text" | "file" | "url";
};

type SystemStats = {
  total_predictions: number;
  true_predictions: number;
  fake_predictions: number;
  average_confidence: number;
  accuracy: number;
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

const API_BASE_URL = "http://localhost:5000";

const FNDHome = () => {
  const [input, setInput] = useState({
    text: "",
    file: null as File | null,
    url: "",
  });
  const [inputMethod, setInputMethod] = useState<"text" | "file" | "url">(
    "text"
  );
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    error: string;
    details?: string;
  } | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "success" | "error" | "changed"
  >("idle");
  const [stats, setStats] = useState<SystemStats | null>(null);
  const fileInputRef: React.RefObject<HTMLInputElement | null> = useRef(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      const enhancedData: SystemStats = {
        ...data,
        accuracy:
          Math.round(
            (data.feedback_stats.correct /
              (data.feedback_stats.correct + data.feedback_stats.incorrect)) *
              100
          ) || 0,
        recent_activity: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          predictions: Math.floor(Math.random() * 20),
        })),
        input_methods: {
          text: Math.floor(data.total_predictions * 0.6),
          file: Math.floor(data.total_predictions * 0.25),
          url: Math.floor(data.total_predictions * 0.15),
        },
      };
      setStats(enhancedData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [result]);

  useEffect(() => {
    fetchStats();
  }, [result]);

  const checkNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let content = "";
      if (inputMethod === "text") {
        content = input.text;
      } else if (inputMethod === "file" && input.file) {
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
      });
    } catch (err) {
      setError({
        error: "Failed to process prediction",
        details: err instanceof Error ? err.message : "Unknown error",
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
      await fetchStats();
    } catch (err) {
      setFeedbackStatus("error");
      setError({
        error: "Failed to submit feedback",
        details: err instanceof Error ? err.message : "Unknown error",
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
      await fetchStats();
    } catch (err) {
      setError({
        error: "Failed to change feedback analysis",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const resetForm = () => {
    setInput({ text: "", file: null, url: "" });
    setResult(null);
    setError(null);
    setFeedbackStatus("idle");
  };

  return (
    <div className={styles.container}>
      <Introduction />

      <div id="performance-metrics">
        <PerformanceMetrics stats={stats} />
      </div>

      <Message
        message={
          error?.details
            ? `${error.error}: ${error.details}`
            : error?.error ?? null
        }
        type="error"
      />

      <div id="content-auth">
        <AnimatePresence mode="wait">
          {!result ? (
            <ContentAuthentication
              inputMethod={inputMethod}
              setInputMethod={setInputMethod}
              input={input}
              setInput={setInput}
              checkNews={checkNews}
              isLoading={isLoading}
              fileInputRef={fileInputRef}
            />
          ) : (
            <AnalysisResult
              result={result}
              resetForm={resetForm}
              submitFeedback={submitFeedback}
              feedbackStatus={feedbackStatus}
              changeFeedbackAnalysis={changeFeedbackAnalysis}
              error={error}
              setError={setError}
            />
          )}
        </AnimatePresence>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default FNDHome;
