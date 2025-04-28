import { useState } from "react";
import { motion } from "framer-motion";
import ScrollToTopButton from "../components/ScrollToTop/ScrollToTop";
import styles from "./Contact.module.css";
import emailjs from "@emailjs/browser"; // Add this import
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUniversity,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaWhatsapp,
  FaInstagram,
  FaPaperPlane,
} from "react-icons/fa";

const Contact = () => {
  const [activeSocial, setActiveSocial] = useState<string | null>(null);
  const [socialUrl, setSocialUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactMethods = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Visit Us",
      content: (
        <>
          Karatina University Main Campus
          <br />
          School of Computer Science
          <br />
          P.O Box 1957-10101, Karatina
          <div className={styles.mapContainer}>
            <iframe
              title="Karatina University Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.227228318415!2d37.00346451475387!3d-0.49007049971373454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18288b548bed7abd%3A0x366d3df5826e47e9!2sKaratina%20University!5e0!3m2!1sen!2ske!4v1716724963274!5m2!1sen!2ske"
              className={styles.map}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </>
      ),
    },
    {
      icon: <FaPhone />,
      title: "Call Us",
      content: "+254 741 091 661\nMon - Fri: 8:00 AM - 5:00 PM EAT",
    },
    {
      icon: <FaEnvelope />,
      title: "Email Us",
      content: "ericadeshh@gmail.com\ntnjoroge@karu.ac.ke",
    },
  ];

  const socialProfiles = [
    {
      icon: <FaGithub />,
      name: "GitHub",
      url: "https://github.com/fnd-system",
    },
    {
      icon: <FaTwitter />,
      name: "Twitter",
      url: "https://twitter.com/fnd-system",
    },
    {
      icon: <FaLinkedin />,
      name: "LinkedIn",
      url: "https://linkedin.com/company/fnd-system",
    },
    {
      icon: <FaFacebook />,
      name: "Facebook",
      url: "https://facebook.com/fnd-system",
    },
    {
      icon: <FaWhatsapp />,
      name: "WhatsApp",
      url: "https://wa.me/254712345678",
    },
    {
      icon: <FaInstagram />,
      name: "Instagram",
      url: "https://instagram.com/fnd-system",
    },
  ];

  const handleSocialClick = (name: string, url: string) => {
    setActiveSocial(name);
    setSocialUrl(url);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    emailjs
      .send(
        "service_sea7k5i", // <-- You replace this
        "template_3vecyjl", // <-- You replace this
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        "3ZqWzboga-iKVNoCV" // <-- You replace this
      )
      .then(() => {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      })
      .catch(() => {
        alert("Failed to send message, please try again.");
      });
  };

  return (
    <motion.div
      className={styles.contactContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.contactLayout}>
        {/* Left Column */}
        <motion.div
          className={styles.contactInfo}
          initial={{ x: -20 }}
          animate={{ x: 0 }}
        >
          <motion.h2
            className={styles.sectionTitle}
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            <FaUniversity className={styles.titleIcon} />
            Connect With Us
          </motion.h2>

          <div className={styles.contactMethods}>
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                className={styles.contactItem}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.contactIcon}>{method.icon}</div>
                <div className={styles.contactContent}>
                  <h3 className={styles.contactTitle}>{method.title}</h3>
                  <p className={styles.contactText}>{method.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.form
          className={styles.contactForm}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} // Added onSubmit
        >
          <h2 className={styles.formTitle}>Send Us a Message</h2>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className={styles.formInput}
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className={styles.formInput}
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            className={styles.formInput}
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            className={styles.formTextarea}
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            required
          />
          <motion.button
            className={styles.submitButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
          >
            <FaPaperPlane /> Send Message
          </motion.button>

          <motion.div
            className={styles.socialSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={styles.socialTitle}>Social Profiles</h3>
            <div className={styles.socialTabsContainer}>
              {socialProfiles.map((social) => (
                <button
                  key={social.name}
                  className={`${styles.socialTab} ${
                    activeSocial === social.name ? styles.activeSocialTab : ""
                  }`}
                  onClick={() => handleSocialClick(social.name, social.url)}
                  type="button"
                >
                  <span className={styles.socialIcon}>{social.icon}</span>
                  {social.name}
                </button>
              ))}
            </div>

            {activeSocial && (
              <motion.div
                className={styles.socialUrlContainer}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <input
                  type="text"
                  value={socialUrl}
                  readOnly
                  className={styles.socialUrlInput}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </motion.div>
            )}
          </motion.div>
        </motion.form>
      </div>

      <motion.div
        className={styles.copyright}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        © {new Date().getFullYear()} Fake News Detection System
        <br />
        Karatina University Final Year Project - All rights reserved
        <ScrollToTopButton />
      </motion.div>
    </motion.div>
  );
};

export default Contact;
