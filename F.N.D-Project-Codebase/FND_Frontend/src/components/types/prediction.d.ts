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
