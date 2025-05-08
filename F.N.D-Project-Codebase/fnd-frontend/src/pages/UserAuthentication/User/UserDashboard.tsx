import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import styles from "./UserDashboard.module.css";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.heading}>Welcome, {user?.username}!</h2>
      <div className={`card ${styles.card}`}>
        <p>Use the navigation to verify news content or view your history.</p>
      </div>
    </motion.div>
  );
};

export default UserDashboard;
