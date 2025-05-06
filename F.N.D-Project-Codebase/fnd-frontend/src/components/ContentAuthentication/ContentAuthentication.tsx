import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileAlt,
  FaUpload,
  FaLink,
  FaSearch,
  FaSpinner,
  FaInfoCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { GiCheckMark } from "react-icons/gi";
import styles from "./ContentAuthentication.module.css";

type InputMethod = "text" | "file" | "url";

interface InputState {
  text: string;
  file: File | null;
  url: string;
}

interface ContentAuthenticationProps {
  inputMethod: InputMethod;
  setInputMethod: (method: InputMethod) => void;
  input: InputState;
  setInput: React.Dispatch<React.SetStateAction<InputState>>;
  checkNews: () => Promise<void>;
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ContentAuthentication = ({
  inputMethod,
  setInputMethod,
  input,
  setInput,
  checkNews,
  isLoading,
  fileInputRef,
}: ContentAuthenticationProps) => {
  const [isTextFocused, setIsTextFocused] = useState(false);
  const [isUrlFocused, setIsUrlFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await checkNews();
  };

  return (
    <motion.div
      className={styles.analyzerCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.main}>
        <div className={styles.sectionHeader}>
          <FaShieldAlt className={styles.greenAuthIcon} />
          <h3>Content Verification Portal</h3>
          <div className={styles.infoBox}>
            <p>
              <FaInfoCircle className={styles.brownIcon} />
              Submit content through multiple channels for instant verification
            </p>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <GiCheckMark className={styles.checkGreen} />
                Write/paste news articles for verification
              </li>
              <li className={styles.infoItem}>
                <GiCheckMark className={styles.checkCheese} />
                Upload documents (TXT, PDF, DOCX) for analysis
              </li>
              <li className={styles.infoItem}>
                <GiCheckMark className={styles.checkRed} />
                Provide URLs for online news articles
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.inputSection}>
          <div className={styles.inputTabs}>
            {(["text", "file", "url"] as InputMethod[]).map((method) => (
              <motion.button
                key={method}
                className={`${styles.tabButton} ${
                  inputMethod === method ? styles.activeTab : ""
                }`}
                onClick={() => setInputMethod(method)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {method === "text" && (
                  <FaFileAlt className={styles.checkGreen} />
                )}
                {method === "file" && (
                  <FaUpload className={styles.checkCheese} />
                )}
                {method === "url" && <FaLink className={styles.checkRed} />}
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={inputMethod}
              className={styles.inputForm}
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {inputMethod === "text" && (
                <motion.div
                  key="text"
                  className={styles.textInputContainer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className={styles.floatingLabel}
                    animate={{
                      y: isTextFocused || input.text ? -25 : 0,
                      scale: isTextFocused || input.text ? 0.8 : 1,
                      originX: 0,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Paste news content here...
                  </motion.div>
                  <motion.textarea
                    value={input.text}
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, text: e.target.value }))
                    }
                    className={styles.textInput}
                    disabled={isLoading}
                    onFocus={() => setIsTextFocused(true)}
                    onBlur={() => setIsTextFocused(false)}
                  />
                </motion.div>
              )}

              {inputMethod === "file" && (
                <motion.div
                  key="file"
                  className={styles.fileUpload}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        file: e.target.files?.[0] || null,
                      }))
                    }
                    className={styles.fileInput}
                    accept=".txt,.pdf,.docx"
                  />
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaUpload />
                    <AnimatePresence mode="wait">
                      {input.file ? (
                        <motion.span
                          key="file-name"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          {input.file.name}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="file-placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          Select Document
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <motion.p
                    className={styles.fileNote}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Supported formats: TXT, PDF, DOCX
                  </motion.p>
                </motion.div>
              )}

              {inputMethod === "url" && (
                <motion.div
                  key="url"
                  className={styles.urlInputContainer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className={styles.floatingLabel}
                    animate={{
                      y: isUrlFocused || input.url ? -25 : 0,
                      scale: isUrlFocused || input.url ? 0.8 : 1,
                      originX: 0,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    https://example.com/news-article
                  </motion.div>
                  <motion.input
                    type="url"
                    value={input.url}
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className={styles.urlInput}
                    disabled={isLoading}
                    onFocus={() => setIsUrlFocused(true)}
                    onBlur={() => setIsUrlFocused(false)}
                  />
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={
                  isLoading ||
                  (inputMethod === "text" && !input.text.trim()) ||
                  (inputMethod === "file" && !input.file) ||
                  (inputMethod === "url" && !input.url.trim())
                }
                className={styles.analyzeButton}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isLoading ? (
                  <FaSpinner className={styles.spin} />
                ) : (
                  <FaSearch className={styles.greenIcon} />
                )}
                {isLoading ? "Authenticating..." : "Verify Content"}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentAuthentication;
