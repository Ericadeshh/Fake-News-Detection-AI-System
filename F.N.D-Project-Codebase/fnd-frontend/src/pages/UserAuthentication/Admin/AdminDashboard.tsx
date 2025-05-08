import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import styles from "./AdminDashboard.module.css";

interface Stat {
  total_predictions: number;
  true_predictions: number;
  fake_predictions: number;
  average_confidence: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stat | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get<Stat>("http://localhost:5000/stats");
        setStats(response.data);
      } catch {
        setError("Failed to fetch stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.heading}>Admin Dashboard</h2>
      {error && <p className={`alert alert-danger ${styles.error}`}>{error}</p>}
      {stats ? (
        <div className={styles.statsContainer}>
          <div className={`card ${styles.statCard}`}>
            <h3>Total Predictions</h3>
            <p>{stats.total_predictions}</p>
          </div>
          <div className={`card ${styles.statCard}`}>
            <h3>True Predictions</h3>
            <p>{stats.true_predictions}</p>
          </div>
          <div className={`card ${styles.statCard}`}>
            <h3>Fake Predictions</h3>
            <p>{stats.fake_predictions}</p>
          </div>
          <div className={`card ${styles.statCard}`}>
            <h3>Average Confidence</h3>
            <p>{(stats.average_confidence * 100).toFixed(2)}%</p>
          </div>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
