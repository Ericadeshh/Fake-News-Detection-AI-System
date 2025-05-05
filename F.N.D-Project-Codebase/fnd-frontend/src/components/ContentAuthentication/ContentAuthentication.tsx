import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaFileAlt, FaLink, FaPaperPlane, FaTextHeight } from "react-icons/fa";
import { RiLoader5Fill } from "react-icons/ri";
import styles from "./ContentAuthentication.module.css";

interface ContentAuthenticationProps {
  inputMethod: "text" | "file" | "url";
  setInputMethod: React.Dispatch<React.SetStateAction<"text" | "file" | "url">>;
  input: {
    text: string;
    file: File | null;
    url: string;
  };
  setInput: React.Dispatch<
    React.SetStateAction<{
      text: string;
      file: File | null;
      url: string;
    }>
  >;
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
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== "text/plain") {
      setError("Please upload a plain text (.txt) file.");
      return;
    }
    setInput((prev) => ({ ...prev, file }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (inputMethod === "text" && !input.text.trim()) {
      setError("Please enter text to analyze.");
      return;
    }
    if (inputMethod === "file" && !input.file) {
      setError("Please upload a file to analyze.");
      return;
    }
    if (inputMethod === "url" && !input.url.trim()) {
      setError("Please enter a URL to analyze.");
      return;
    }
    if (
      inputMethod === "url" &&
      !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(input.url)
    ) {
      setError("Please enter a valid URL.");
      return;
    }

    try {
      await checkNews();
    } catch {
      setError("An error occurred while processing your request.");
    }
  };

  const inputOptions = [
    { value: "text", label: "Text", icon: <FaTextHeight /> },
    { value: "file", label: "File", icon: <FaFileAlt /> },
    { value: "url", label: "URL", icon: <FaLink /> },
  ];

  return (
    <motion.div
      className={styles.authContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.title}>Verify News Content</h2>
      <p className={styles.subtitle}>
        Submit text, a file, or a URL to check for authenticity using our
        AI-powered fake news detection system.
      </p>

      <div className={styles.inputMethodSelector}>
        {inputOptions.map((option) => (
          <motion.button
            key={option.value}
            className={`${styles.inputMethodButton} ${
              inputMethod === option.value ? styles.active : ""
            }`}
            onClick={() =>
              setInputMethod(option.value as "text" | "file" | "url")
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {option.icon}
            {option.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={inputMethod}
          className={styles.inputForm}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          {inputMethod === "text" && (
            <motion.div
              className={styles.inputWrapper}
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <textarea
                name="text"
                value={input.text}
                onChange={handleInputChange}
                placeholder="Paste your text here..."
                className={styles.textInput}
                disabled={isLoading}
              />
            </motion.div>
          )}

          {inputMethod === "file" && (
            <motion.div
              className={styles.inputWrapper}
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className={styles.fileInput}
                disabled={isLoading}
                ref={fileInputRef}
              />
            </motion.div>
          )}

          {inputMethod === "url" && (
            <motion.div
              className={styles.inputWrapper}
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="text"
                name="url"
                value={input.url}
                onChange={handleInputChange}
                placeholder="Enter URL (e.g., https://example.com)"
                className={styles.urlInput}
                disabled={isLoading}
              />
            </motion.div>
          )}

          {error && (
            <motion.p
              className={styles.errorMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <RiLoader5Fill className={styles.loaderIcon} />
            ) : (
              <FaPaperPlane />
            )}
            {isLoading ? "Analyzing..." : "Check News"}
          </motion.button>
        </motion.form>
      </AnimatePresence>
    </motion.div>
  );
};

export default ContentAuthentication;
