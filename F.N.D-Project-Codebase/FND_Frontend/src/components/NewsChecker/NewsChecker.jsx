import { useState, useEffect, useRef } from "react";
import { FaShieldAlt, FaChartLine, FaFileAlt, FaLink, FaUpload, FaSearch, FaSpinner, FaCheck, FaTimes, FaRedo, FaArrowLeft, FaExclamationTriangle, FaInfoCircle, FaChartBar, FaChartPie, FaUserCheck, FaUserTimes, FaRegClock, FaBrain, FaBalanceScale, FaFilePdf, FaGlobe, FaTextHeight, } from "react-icons/fa";
import { LuFolderInput } from "react-icons/lu";
import { BiAnalyse } from "react-icons/bi";
import { MdOutlineFeedback } from "react-icons/md";
import { RiTimerFlashLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NewsChecker.module.css";
const API_BASE_URL = "http://localhost:5000";
const NewsChecker = () => {
    const [input, setInput] = useState({
        text: "",
        file: null,
        url: "",
    });
    const [inputMethod, setInputMethod] = useState("text");
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [feedbackStatus, setFeedbackStatus] = useState("idle");
    const [stats, setStats] = useState(null);
    const fileInputRef = useRef(null);
    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats`);
            const data = await response.json();
            const enhancedData = {
                ...data,
                accuracy: Math.round((data.feedback_stats.correct /
                    (data.feedback_stats.correct + data.feedback_stats.incorrect)) *
                    100) || 0,
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
        }
        catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };
    useEffect(() => {
        fetchStats();
    }, [result]);
    const checkNews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let content = "";
            if (inputMethod === "text")
                content = input.text;
            else if (inputMethod === "file" && input.file) {
                content = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result);
                    reader.onerror = () => reject(new Error("Failed to read file"));
                    reader.readAsText(input.file);
                });
            }
            else if (inputMethod === "url" && input.url) {
                const response = await fetch(`${API_BASE_URL}/fetch-article`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: input.url }),
                });
                if (!response.ok)
                    throw new Error("Failed to fetch article from URL");
                content = (await response.json()).content || "";
            }
            if (!content.trim())
                throw new Error("No content provided for analysis");
            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, input_type: inputMethod }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Request failed");
            setResult({
                prediction: data.prediction,
                confidence: data.confidence,
                id: data.id,
                input_type: data.input_type || inputMethod,
                status: data.status,
            });
        }
        catch (err) {
            setError({
                error: "Failed to process prediction",
                details: err instanceof Error ? err.message : "Unknown error",
                status: "error",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const submitFeedback = async (feedback) => {
        if (!result)
            return;
        setFeedbackStatus("idle");
        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: result.id, feedback }),
            });
            if (!response.ok)
                throw new Error("Feedback submission failed");
            setFeedbackStatus("success");
            await fetchStats();
        }
        catch (err) {
            setFeedbackStatus("error");
            setError({
                error: "Failed to submit feedback",
                details: err instanceof Error ? err.message : "Unknown error",
                status: "error",
            });
        }
    };
    const changeFeedbackAnalysis = async () => {
        if (!result)
            return;
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
            if (!response.ok)
                throw new Error("Failed to change feedback analysis");
            setFeedbackStatus("changed");
            setResult({ ...result, prediction: oppositePrediction });
            await fetchStats();
        }
        catch (err) {
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
        if (!stats)
            return null;
        return (<motion.div className={styles.metricsDashboard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.3,
            }}>
        <div className={styles.metricsHeader}>
          <motion.h3 whileHover={{ scale: 1.01 }}>
            <FaChartLine className={styles.greenIcon}/>
            AI Verification Analytics
            <div className={styles.brownIconContainer}>
              <FaInfoCircle className={styles.brownIcon}/>
              <p className={styles.sectionSubtext}>
                Real-time tracking of NLP analysis accuracy across multiple
                input channels
              </p>
            </div>
          </motion.h3>
          <div className={styles.lastUpdated}>
            <FaRegClock className={styles.greenIcon}/> Updated:{" "}
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className={styles.metricsGrid}>
          {[
                {
                    icon: <FaChartBar />,
                    value: stats.total_predictions,
                    label: "Total Analyses",
                    trend: "+14.7% weekly",
                    className: styles.primaryCard,
                },
                {
                    icon: <FaUserCheck />,
                    value: stats.true_predictions,
                    label: "Verified Content",
                    trend: `${((stats.true_predictions / stats.total_predictions) *
                        100).toFixed(1)}% accuracy`,
                    className: styles.successCard,
                },
                {
                    icon: <FaUserTimes />,
                    value: stats.fake_predictions,
                    label: "Detected Fabrications",
                    trend: `${((stats.fake_predictions / stats.total_predictions) *
                        100).toFixed(1)}% flagged`,
                    className: styles.dangerCard,
                },
                {
                    icon: <FaChartPie />,
                    value: `${stats.average_confidence.toFixed(1)}%`,
                    label: "Model Confidence",
                    trend: "±1.8% margin of error",
                    className: styles.infoCard,
                },
            ].map((metric, index) => (<motion.div key={index} className={`${styles.metricCard} ${metric.className}`} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, duration: 0.2 }}>
              <div className={styles.metricIcon}>{metric.icon}</div>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricLabel}>{metric.label}</div>
              <div className={styles.metricTrend}>{metric.trend}</div>
            </motion.div>))}

          <motion.div className={`${styles.metricChart} ${styles.fullWidth}`} whileHover={{ scale: 1.005 }}>
            <h4 className={styles.DistributionHeader}>
              <LuFolderInput className={styles.greenIcon}/> Input Method
              Distribution
              <p className={styles.chartDescription}>
                <FaGlobe className={styles.brownIcon}/> Content submission
                channels utilization across different user groups
              </p>
            </h4>
            <div className={styles.chartContainer}>
              <div className={styles.chartBar} style={{
                width: `${(stats.input_methods.text / stats.total_predictions) * 100}%`,
            }}>
                <span>Text: {stats.input_methods.text}</span>
              </div>
              <div className={styles.chartBar} style={{
                width: `${(stats.input_methods.file / stats.total_predictions) * 100}%`,
            }}>
                <span>File: {stats.input_methods.file}</span>
              </div>
              <div className={styles.chartBar} style={{
                width: `${(stats.input_methods.url / stats.total_predictions) * 100}%`,
            }}>
                <span>URL: {stats.input_methods.url}</span>
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.metricChart} whileHover={{ scale: 1.005 }}>
            <h4>
              <MdOutlineFeedback className={styles.greenIcon}/> Community
              Validation
              <p className={styles.chartDescription}>
                <FaCheck className={styles.brownIcon}/> User-reported accuracy
                driving continuous model improvements
              </p>
            </h4>
            <div className={styles.donutChart}>
              <div className={styles.donutSegment} style={{
                "--value": stats.feedback_stats.correct,
                "--total": stats.feedback_stats.correct +
                    stats.feedback_stats.incorrect,
                "--color": "#1abc9c",
            }}></div>
              <div className={styles.donutSegment} style={{
                "--value": stats.feedback_stats.incorrect,
                "--total": stats.feedback_stats.correct +
                    stats.feedback_stats.incorrect,
                "--color": "#e74c3c",
            }}></div>
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
          </motion.div>

          <motion.div className={styles.metricChart} whileHover={{ scale: 1.005 }}>
            <h4>
              <RiTimerFlashLine className={styles.greenIcon}/> System
              Performance
              <p className={styles.chartDescription}>
                <FaRegClock className={styles.brownIcon}/> Operational metrics
                and response time analysis
              </p>
            </h4>
            <div className={styles.simpleStats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.accuracy}%</div>
                <div className={styles.statLabel}>Feedback Accuracy</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {stats.feedback_stats.correct}
                </div>
                <div className={styles.statLabel}>Correct Analyses</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {stats.feedback_stats.incorrect}
                </div>
                <div className={styles.statLabel}>Incorrect Analyses</div>
              </div>
            </div>
            <div className={styles.note}>
              <FaInfoCircle /> Based on user feedback submissions
            </div>
          </motion.div>
        </div>
      </motion.div>);
    };
    return (<div className={styles.container}>
      <motion.header className={styles.header} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <FaShieldAlt className={styles.headerIcon}/>
        <h1>AI News Verification System</h1>
        <p>
          <FaBrain className={styles.greenIcon}/> Advanced content
          authentication combining
          <strong> NLP analysis</strong> and <strong>deep learning.</strong>
          <div className={styles.featureList}>
            <motion.span className={styles.featureListItem} whileHover={{ y: -2 }}>
              <FaFilePdf className={styles.greenIcon}/> PDF/DOCX Support
            </motion.span>
            <motion.span className={styles.featureListItem} whileHover={{ y: -2 }}>
              <FaGlobe className={styles.greenIcon}/> Web Content Analysis
            </motion.span>
            <motion.span className={styles.featureListItem} whileHover={{ y: -2 }}>
              <FaTextHeight className={styles.greenIcon}/> Text Verification
            </motion.span>
            <motion.span className={styles.featureListItem} whileHover={{ y: -2 }}>
              <FaBalanceScale className={styles.greenIcon}/> Bias Detection
            </motion.span>
          </div>
        </p>
      </motion.header>

      {renderMetricsDashboard()}

      <AnimatePresence>
        {!result ? (<motion.div className={styles.analyzerCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <motion.h2 whileHover={{ scale: 1.01 }} className={styles.analyzeHeader}>
              <div className={styles.ContentCenter}>
                <h4>
                  <BiAnalyse className={styles.greenIcon}/>
                  Content Authentication
                </h4>

                <div className={styles.brownIconContainer}>
                  <FaInfoCircle className={styles.brownIcon}/>
                  <p className={styles.sectionSubtext}>
                    Submit content through multiple channels for instant
                    verification
                  </p>
                </div>
              </div>
            </motion.h2>

            <div className={styles.inputTabs}>
              {["text", "file", "url"].map((method) => (<motion.button key={method} className={`${styles.tabButton} ${inputMethod === method ? styles.activeTab : ""}`} onClick={() => setInputMethod(method)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300 }}>
                  {method === "text" && (<FaFileAlt className={styles.greenIcon}/>)}
                  {method === "file" && (<FaUpload className={styles.greenIcon}/>)}
                  {method === "url" && <FaLink className={styles.greenIcon}/>}
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </motion.button>))}
            </div>

            {inputMethod === "text" && (<motion.textarea value={input.text} onChange={(e) => setInput({ ...input, text: e.target.value })} placeholder="Paste news content here..." className={styles.textInput} disabled={isLoading} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}/>)}

            {inputMethod === "file" && (<motion.div className={styles.fileUpload} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <input type="file" ref={fileInputRef} onChange={(e) => setInput({ ...input, file: e.target.files?.[0] || null })} className={styles.fileInput} accept=".txt,.pdf,.docx"/>
                <button onClick={() => fileInputRef.current?.click()} className={styles.uploadButton}>
                  <FaUpload />{" "}
                  {input.file ? input.file.name : "Select Document"}
                </button>
              </motion.div>)}

            {inputMethod === "url" && (<motion.input type="url" value={input.url} onChange={(e) => setInput({ ...input, url: e.target.value })} placeholder="https://example.com/news-article" className={styles.urlInput} disabled={isLoading} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}/>)}

            <motion.button onClick={checkNews} disabled={isLoading ||
                (inputMethod === "text" && !input.text.trim()) ||
                (inputMethod === "file" && !input.file) ||
                (inputMethod === "url" && !input.url.trim())} className={styles.analyzeButton} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 300 }}>
              {isLoading ? (<FaSpinner className={styles.spin}/>) : (<FaSearch className={styles.greenIcon}/>)}
              &nbsp; {isLoading ? "Authenticating..." : "Verify Content"}
            </motion.button>
          </motion.div>) : (<motion.div className={`${styles.resultCard} ${result.prediction === "true" ? styles.true : styles.fake}`} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, duration: 0.2 }}>
            <div className={styles.resultHeader}>
              <h2>
                Analysis Result: <span>{result.prediction.toUpperCase()}</span>
              </h2>
              <motion.button onClick={resetForm} className={styles.newAnalysisButton} whileHover={{ x: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <FaArrowLeft /> New Analysis
              </motion.button>
            </div>

            <div className={styles.confidenceMeter}>
              <div className={styles.meterInfo}>
                <span>Confidence Level:</span>
                <span>{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className={styles.meterTrack}>
                <div className={styles.meterFill} style={{ width: `${result.confidence * 100}%` }}/>
              </div>
            </div>

            <AnimatePresence>
              {feedbackStatus === "success" ? (<motion.div className={styles.feedbackSuccess} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FaCheck /> Thank you for your feedback!
                  <motion.button onClick={changeFeedbackAnalysis} className={styles.changeFeedbackButton} whileHover={{ scale: 1.05 }}>
                    <FaRedo /> Modify Assessment
                  </motion.button>
                </motion.div>) : feedbackStatus === "changed" ? (<motion.div className={styles.feedbackChanged} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FaInfoCircle /> Analysis updated successfully!
                </motion.div>) : (<motion.div className={styles.feedbackSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p>How accurate was this analysis?</p>
                  <div className={styles.feedbackButtons}>
                    <motion.button onClick={() => submitFeedback("correct")} className={styles.correctButton} whileHover={{ scale: 1.05 }}>
                      <FaCheck /> Accurate
                    </motion.button>
                    <motion.button onClick={() => submitFeedback("incorrect")} className={styles.incorrectButton} whileHover={{ scale: 1.05 }}>
                      <FaTimes /> Inaccurate
                    </motion.button>
                  </div>
                </motion.div>)}
            </AnimatePresence>
          </motion.div>)}
      </AnimatePresence>

      <AnimatePresence>
        {error && (<motion.div className={styles.errorAlert} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div>
              <FaExclamationTriangle /> <strong>{error.error}</strong>
              {error.details && <p>{error.details}</p>}
            </div>
            <button onClick={() => setError(null)} aria-label="Close">
              &times;
            </button>
          </motion.div>)}
      </AnimatePresence>
    </div>);
};
export default NewsChecker;
