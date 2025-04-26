import { useState, useEffect } from "react";
import styles from "./About.module.css";
import { FaReact, FaSearch, FaBrain, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const About = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const features = [
    {
      icon: <FaSearch />,
      title: "Content Analysis",
      description: "Advanced NLP techniques to examine article content",
    },
    {
      icon: <FaBrain />,
      title: "AI Detection",
      description: "Deep learning models trained on verified datasets",
    },
    {
      icon: <FaShieldAlt />,
      title: "Reliable Results",
      description: "Continuous learning system improves accuracy daily",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isMounted ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className={` ${styles.aboutSection}`}
    >
      <h2 className={`text-center mb-5 ${styles.heading}`}>
        <FaReact className={styles.titleIcon} />
        About Our AI Verification System
      </h2>

      <div className={styles.overview}>
        <h3 className={styles.sectionTitle}>Overview</h3>
        <p className={styles.sectionText}>
          Our Fake News Detection System leverages cutting-edge artificial
          intelligence to analyze news content and assess its credibility.
          Combining natural language processing with deep learning algorithms,
          the system provides real-time authenticity verification for digital
          content.
        </p>
      </div>

      <div className={styles.howItWorks}>
        <h3 className={styles.sectionTitle}>How It Works</h3>
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-4 col-12">
              <motion.div
                whileHover={{ y: -10 }}
                className={styles.featureCard}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h4 className={styles.featureTitle}>{feature.title}</h4>
                <p className={styles.featureText}>{feature.description}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className={styles.credits}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className={styles.sectionTitle}>Credits</h3>
        <p className={styles.creditText}>
          Developed as final year project at Karatina University
          <br />
          Supervised by: [Supervisor Name]
          <br />
          NLP Models: Transformers Library
          <br />
          Icons: React Icons
        </p>
      </motion.div>
    </motion.div>
  );
};

export default About;
