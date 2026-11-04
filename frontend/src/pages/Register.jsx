import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    emailId: "",
    age: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.username || !formData.emailId || !formData.age || !formData.password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/users`, {
        username: formData.username.trim(),
        emailId: formData.emailId.trim(),
        age: Number(formData.age),
        password: formData.password,
      });

      const registeredName = res.data?.user?.username || formData.username;
      setSuccessMessage(
        res.data?.message || `Welcome aboard, ${registeredName}! Registration successful.`
      );

      setTimeout(() => {
        navigate("/login");
      }, 1600);
    } catch (err) {
      const serverResponse = err.response?.data?.message || err.response?.data;
      if (typeof serverResponse === "string") {
        setErrorMessage(serverResponse);
      } else {
        setErrorMessage("Registration failed. Please verify your details or use a different email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer-screen">
      <div className="auth-brand-masthead">
        <Link to="/" className="auth-logo">
          Kaadugal<span className="brand-domain">.in</span>
        </Link>
      </div>

      <div className="auth-card-frame">
        <h1>Create Account</h1>

        {errorMessage && <div className="system-alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="system-alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="field-group">
            <label htmlFor="username">Your name</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="First and last name"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="emailId">Email ID</label>
            <input
              id="emailId"
              type="email"
              name="emailId"
              placeholder="name@example.com"
              value={formData.emailId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              name="age"
              min="1"
              max="120"
              placeholder="Your age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="input-hint">Passwords must be at least 6 characters.</span>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating your account..." : "Continue"}
          </button>
        </form>

        <div className="auth-disclaimer">
          By creating an account, you agree to Kaadugal.in's Conditions of Use and Privacy Notice.
        </div>

        <div className="auth-card-switch">
          Already have an account? <Link to="/login">Sign in ▾</Link>
        </div>
      </div>
    </div>
  );
}
