import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../components/context/AuthContext";
import { updateMyProfile } from "../../services/profileService";
import "./Profile.css";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiArrowLeft,
} from "react-icons/fi";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (user) {
      const activeUser = user?.user || user;
      setFormData({
        name: activeUser.name || activeUser.username || activeUser.fullName || "",
        email: activeUser.email || "",
        phone: activeUser.phone || activeUser.mobile || activeUser.mobileNumber || "",
        role:
          (typeof activeUser.role === "object"
            ? activeUser.role?.name
            : activeUser.role) || "Administrator",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const activeUserId =
        user?._id || user?.id || user?.user?._id || user?.user?.id;

      const payload = {
        userId: activeUserId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        mobile: formData.phone,
      };

      const res = await updateMyProfile(payload);
      const updatedUser = res.user || res.data || payload;

      updateUser(updatedUser);

      setAlert({
        type: "success",
        message: "Profile updated! Your new email, name, and phone number are saved for future logins.",
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayName = formData.name || "User";
  const firstLetter = String(displayName).trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-page">
      <div className="profile-container">
  
        <div className="profile-top-bar">
          <Link to="/dashboard" className="back-to-dashboard-btn">
            <FiArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {alert.message && (
          <div className={`profile-alert ${alert.type}`}>
            {alert.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{alert.message}</span>
          </div>
        )}

        <div className="profile-grid">

          <div className="profile-card profile-sidebar-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-large">{firstLetter}</div>
            </div>
            <h2 className="profile-name">{displayName}</h2>
            <span className="profile-role-badge">{formData.role}</span>

            <div className="profile-meta-list">
              <div className="meta-item">
                <FiMail />
                <span>{formData.email || "No email"}</span>
              </div>
              <div className="meta-item">
                <FiPhone />
                <span>{formData.phone || "No phone added"}</span>
              </div>
              <div className="meta-item">
                <FiShield />
                <span>Role: {formData.role}</span>
              </div>
            </div>
          </div>

          <div className="profile-content-column">
            <div className="profile-card">
              <div className="card-header">
                <FiUser size={18} />
                <h3>Personal Information</h3>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Full Name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address (Used for Login)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Email Address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile / Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter Mobile Number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      disabled
                      className="input-disabled"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={loading}>
                    <FiSave size={16} />
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}