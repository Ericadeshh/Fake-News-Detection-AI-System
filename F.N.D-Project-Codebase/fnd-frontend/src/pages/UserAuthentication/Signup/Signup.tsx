import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed");

      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    }
  };

  return (
    <div className={styles.signupContainer}>
      <form onSubmit={handleSubmit} className={styles.signupForm}>
        <h2>Create Account</h2>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <input
            id="fullName"
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />
          <label htmlFor="fullName">Full Name</label>
        </div>

        <div className={styles.formGroup}>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className={styles.formGroup}>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <label htmlFor="password">Password</label>
        </div>

        <div className={styles.formGroup}>
          <input
            id="phone"
            type="tel"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <label htmlFor="phone">Phone (optional)</label>
        </div>

        <button type="submit" className={styles.signupButton}>
          Sign Up
        </button>

        <div className={styles.loginLink}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
