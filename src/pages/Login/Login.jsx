import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import authBg from "../../assets/images/auth-bg.png";
import { FaEnvelope } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../components/context/AuthContext";
import { getMyProfile } from "../../services/profileService";
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
      const response = await loginUser(formData);

      // Extract the token (this part works correctly)
      const token = response?.token || response?.data?.token;

      if (!token) {
        throw new Error("Authentication token not found in response");
      }

      // 1. Set the token header immediately
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);

      // 2. Fetch the REAL user profile using the token
      let actualUser = null;
      try {
        const profileRes = await getMyProfile();
        // Extract the user data from your profile service response
        actualUser = profileRes?.user || profileRes?.data?.user || profileRes?.data || profileRes;
      } catch (err) {
        console.error("Failed to fetch profile after login:", err);
      }

      // 3. Fallback if profile fetch fails
      if (!actualUser || typeof actualUser !== "object" || actualUser.success) {
        actualUser = { 
          firstName: "Abinaya", 
          email: formData.email 
        };
      }

      // 4. Send the clean user profile to AuthContext
      login(actualUser, token);

      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 400);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || error.message || "Invalid email or password"
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
        <div className="login-header">
          <h2>Billing Pro</h2>
          <p>Welcome Back 👋</p>
        </div>

        {successMessage && (
          <div className="login-success">{successMessage}</div>
        )}

        {errorMessage && <div className="login-error">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <FaEnvelope />
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-input-group login-password-group">
            <RiLockPasswordFill />
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="login-eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>
            <Link to="/forgot-password" className="login-forgot">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <div className="login-register">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;