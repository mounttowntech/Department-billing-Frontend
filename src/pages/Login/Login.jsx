import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import authBg from "../../assets/images/auth-bg.png";

import { FaEnvelope } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { loginUser } from "../../services/authService";
import { useAuth } from "../../components/context/AuthContext";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      // ==============================
      // LOGIN API
      // ==============================
      const response = await loginUser(formData);

      console.log("========== RAW LOGIN RESPONSE ==========");
      console.log(response);

      // Your API returns:
      // {
      //   success: true,
      //   token: "...",
      //   user: {...}
      // }

      const token =
        response?.token ||
        response?.data?.token;

      const apiUser =
        response?.user ||
        response?.data?.user;

      if (!token) {
        throw new Error("Authentication token not found");
      }

      if (!apiUser || typeof apiUser !== "object") {
        throw new Error("User details not found in login response");
      }

      console.log("========== API USER ==========");
      console.log(apiUser);

      console.log("USER NAME:", apiUser.firstName);
      console.log("USER EMAIL:", apiUser.email);
      console.log("ROLE:", apiUser.role?.roleCode);
      console.log("ROLE NAME:", apiUser.role?.roleName);
      console.log("STORE:", apiUser.store?.storeName);
      console.log("STORE CODE:", apiUser.store?.storeCode);

      // ==============================
      // SAVE EVERYTHING THROUGH AUTH
      // ==============================
      login(apiUser, token);

      setSuccessMessage("Login successful! Redirecting...");

      // ==============================
      // REDIRECT
      // ==============================
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 400);

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${authBg})`,
      }}
    >
      <div className="login-card">

        {/* HEADER */}
        <div className="login-header">
          <h2>Billing Pro</h2>
          <p>Welcome Back 👋</p>
        </div>

        {/* SUCCESS */}
        {successMessage && (
          <div className="login-success">
            {successMessage}
          </div>
        )}

        {/* ERROR */}
        {errorMessage && (
          <div className="login-error">
            {errorMessage}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="login-input-group">
            <FaEnvelope />

            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="login-input-group login-password-group">

            <RiLockPasswordFill />

            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <span
              className="login-eye-icon"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>

          </div>

          {/* OPTIONS */}
          <div className="login-options">

            <label className="login-remember">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() =>
                  setRememberMe((prev) => !prev)
                }
              />

              Remember Me

            </label>

            <Link
              to="/forgot-password"
              className="login-forgot"
            >
              Forgot Password?
            </Link>

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Login"}
          </button>

        </form>

        {/* REGISTER */}
        <div className="login-register">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;