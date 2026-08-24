import { useState } from "react";
import { Link } from "react-router-dom";

import authBg from "../../assets/images/auth-bg.png";

import { FaEnvelope } from "react-icons/fa";

import { forgotPassword } from "../../services/authService";

import "./ForgotPassword.css";

function ForgotPassword() {

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {

      setLoading(true);

      await forgotPassword({ email });

      setSuccessMessage(
        "Password reset link has been sent to your email."
      );

    } catch (error) {

      setErrorMessage(
        error.response?.data?.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      className="forgot-page"
      style={{
        backgroundImage: `url(${authBg})`,
      }}
    >

      <div className="forgot-card">

        <div className="forgot-header">

          <h2>Forgot Password</h2>

          <p>
            Enter your email address to receive a password reset link.
          </p>

        </div>

        {successMessage && (
          <div className="forgot-success-message">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="forgot-error-message">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="forgot-input-group">

            <FaEnvelope />

            <input
              className="forgot-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <button
            className="forgot-btn"
            disabled={loading}
          >

            {loading
              ? "Sending..."
              : "Send Reset Link"}

          </button>

        </form>

        <div className="forgot-login-link">

          Remember your password?

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </div>

  );

}

export default ForgotPassword;