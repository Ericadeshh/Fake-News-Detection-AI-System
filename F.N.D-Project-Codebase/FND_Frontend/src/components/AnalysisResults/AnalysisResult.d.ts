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
    error: {
        error: string;
        details?: string;
    } | null;
    setError: (error: null) => void;
}
declare const AnalysisResult: ({ result, resetForm, submitFeedback, feedbackStatus, changeFeedbackAnalysis, error, setError, }: AnalysisResultProps) => import("react").JSX.Element | null;
export default AnalysisResult;
