import { motion, AnimatePresence } from "framer-motion";
import { FaFileAlt, FaUpload, FaLink, FaSearch, FaSpinner, FaInfoCircle, FaShieldAlt, } from "react-icons/fa";
import styles from "./ContentAuthentication.module.css";
const ContentAuthentication = ({ inputMethod, setInputMethod, input, setInput, checkNews, isLoading, fileInputRef, }) => {
    return (<motion.div className={styles.analyzerCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className={styles.sectionHeader}>
        <FaShieldAlt className={styles.greenIcon}/>
        <h3>Content Verification Portal</h3>
        <div className={styles.infoBox}>
          <FaInfoCircle className={styles.brownIcon}/>
          <p>
            Submit content through multiple channels for instant verification
          </p>
        </div>
      </div>

      <div className={styles.inputTabs}>
        {["text", "file", "url"].map((method) => (<motion.button key={method} className={`${styles.tabButton} ${inputMethod === method ? styles.activeTab : ""}`} onClick={() => setInputMethod(method)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            {method === "text" && <FaFileAlt className={styles.greenIcon}/>}
            {method === "file" && <FaUpload className={styles.greenIcon}/>}
            {method === "url" && <FaLink className={styles.greenIcon}/>}
            {method.charAt(0).toUpperCase() + method.slice(1)}
          </motion.button>))}
      </div>

      <AnimatePresence mode="wait">
        {inputMethod === "text" && (<motion.textarea key="text" value={input.text} onChange={(e) => setInput((prev) => ({ ...prev, text: e.target.value }))} placeholder="Paste news content here..." className={styles.textInput} disabled={isLoading} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>)}

        {inputMethod === "file" && (<motion.div key="file" className={styles.fileUpload} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <input type="file" ref={fileInputRef} onChange={(e) => setInput((prev) => ({
                ...prev,
                file: e.target.files?.[0] || null,
            }))} className={styles.fileInput} accept=".txt,.pdf,.docx"/>
            <button onClick={() => fileInputRef.current?.click()} className={styles.uploadButton}>
              <FaUpload />
              {input.file ? input.file.name : "Select Document"}
            </button>
            <p className={styles.fileNote}>Supported formats: TXT, PDF, DOCX</p>
          </motion.div>)}

        {inputMethod === "url" && (<motion.input key="url" type="url" value={input.url} onChange={(e) => setInput((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://example.com/news-article" className={styles.urlInput} disabled={isLoading} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>)}
      </AnimatePresence>

      <motion.button onClick={checkNews} disabled={isLoading ||
            (inputMethod === "text" && !input.text.trim()) ||
            (inputMethod === "file" && !input.file) ||
            (inputMethod === "url" && !input.url.trim())} className={styles.analyzeButton} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        {isLoading ? (<FaSpinner className={styles.spin}/>) : (<FaSearch className={styles.greenIcon}/>)}
        {isLoading ? "Authenticating..." : "Verify Content"}
      </motion.button>
    </motion.div>);
};
export default ContentAuthentication;
