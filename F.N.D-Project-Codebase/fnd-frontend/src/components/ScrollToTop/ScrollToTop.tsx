import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import styles from "./ScrollToTop.module.css";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <motion.div
      className={styles.scrollToTop}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.5,
        y: isVisible ? 0 : 100,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.1, backgroundColor: "#15a387" }}
      whileTap={{ scale: 0.9 }}
    >
      <FaArrowUp className={styles.scrollIcon} onClick={scrollToTop} />
    </motion.div>
  );
};

export default ScrollToTopButton;
