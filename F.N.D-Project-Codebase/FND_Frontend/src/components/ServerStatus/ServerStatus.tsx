import { useEffect, useState } from "react";
import { FaCircle, FaPlug } from "react-icons/fa";
import styles from "./ServerStatus.module.css";

const ServerStatus = () => {
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/health");
        if (response.ok) {
          setServerOnline(true);
        } else {
          setServerOnline(false);
        }
      } catch {
        setServerOnline(false);
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`${styles.statusBanner} ${
        serverOnline ? styles.online : styles.offline
      }`}
    >
      <FaPlug className={styles.icon} />
      <span>Server Status: {serverOnline ? "Connected" : "Offline"}</span>
      <FaCircle
        className={`${styles.statusDot} ${
          serverOnline ? styles.onlineDot : styles.offlineDot
        }`}
      />
    </div>
  );
};

export default ServerStatus;
