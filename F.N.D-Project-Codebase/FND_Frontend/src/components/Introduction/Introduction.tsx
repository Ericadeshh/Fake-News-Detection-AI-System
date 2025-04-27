import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBrain,
  FaFilePdf,
  FaGlobe,
  FaTextHeight,
  FaBalanceScale,
  FaArrowDown,
  FaUser,
} from "react-icons/fa";
import styles from "./Introduction.module.css";

const Introduction = () => {
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <FaFilePdf />,
      text: "PDF/DOCX Support",
      description: "Analyze documents in multiple formats with precision",
      target: "content-auth",
    },
    {
      icon: <FaGlobe />,
      text: "Web Analysis",
      description: "Verify news articles directly from any webpage URL",
      target: "content-auth",
    },
    {
      icon: <FaTextHeight />,
      text: "Text Verify",
      description: "Instant analysis of pasted text content",
      target: "content-auth",
    },
    {
      icon: <FaBalanceScale />,
      text: "Bias Detection",
      description: "Identify potential biases in news content",
      target: "performance-metrics",
    },
  ];

  // Scrolling function with header offset
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -80; // Adjust for fixed header height
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Keep all existing useEffect and animations
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
    <motion.header className={styles.header} id="home">
      <div className={styles.headerContent}>
        {/* Keep all existing motion animations */}
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
            <>
              <motion.div
                className={styles.featureList}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={styles.featureContainer}
                    onHoverStart={() => setHoveredFeature(index)}
                    onHoverEnd={() => setHoveredFeature(null)}
                  >
                    {/* Added scroll handler to existing button */}
                    <motion.button
                      className={styles.featureListItem}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                      }}
                      onClick={() => scrollToSection(feature.target)}
                    >
                      {feature.icon}
                      {feature.text}
                    </motion.button>

                    <AnimatePresence>
                      {hoveredFeature === index && (
                        <motion.div
                          className={styles.tooltip}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          {feature.description}
                          <div className={styles.tooltipArrow} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className={styles.buttonGroup}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {/* Added scroll handler to existing primary button */}
                <motion.button
                  className={styles.primaryButton}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection("content-auth")}
                >
                  <FaArrowDown /> Verify News
                </motion.button>

                {/* Preserved secondary button */}
                <motion.button
                  className={styles.secondaryButton}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaUser /> Login/Sign Up
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Introduction;
