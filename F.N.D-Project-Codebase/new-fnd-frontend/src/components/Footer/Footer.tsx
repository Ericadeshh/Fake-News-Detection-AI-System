import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaLink,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaNewspaper,
  FaChartLine,
  FaUserShield,
} from "react-icons/fa";
import { GiArtificialIntelligence } from "react-icons/gi";
import styles from "./Footer.module.css";

const Footer = () => {
  const socialLinks = [
    { icon: <FaTwitter />, name: "Twitter" },
    { icon: <FaLinkedin />, name: "LinkedIn" },
    { icon: <FaGithub />, name: "GitHub" },
  ];

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -80; // Match header height offset from Introduction
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <motion.footer
      className={styles.footer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.footerContent}>
        {/* Branding Section */}
        <motion.div
          className={styles.footerSection}
          whileHover={{ scale: 1.02 }}
        >
          <div className={styles.branding}>
            <motion.div
              animate={{ rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 8 }}
            >
              <FaShieldAlt className={styles.logoIcon} />
            </motion.div>
            <h3 className={styles.brandName}>
              F.N.D AI System
              <motion.span
                className={styles.betaBadge}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                BETA
              </motion.span>
            </h3>
          </div>
          <p className={styles.tagline}>
            Combating misinformation through advanced AI detection
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className={styles.footerSection}
          whileHover={{ scale: 1.02 }}
        >
          <h4 className={styles.sectionTitle}>Quick Access</h4>
          <ul className={styles.linkList}>
            <li>
              <motion.button
                onClick={() => scrollToSection("content-auth")}
                className={styles.linkButton}
                whileHover={{ color: "#1abc9c" }}
              >
                <FaLink className={styles.linkIcon} />
                Content Verification
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={() => scrollToSection("performance-metrics")}
                className={styles.linkButton}
                whileHover={{ color: "#1abc9c" }}
              >
                <FaUserShield className={styles.linkIcon} />
                System Analytics
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={() => scrollToSection("home")}
                className={styles.linkButton}
                whileHover={{ color: "#1abc9c" }}
              >
                <GiArtificialIntelligence className={styles.linkIcon} />
                Introduction
              </motion.button>
            </li>
          </ul>
        </motion.div>

        {/* Resources */}
        <motion.div
          className={styles.footerSection}
          whileHover={{ scale: 1.02 }}
        >
          <h4 className={styles.sectionTitle}>Resources</h4>
          <ul className={styles.linkList}>
            <li>
              <motion.button
                onClick={() => scrollToSection("performance-metrics")}
                className={styles.linkButton}
                whileHover={{ color: "#1abc9c" }}
              >
                <FaChartLine className={styles.linkIcon} />
                Performance Metrics
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={() => scrollToSection("content-auth")}
                className={styles.linkButton}
                whileHover={{ color: "#1abc9c" }}
              >
                <FaNewspaper className={styles.linkIcon} />
                Verification Process
              </motion.button>
            </li>
          </ul>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className={styles.footerSection}
          whileHover={{ scale: 1.02 }}
        >
          <h4 className={styles.sectionTitle}>Connect</h4>
          <div className={styles.socialLinks}>
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href="#"
                className={styles.socialIcon}
                whileHover={{ scale: 1.2, color: "#1abc9c" }}
                whileTap={{ scale: 0.9 }}
              >
                {link.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Copyright */}
      <motion.div
        className={styles.copyright}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>
          © {new Date().getFullYear()} FND AI System.
          <br />
          Committed to digital truth verification
        </p>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
