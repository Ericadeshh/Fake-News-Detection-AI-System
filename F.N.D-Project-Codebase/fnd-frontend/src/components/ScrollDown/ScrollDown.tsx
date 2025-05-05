import { motion } from "framer-motion";
import { FaArrowDown } from "react-icons/fa";
import styles from "./ScrollDown.module.css";

const ScrollDown = () => {
  const scrollToNextSection = () => {
    const header = document.getElementById("home");
    if (header) {
      const headerBottom =
        header.getBoundingClientRect().bottom + window.pageYOffset;
      const yOffset = -80; // Maintain consistent offset
      window.scrollTo({ top: headerBottom + yOffset, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      className={styles.scrollDown}
      initial={{ y: 0 }}
      animate={{ y: [0, 10, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      onClick={scrollToNextSection}
    >
      <FaArrowDown className={styles.icon} />
    </motion.div>
  );
};

export default ScrollDown;
