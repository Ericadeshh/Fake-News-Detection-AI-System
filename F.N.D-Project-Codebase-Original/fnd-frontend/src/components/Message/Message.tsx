import { AnimatePresence, motion } from "framer-motion";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import styles from "./Message.module.css";

interface MessageProps {
  message: string | null;
  type: "error" | "info" | "success";
}

const Message = ({ message, type }: MessageProps) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`${styles.message} ${styles[type]}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {type === "error" && <FaExclamationTriangle />}
          {type === "info" && <FaInfoCircle />}
          {type === "success" && <FaCheckCircle />}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Message;
