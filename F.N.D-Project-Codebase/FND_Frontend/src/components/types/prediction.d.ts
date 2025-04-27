export type PredictionResult = {
  prediction: "fake" | "true";
  confidence: number;
  id: number;
  text?: string;
};

export type FeedbackData = {
  id: number;
  feedback: "correct" | "incorrect";
};

export type InputMethod = "text" | "file" | "url";

export type PredictionResult = {
  prediction: "fake" | "true";
  confidence: number;
  id: number;
  input_type: InputMethod;
};

export type SystemStats = {
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

export type FeedbackStatus = "idle" | "success" | "error" | "changed";
