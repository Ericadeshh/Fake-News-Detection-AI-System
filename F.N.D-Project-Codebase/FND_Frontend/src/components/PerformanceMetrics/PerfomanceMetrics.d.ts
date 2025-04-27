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
declare const PerformanceMetrics: ({ stats }: PerformanceMetricsProps) => import("react").JSX.Element;
export default PerformanceMetrics;
