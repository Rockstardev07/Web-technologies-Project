import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/login`, {
        emailId: formData.emailId.trim(),
        password: formData.password,
      });

      const token = res.data?.token || res.data?.accessToken || res.data?.jwt;
      if (token) {
        localStorage.setItem("token", token);
        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        navigate("/products");
      } else {
        setErrorMessage("Authentication token was not returned by the server.");
      }
    } catch (err) {
      const errorText = err.response?.data?.message || err.response?.data || "";
      if (typeof errorText === "string" && errorText.length > 0) {
        setErrorMessage(errorText);
      } else if (err.response?.status === 404) {
        setErrorMessage("User Not Registered");
      } else if (err.response?.status === 401) {
        setErrorMessage("Invalid Password");
      } else {
        setErrorMessage("Login failed. Please verify your credentials.");
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
        <h1>Sign In</h1>

        {errorMessage && <div className="system-alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form-body">
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
            <div className="label-dual-row">
              <label htmlFor="password">Password</label>
              <span className="forgot-pass-link">Forgot password?</span>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-disclaimer">
          By signing in, you agree to Kaadugal.in's Terms of Service and Privacy Policy.
        </div>
      </div>

      <div className="auth-divider-box">
        <h5>New to Kaadugal.in?</h5>
      </div>

      <div className="auth-secondary-action">
        <Link to="/register" className="auth-register-link-btn">
          Create your Kaadugal.in account
        </Link>
      </div>
    </div>
  );
}
