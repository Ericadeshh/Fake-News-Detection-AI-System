import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBrain,
  FaFilePdf,
  FaGlobe,
  FaTextHeight,
  FaBalanceScale,
} from "react-icons/fa";
import styles from "./Introduction.module.css";

const Introduction = () => {
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");

  useEffect(() => {
    const title = "AI News Verification System";
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= title.length) {
        setTypedTitle(title.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setSubtitleVisible(true);
          setTimeout(() => setFeaturesVisible(true), 500);
        }, 300);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, []);

  return (
    <motion.header className={styles.header}>
      <div className={styles.headerContent}>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {typedTitle}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className={styles.cursor}
          >
            |
          </motion.span>
        </motion.h1>

        <AnimatePresence>
          {subtitleVisible && (
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className={styles.subtitle}
            >
              <FaBrain className={styles.greenIcon} /> Advanced content
              authentication combining
              <strong> NLP analysis</strong> and <strong>deep learning</strong>
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {featuresVisible && (
            <motion.div
              className={styles.featureList}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[
                { icon: <FaFilePdf />, text: "PDF/DOCX Support" },
                { icon: <FaGlobe />, text: "Web Content Analysis" },
                { icon: <FaTextHeight />, text: "Text Verification" },
                { icon: <FaBalanceScale />, text: "Bias Detection" },
              ].map((feature, index) => (
                <motion.span
                  key={index}
                  className={styles.featureListItem}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  {feature.icon}
                  {feature.text}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Introduction;
