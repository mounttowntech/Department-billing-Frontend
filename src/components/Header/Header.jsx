import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaChevronDown,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationService";

import "./Header.css";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const currentPage = {
    title: "Billing Pro",
    subtitle: "Department Billing ERP",
  };

  // Safely grab user directly from AuthContext (which reads localStorage instantly)
  const loggedUser = user || {};

  const userName =
    loggedUser.name ||
    loggedUser.fullName ||
    (loggedUser.firstName
      ? `${loggedUser.firstName} ${loggedUser.lastName || ""}`.trim()
      : "") ||
    loggedUser.userName ||
    loggedUser.username ||
    loggedUser.displayName ||
    "Abinaya"; // Fallback to your name so it never shows "User"

  const userRole =
    (typeof loggedUser.role === "object"
      ? loggedUser.role?.name || loggedUser.role?.roleName
      : loggedUser.role) ||
    loggedUser.roleName ||
    loggedUser.userRole ||
    "Administrator";

  const userEmail =
    loggedUser.email ||
    loggedUser.emailAddress ||
    loggedUser.mail ||
    "admin@billingpro.com";

  const firstLetter =
    String(userName || "U")
      .trim()
      .charAt(0)
      .toUpperCase() || "A";

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const response = await getNotifications();
      let notificationData = [];

      if (Array.isArray(response)) {
        notificationData = response;
      } else if (Array.isArray(response?.data)) {
        notificationData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        notificationData = response.data.data;
      } else if (Array.isArray(response?.data?.notifications)) {
        notificationData = response.data.notifications;
      } else if (Array.isArray(response?.notifications)) {
        notificationData = response.notifications;
      }

      setNotifications(Array.isArray(notificationData) ? notificationData : []);
    } catch (error) {
      console.error("Notifications API Error:", error);
      setNotificationError("Unable to load notifications");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Only fetch notifications on mount, NOT profile
  useState(() => {
    fetchNotifications();
  }, []);

  const isUnread = (notification) => {
    return (
      notification?.isRead === false ||
      notification?.read === false ||
      notification?.status === "unread"
    );
  };

  const unreadNotifications = Array.isArray(notifications)
    ? notifications.filter((notification) => isUnread(notification))
    : [];

  const getNotificationIcon = (type) => {
    switch (String(type || "").toLowerCase()) {
      case "success":
        return <FaCheckCircle />;
      case "warning":
      case "danger":
      case "error":
        return <FaExclamationTriangle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getNotificationId = (notification) => {
    return (
      notification?._id ||
      notification?.id ||
      notification?.notificationId
    );
  };

  const handleMarkAsRead = async (notification) => {
    const id = getNotificationId(notification);
    if (!id) return;

    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.filter((item) => getNotificationId(item) !== id) : []
      );
    } catch (error) {
      console.error("Mark notification read error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadNotifications.length === 0) return;

    try {
      const firstId = getNotificationId(unreadNotifications[0]);
      if (!firstId) return;

      await markAllNotificationsAsRead(firstId);
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.filter((item) => !isUnread(item)) : []
      );
    } catch (error) {
      console.error("Mark all notifications error:", error);
    }
  };

  const handleDeleteNotification = async (notification) => {
    const id = getNotificationId(notification);
    if (!id) return;

    try {
      await deleteNotification(id);
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.filter((item) => getNotificationId(item) !== id) : []
      );
    } catch (error) {
      console.error("Delete notification error:", error);
    }
  };

  const handleLogout = () => {
    setShowProfile(false);
    setShowNotifications(false);
    logout();
    navigate("/login");
  };

  const toggleNotifications = () => {
    setShowProfile(false);
    setShowNotifications((prev) => !prev);
    if (!showNotifications) fetchNotifications();
  };

  const toggleProfile = () => {
    setShowNotifications(false);
    setShowProfile((prev) => !prev);
  };

  const formatTime = (notification) => {
    const date =
      notification?.createdAt ||
      notification?.updatedAt ||
      notification?.date;

    if (!date) return "Recently";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Recently";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="app-header">
      {/* Title */}
      <div className="header-left">
        <div
          className="header-title"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          <h1>{currentPage.title}</h1>
          <span>{currentPage.subtitle}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="header-right">
        {/* Notifications */}
        <div className="notification-wrapper">
          <button
            type="button"
            className={`header-icon-btn ${
              showNotifications ? "header-icon-active" : ""
            }`}
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <FaBell />
            {unreadNotifications.length > 0 && (
              <span className="notification-badge">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <h3>Notifications</h3>
                  <span>{unreadNotifications.length} unread</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {unreadNotifications.length > 0 && (
                    <button
                      type="button"
                      className="refresh-notification"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    className="refresh-notification"
                    onClick={() => setShowNotifications(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="notification-list">
                {loadingNotifications ? (
                  <div className="notification-empty">
                    <div className="notification-loader"></div>
                    <h4>Loading notifications...</h4>
                  </div>
                ) : notificationError ? (
                  <div className="notification-empty">
                    <FaExclamationTriangle />
                    <h4>{notificationError}</h4>
                    <button
                      type="button"
                      className="refresh-notification"
                      onClick={fetchNotifications}
                    >
                      Try again
                    </button>
                  </div>
                ) : unreadNotifications.length === 0 ? (
                  <div className="notification-empty">
                    <FaCheckCircle />
                    <h4>You're all caught up</h4>
                    <p>No new notifications</p>
                  </div>
                ) : (
                  unreadNotifications.map((notification) => {
                    const id = getNotificationId(notification);
                    const type =
                      notification?.type ||
                      notification?.notificationType ||
                      "info";
                    const title =
                      notification?.title ||
                      notification?.subject ||
                      notification?.name ||
                      "Notification";
                    const message =
                      notification?.message ||
                      notification?.description ||
                      notification?.content ||
                      "You have a new notification.";

                    return (
                      <div className="notification-item" key={id}>
                        <div className={`notification-item-icon ${type}`}>
                          {getNotificationIcon(type)}
                        </div>

                        <div className="notification-content">
                          <h4>{title}</h4>
                          <p>{message}</p>
                          <span>{formatTime(notification)}</span>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "8px",
                            }}
                          >
                            <button
                              type="button"
                              className="refresh-notification"
                              onClick={() => handleMarkAsRead(notification)}
                            >
                              Mark as read
                            </button>
                            <button
                              type="button"
                              className="refresh-notification"
                              onClick={() =>
                                handleDeleteNotification(notification)
                              }
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="notification-footer">
                <button type="button" onClick={fetchNotifications}>
                  Refresh notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="header-divider"></div>

        {/* Profile */}
        <div className="profile-wrapper">
          <button
            type="button"
            className={`profile-button ${
              showProfile ? "profile-button-active" : ""
            }`}
            onClick={toggleProfile}
          >
            <div className="profile-avatar profile-avatar-default">
              {firstLetter}
            </div>

            <div className="profile-info">
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </div>

            <FaChevronDown
              className={`profile-arrow ${showProfile ? "rotate" : ""}`}
            />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-user">
                <div className="profile-large-avatar">{firstLetter}</div>
                <div>
                  <h3>{userName}</h3>
                  <span>{userRole}</span>
                  <small>{userEmail}</small>
                </div>
              </div>

              <div className="profile-menu-divider"></div>

              <NavLink
                to="/profile"
                className="profile-menu-item"
                onClick={() => setShowProfile(false)}
              >
                <FaUser />
                <div>
                  <strong>My Profile</strong>
                  <span>View your account</span>
                </div>
              </NavLink>

              <NavLink
                to="/settings"
                className="profile-menu-item"
                onClick={() => setShowProfile(false)}
              >
                <FaCog />
                <div>
                  <strong>Settings</strong>
                  <span>Account settings</span>
                </div>
              </NavLink>

              <div className="profile-menu-divider"></div>

              <button
                type="button"
                className="profile-menu-item logout-item"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <div>
                  <strong>Logout</strong>
                  <span>Sign out of your account</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;