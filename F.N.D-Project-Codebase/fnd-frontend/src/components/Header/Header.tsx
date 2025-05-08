import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./header.module.css";
import { IoMenu } from "react-icons/io5";
import { RiRobot3Fill } from "react-icons/ri";
import { IoCloseSharp, IoChevronForward } from "react-icons/io5";
import { useAuth } from "../../pages/UserAuthentication/context/AuthContext";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const projectsRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const mobileMenuVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.15,
      },
    },
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 0.4,
        delay: 0.15,
      },
    },
  };

  // Icon animation variants
  const hamburgerIconVariants = {
    open: {
      rotate: 90,
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
    closed: {
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
  };

  const closeIconVariants = {
    hover: {
      rotate: 90,
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
      },
    },
    tap: {
      scale: 0.9,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
      },
    },
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        projectsRef.current &&
        !projectsRef.current.contains(event.target as Node)
      ) {
        // Handle click outside if needed
      }
    };

    if (isDesktop) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktop]);

  useEffect(() => {
    const checkScreenSize = () => {
      const zoom = Math.round((window.outerWidth / window.innerWidth) * 100);
      setIsDesktop(window.innerWidth > 1366 && zoom <= 100);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = "visible";
    } else {
      setIsMenuOpen(true);
      document.body.style.overflow = "hidden";
    }
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "visible";
  };

  const isActive = (path: string) => {
    return location.pathname === path ? styles.activeLink : "";
  };

  const renderNavLinks = () => (
    <motion.ul
      className={`${styles.navList} ${isMenuOpen ? styles.showList : ""}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {!isDesktop && (
        <motion.li
          className={styles.closeButtonContainer}
          variants={itemVariants}
        >
          <motion.button
            className={styles.closeButton}
            onClick={closeMobileMenu}
            whileHover="hover"
            whileTap="tap"
          >
            <motion.div
              variants={closeIconVariants}
              initial="closed"
              animate="visible"
            >
              <IoCloseSharp size={24} />
            </motion.div>
          </motion.button>
        </motion.li>
      )}

      {["/", "/About", "/History", "/Contact"].map((path) => (
        <motion.li key={path} variants={itemVariants}>
          <Link
            to={path}
            className={`${styles.link} ${isActive(path)}`}
            onClick={closeMobileMenu}
          >
            <motion.span
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {path === "/" ? "Home" : path.substring(1)}
            </motion.span>
            {!isDesktop && <IoChevronForward className={styles.linkIcon} />}
          </Link>
        </motion.li>
      ))}

      {isAuthenticated ? (
        <>
          <motion.li key="dashboard" variants={itemVariants}>
            <Link
              to={user?.is_admin ? "/admin-dashboard" : "/user-dashboard"}
              className={`${styles.link} ${isActive(
                user?.is_admin ? "/admin-dashboard" : "/user-dashboard"
              )}`}
              onClick={closeMobileMenu}
            >
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Dashboard
              </motion.span>
              {!isDesktop && <IoChevronForward className={styles.linkIcon} />}
            </Link>
          </motion.li>
          <motion.li key="logout" variants={itemVariants}>
            <button
              onClick={() => {
                logout();
                closeMobileMenu();
              }}
              className={`${styles.link} ${styles.logoutButton}`}
            >
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Logout
              </motion.span>
              {!isDesktop && <IoChevronForward className={styles.linkIcon} />}
            </button>
          </motion.li>
        </>
      ) : (
        <>
          <motion.li key="login" variants={itemVariants}>
            <Link
              to="/login"
              className={`${styles.link} ${isActive("/login")}`}
              onClick={closeMobileMenu}
            >
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Login
              </motion.span>
              {!isDesktop && <IoChevronForward className={styles.linkIcon} />}
            </Link>
          </motion.li>
          <motion.li key="signup" variants={itemVariants}>
            <Link
              to="/signup"
              className={`${styles.link} ${isActive("/signup")}`}
              onClick={closeMobileMenu}
            >
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Sign Up
              </motion.span>
              {!isDesktop && <IoChevronForward className={styles.linkIcon} />}
            </Link>
          </motion.li>
        </>
      )}
    </motion.ul>
  );

  return (
    <motion.header
      className={styles.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={styles.mainHeaderContainer}>
        <motion.div
          whileHover={{ rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <RiRobot3Fill className={styles.headerIcon} />
        </motion.div>
        {isDesktop ? (
          <nav className={styles.desktopNavigation}>{renderNavLinks()}</nav>
        ) : (
          <motion.button
            className={styles.menuButton}
            onClick={toggleMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={isMenuOpen ? "open" : "closed"}
              variants={hamburgerIconVariants}
            >
              <IoMenu size={44} />
            </motion.div>
          </motion.button>
        )}
      </div>

      {!isDesktop && (
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              className={styles.mobileMenu}
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
            >
              <motion.nav
                className={styles.navigation}
                variants={mobileMenuVariants}
              >
                {renderNavLinks()}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.header>
  );
};

export default Header;
