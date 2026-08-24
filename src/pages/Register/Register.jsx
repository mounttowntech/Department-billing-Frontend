import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import authBg from "../../assets/images/auth-bg.png";

import { FaUser, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

import { MdWork, MdStore } from "react-icons/md";

import { RiLockPasswordFill } from "react-icons/ri";

import { FiEye, FiEyeOff } from "react-icons/fi";

import { registerUser } from "../../services/authService";
import { getRoles } from "../../services/roleService";
import { getStores } from "../../services/storeService";
import Select from "react-select";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    store: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchRolesAndStores = async () => {
      try {
        const [rolesResponse, storesResponse] = await Promise.all([getRoles(), getStores()]);

        setRoles(rolesResponse.data);
        setStores(storesResponse.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchRolesAndStores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,

      [name]: value,
    });

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");

      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName: formData.firstName,

        lastName: formData.lastName,

        email: formData.email,

        phone: formData.phone,

        password: formData.password,

        role: formData.role,

        store: formData.store,
      };

const res = await registerUser(payload);

if(res.success){
  setSuccessMessage("Registration successful! Redirecting...");

  setTimeout(() => {
    navigate("/login");
  },1500);
}
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `url(${authBg})`,
      }}
    >
      <div className="register-card">
        <h2>Create Account</h2>

        <p>Create your Billing Pro account</p>

        {successMessage && (
          <div className="register-success-message">{successMessage}</div>
        )}

        {errorMessage && (
          <div className="register-error-message">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div className="register-input-group">
              <FaUser />

              <input
                className="register-input"
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-input-group">
              <FaUser />

              <input
                className="register-input"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-input-group">
              <FaEnvelope />

              <input
                className="register-input"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-input-group">
              <FaPhoneAlt />

              <input
                className="register-input"
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
        <div className="register-select-wrapper">
  <MdWork className="select-icon" />

  <Select
    className="custom-select"
    classNamePrefix="select"
    placeholder="Select Role"
    options={roles.map((role) => ({
      value: role._id,
      label: role.roleName,
    }))}
    value={roles
      .map((role) => ({
        value: role._id,
        label: role.roleName,
      }))
      .find((item) => item.value === formData.role)}
    onChange={(selected) =>
      setFormData({
        ...formData,
        role: selected?.value || "",
      })
    }
  />
</div>

<div className="register-select-wrapper">
  <MdStore className="select-icon" />

  <Select
    className="custom-select"
    classNamePrefix="select"
    placeholder="Select Store"
    options={stores.map((store) => ({
      value: store._id,
      label: store.storeName,
    }))}
    value={stores
      .map((store) => ({
        value: store._id,
        label: store.storeName,
      }))
      .find((item) => item.value === formData.store)}
    onChange={(selected) =>
      setFormData({
        ...formData,
        store: selected?.value || "",
      })
    }
  />
</div>
  <div className="register-input-group register-password-group">
              <RiLockPasswordFill />

              <input
                className="register-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <span
                className="register-eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            <div className="register-input-group register-password-group">
              <RiLockPasswordFill />

              <input
                className="register-input"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <span
                className="register-eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="terms">
            <label>
              <input type="checkbox" required />I agree to Terms & Conditions
            </label>
          </div>

          <button className="register-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="login-link">
          Already have an account?
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
