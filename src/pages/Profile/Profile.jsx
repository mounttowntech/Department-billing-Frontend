import React, {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  useAuth,
} from "../../components/context/AuthContext";

import {
  updateMyProfile,
} from "../../services/profileService";

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
  FiHome,
} from "react-icons/fi";

export default function Profile() {
  const {
    user,
    updateUser,
  } = useAuth();

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [
    formData,
    setFormData,
  ] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    roleCode: "",
    storeName: "",
    storeCode: "",
  });

  // ==========================================================
  // ALERT
  // ==========================================================

  const [
    alert,
    setAlert,
  ] = useState({
    type: "",
    message: "",
  });

  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ==========================================================
  // LOAD USER FROM AUTH CONTEXT
  // ==========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    console.log(
      "================================"
    );
    console.log(
      "PROFILE USER FROM AUTH CONTEXT"
    );
    console.log(
      "================================"
    );
    console.log("User:", user);

    setFormData({
      firstName:
        user?.firstName || "",

      lastName:
        user?.lastName || "",

      email:
        user?.email || "",

      phone:
        user?.phone || "",

      role:
        user?.role?.roleName ||
        user?.roleName ||
        user?.roleCode ||
        "User",

      roleCode:
        user?.role?.roleCode ||
        user?.roleCode ||
        "",

      storeName:
        user?.store?.storeName ||
        "",

      storeCode:
        user?.store?.storeCode ||
        "",
    });
  }, [user]);

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    // Clear previous alert
    setAlert({
      type: "",
      message: "",
    });
  };

  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Prevent double click
    if (loading) {
      return;
    }

    setLoading(true);

    setAlert({
      type: "",
      message: "",
    });

    try {
      // ======================================================
      // VALIDATE FRONTEND DATA
      // ======================================================

      const firstName =
        formData.firstName.trim();

      const lastName =
        formData.lastName.trim();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const phone =
        formData.phone.trim();

      if (!firstName) {
        throw new Error(
          "First name is required."
        );
      }

      if (!email) {
        throw new Error(
          "Email address is required."
        );
      }

      if (!phone) {
        throw new Error(
          "Phone number is required."
        );
      }

      // ======================================================
      // PAYLOAD
      // ======================================================

      const payload = {
        firstName,
        lastName,
        email,
        phone,
      };

      console.log(
        "================================"
      );

      console.log(
        "PROFILE UPDATE REQUEST"
      );

      console.log(
        "================================"
      );

      console.log(
        "Payload:",
        payload
      );

      // ======================================================
      // CALL BACKEND
      // ======================================================

      const response =
        await updateMyProfile(
          payload
        );

      console.log(
        "================================"
      );

      console.log(
        "PROFILE UPDATE RESPONSE"
      );

      console.log(
        "================================"
      );

      console.log(
        "Response:",
        response
      );

      // ======================================================
      // CHECK RESPONSE
      // ======================================================

      if (!response?.success) {
        throw new Error(
          response?.message ||
          "Profile update failed."
        );
      }

      // ======================================================
      // GET UPDATED USER
      // ======================================================

      const updatedUser =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        null;

      if (
        !updatedUser ||
        typeof updatedUser !== "object"
      ) {
        throw new Error(
          "Backend did not return updated user."
        );
      }

      console.log(
        "================================"
      );

      console.log(
        "UPDATED USER FROM MONGODB"
      );

      console.log(
        "================================"
      );

      console.log(
        "Updated User:",
        updatedUser
      );

      // ======================================================
      // MERGE WITH CURRENT USER
      // ======================================================
      //
      // Backend may return role/store populated,
      // but if not, preserve the existing ones.
      //

      const mergedUser = {
        ...user,
        ...updatedUser,

        role:
          updatedUser?.role ||
          user?.role ||
          null,

        store:
          updatedUser?.store ||
          user?.store ||
          null,

        roleCode:
          updatedUser?.role?.roleCode ||
          updatedUser?.roleCode ||
          user?.roleCode ||
          "",

        roleName:
          updatedUser?.role?.roleName ||
          updatedUser?.roleName ||
          user?.roleName ||
          "",
      };

      console.log(
        "================================"
      );

      console.log(
        "MERGED USER FOR AUTH CONTEXT"
      );

      console.log(
        "================================"
      );

      console.log(
        mergedUser
      );

      // ======================================================
      // UPDATE AUTH CONTEXT
      // ======================================================
      //
      // This makes the Header update immediately.
      //

      updateUser(
        mergedUser
      );

      // ======================================================
      // UPDATE FORM
      // ======================================================

      setFormData({
        firstName:
          mergedUser?.firstName ||
          "",

        lastName:
          mergedUser?.lastName ||
          "",

        email:
          mergedUser?.email ||
          "",

        phone:
          mergedUser?.phone ||
          "",

        role:
          mergedUser?.role?.roleName ||
          mergedUser?.roleName ||
          mergedUser?.roleCode ||
          "User",

        roleCode:
          mergedUser?.role?.roleCode ||
          mergedUser?.roleCode ||
          "",

        storeName:
          mergedUser?.store?.storeName ||
          "",

        storeCode:
          mergedUser?.store?.storeCode ||
          "",
      });

      // ======================================================
      // SUCCESS MESSAGE
      // ======================================================

      setAlert({
        type: "success",
        message:
          "Profile updated successfully.",
      });

    } catch (error) {
      console.error(
        "================================"
      );

      console.error(
        "PROFILE UPDATE ERROR"
      );

      console.error(
        "================================"
      );

      console.error(
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update profile.";

      setAlert({
        type: "error",
        message: errorMessage,
      });

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DISPLAY NAME
  // ==========================================================

  const displayName =
    [
      formData.firstName,
      formData.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "User";

  // ==========================================================
  // FIRST LETTER
  // ==========================================================

  const firstLetter =
    displayName
      .charAt(0)
      .toUpperCase() ||
    "U";

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="profile-page">

      <div className="profile-container">

        {/* ==================================================
            BACK TO DASHBOARD
        ================================================== */}

        <div className="profile-top-bar">

          <Link
            to="/dashboard"
            className="back-to-dashboard-btn"
          >
            <FiArrowLeft size={16} />

            <span>
              Back to Dashboard
            </span>
          </Link>

        </div>

        {/* ==================================================
            ALERT
        ================================================== */}

        {alert.message && (
          <div
            className={`profile-alert ${alert.type}`}
          >

            {alert.type === "success" ? (
              <FiCheckCircle />
            ) : (
              <FiAlertCircle />
            )}

            <span>
              {alert.message}
            </span>

          </div>
        )}

        {/* ==================================================
            PROFILE GRID
        ================================================== */}

        <div className="profile-grid">

          {/* ==================================================
              LEFT PROFILE CARD
          ================================================== */}

          <div
            className="
              profile-card
              profile-sidebar-card
            "
          >

            {/* AVATAR */}

            <div className="profile-avatar-wrapper">

              <div
                className="
                  profile-avatar-large
                "
              >
                {firstLetter}
              </div>

            </div>

            {/* NAME */}

            <h2 className="profile-name">
              {displayName}
            </h2>

            {/* ROLE */}

            <span
              className="
                profile-role-badge
              "
            >
              {formData.role}
            </span>

            {/* ==================================================
                PROFILE META
            ================================================== */}

            <div
              className="
                profile-meta-list
              "
            >

              {/* EMAIL */}

              <div className="meta-item">

                <FiMail />

                <span>
                  {formData.email ||
                    "No email"}
                </span>

              </div>

              {/* PHONE */}

              <div className="meta-item">

                <FiPhone />

                <span>
                  {formData.phone ||
                    "No phone added"}
                </span>

              </div>

              {/* ROLE */}

              <div className="meta-item">

                <FiShield />

                <span>
                  Role:{" "}
                  {formData.role}
                </span>

              </div>

              {/* STORE */}

              <div className="meta-item">

                <FiHome />

                <span>
                  {formData.storeName ||
                    "No store"}
                </span>

              </div>

              {/* STORE CODE */}

              <div className="meta-item">

                <FiHome />

                <span>
                  Store Code:{" "}
                  {formData.storeCode ||
                    "N/A"}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              RIGHT CONTENT
          ================================================== */}

          <div
            className="
              profile-content-column
            "
          >

            <div className="profile-card">

              {/* CARD HEADER */}

              <div className="card-header">

                <FiUser size={18} />

                <h3>
                  Personal Information
                </h3>

              </div>

              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={
                  handleProfileSubmit
                }
              >

                <div className="form-grid">

                  {/* ==================================================
                      FIRST NAME
                  ================================================== */}

                  <div className="form-group">

                    <label>
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={
                        formData.firstName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter First Name"
                      required
                    />

                  </div>

                  {/* ==================================================
                      LAST NAME
                  ================================================== */}

                  <div className="form-group">

                    <label>
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={
                        formData.lastName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter Last Name"
                    />

                  </div>

                  {/* ==================================================
                      EMAIL
                  ================================================== */}

                  <div className="form-group">

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter Email Address"
                      required
                    />

                  </div>

                  {/* ==================================================
                      PHONE
                  ================================================== */}

                  <div className="form-group">

                    <label>
                      Mobile / Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter Mobile Number"
                      required
                    />

                  </div>

                  {/* ==================================================
                      ROLE
                  ================================================== */}

                  <div className="form-group">

                    <label>
                      Role
                    </label>

                    <input
                      type="text"
                      value={
                        formData.role
                      }
                      disabled
                      className="
                        input-disabled
                      "
                    />

                  </div>

                  {/* ==================================================
                      STORE
                  ================================================== */}

                  <div className="form-group">

                    <label>
                      Store
                    </label>

                    <input
                      type="text"
                      value={
                        formData.storeName
                      }
                      disabled
                      className="
                        input-disabled
                      "
                    />

                  </div>

                  {/* ==================================================
                      STORE CODE
                  ================================================== */}

                  <div className="form-group">

                    <label>
                      Store Code
                    </label>

                    <input
                      type="text"
                      value={
                        formData.storeCode
                      }
                      disabled
                      className="
                        input-disabled
                      "
                    />

                  </div>

                </div>

                {/* ==================================================
                    SAVE BUTTON
                ================================================== */}

                <div className="form-actions">

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >

                    <FiSave size={16} />

                    <span>
                      {loading
                        ? "Saving..."
                        : "Save Changes"}
                    </span>

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