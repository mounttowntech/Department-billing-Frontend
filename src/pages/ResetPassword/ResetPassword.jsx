import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import authBg from "../../assets/images/auth-bg.png";

import { RiLockPasswordFill } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { resetPassword } from "../../services/authService";

import "./ResetPassword.css";

function ResetPassword() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [formData, setFormData] = useState({

    password: "",

    confirmPassword: "",

  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setErrorMessage(
        "Passwords do not match."
      );

      return;

    }

    try {

      setLoading(true);

      await resetPassword(
        token,
        formData.password
      );

      setSuccessMessage(
        "Password changed successfully."
      );

      setTimeout(() => {

        navigate("/login");

      },1500);

    } catch (error) {

      setErrorMessage(
        error.response?.data?.message ||
        "Reset failed."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      className="reset-page"
      style={{
        backgroundImage:
          `url(${authBg})`,
      }}
    >

      <div className="reset-card">

        <h2>Reset Password</h2>

        <p>
          Create your new password
        </p>

        {successMessage && (

          <div className="reset-success-message">
            {successMessage}
          </div>

        )}

        {errorMessage && (

          <div className="reset-error-message">
            {errorMessage}
          </div>

        )}

        <form onSubmit={handleSubmit}>

          <div className="reset-input-group">

            <RiLockPasswordFill />

            <input
              className="reset-input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="New Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <span
              className="reset-eye-icon"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword
                ? <FiEyeOff/>
                : <FiEye/>}
            </span>

          </div>

          <div className="reset-input-group">

            <RiLockPasswordFill />

            <input
              className="reset-input"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <span
              className="reset-eye-icon"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword
                ? <FiEyeOff/>
                : <FiEye/>}
            </span>

          </div>

          <button
            className="reset-btn"
            disabled={loading}
          >

            {loading
              ? "Updating..."
              : "Reset Password"}

          </button>

        </form>

      </div>

    </div>

  );

}

export default ResetPassword;