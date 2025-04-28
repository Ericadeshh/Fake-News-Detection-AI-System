import { useState, useEffect } from "react";
import styles from "./About.module.css";
import {
  FaReact,
  FaSearch,
  FaBrain,
  FaShieldAlt,
  FaCode,
  FaDatabase,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { SiTensorflow, SiFlask } from "react-icons/si";
import { AiOutlineExpand } from "react-icons/ai";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import ScrollToTopButton from "../components/ScrollToTop/ScrollToTop";
import passportImg from "../assets/passport.jpg";

const About = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const features = [
    {
      icon: <FaSearch />,
      title: "Multi-Input Analysis",
      description: "Supports text, file upload (PDF/DOCX), and URL inputs",
      details:
        "The system processes various input types through Flask API endpoints. Text is analyzed directly, files are parsed using PyPDF2 and python-docx, and URLs are scraped using BeautifulSoup.",
    },
    {
      icon: <FaBrain />,
      title: "AI Detection Engine",
      description: "LSTM neural network with TF-IDF feature extraction",
      details:
        "Uses a custom LSTM model trained on 400k+ articles. Includes SMOTE for class balancing, advanced text cleaning, and feature engineering. Achieves 98.6% accuracy with continuous learning from user feedback.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Verification Pipeline",
      description: "Full-stack validation system with feedback loop",
      details:
        "Implements content validation, error handling, and user feedback integration. Stores analysis history in SQL database with confidence scores and user corrections.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isMounted ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className={styles.aboutSection}
    >
      <motion.h2 className={styles.heading} whileHover={{ scale: 1.02 }}>
        <FaReact className={styles.titleIcon} />
        AI-Powered News Verification System
      </motion.h2>

      <div className={styles.overview}>
        <h3 className={styles.sectionTitle}>System Overview</h3>
        <motion.p
          className={styles.sectionText}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          This comprehensive fake news detection system combines advanced NLP
          techniques with deep learning to analyze news content through multiple
          input methods (text, files, URLs). The backend, built with Flask and
          TensorFlow/Keras, processes requests through a pipeline including
          content fetching, text preprocessing, LSTM-based prediction, and
          feedback integration. The frontend provides real-time analytics,
          confidence scoring, and a user feedback system that continuously
          improves model accuracy.
        </motion.p>
      </div>

      <div className={styles.howItWorks}>
        <h3 className={styles.sectionTitle}>Technical Process</h3>
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-12">
              <motion.div
                className={styles.featureCard}
                whileHover={{ y: -5 }}
                layout
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h4 className={styles.featureTitle}>{feature.title}</h4>
                <p className={styles.featureText}>{feature.description}</p>

                <motion.div
                  className={styles.readMore}
                  onClick={() =>
                    setExpandedSection(expandedSection === index ? null : index)
                  }
                  whileHover={{ scale: 1.05 }}
                >
                  <AiOutlineExpand />{" "}
                  {expandedSection === index ? "Show Less" : "Read More"}
                </motion.div>

                <AnimatePresence>
                  {expandedSection === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.expandedContent}
                    >
                      <p>{feature.details}</p>
                      <div className={styles.techTags}>
                        {index === 0 && (
                          <>
                            <FaCode /> PyPDF2 • DOCX • BS4
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <SiTensorflow /> LSTM • SMOTE • TF-IDF
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <FaDatabase /> SQLAlchemy • Feedback API
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className={styles.credits}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.creditsContent}>
          <h3 className={styles.sectionTitle}>
            Intellectual Property & Credits
          </h3>

          <div className={styles.profileGrid}>
            <div className={styles.profileCard}>
              <div className={styles.profileImage}>
                <img src={passportImg} alt="Eric Lumumba's Passport" />
              </div>
              <div className={styles.profileOverlay}>
                <FaCode className={styles.overlayIcon} />
                <h4>Eric Lumumba</h4>
                <p>
                  Developer • Computer Science (AI Major)
                  <br />
                  email: lumumba.adegu@s.karu.ac.ke
                  <br />
                  KARATINA UNIVERSITY
                </p>
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileImage}>
                <FaCode />
              </div>

              <div className={styles.profileOverlay}>
                <LiaChalkboardTeacherSolid className={styles.overlayIcon} />
                <h4>Mr. Thomas Njoroge</h4>
                <p>
                  Research Supervisor
                  <br />
                  email:tnjoroge@karu.ac.ke
                  <br />
                  AI & Machine Learning Specialist
                </p>
              </div>
            </div>
          </div>

          <div className={styles.techStack}>
            <h5>Technical Components:</h5>
            <div className={styles.techIcons}>
              <SiTensorflow title="TensorFlow/Keras" />
              <SiFlask title="Flask" />
              <FaReact title="React" />
              <FaDatabase title="SQL Database" />
            </div>
          </div>

          <div className={styles.copyright}>
            © {new Date().getFullYear()} Fake News Detection System
            <br />
            All rights reserved • Patent Pending • Karatina University
          </div>
          <ScrollToTopButton />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default About;
