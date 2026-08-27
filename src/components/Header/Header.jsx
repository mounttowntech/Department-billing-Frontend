import React, {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

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
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  /* =========================================================
     STATES
  ========================================================= */

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    showProfile,
    setShowProfile,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loadingNotifications,
    setLoadingNotifications,
  ] = useState(false);

  const [
    notificationError,
    setNotificationError,
  ] = useState("");

  /* =========================================================
     USER
  ========================================================= */

  const loggedUser = user || {};

  /* =========================================================
     USER NAME
  ========================================================= */

  const userName =
    loggedUser?.name ||
    loggedUser?.fullName ||
    `${loggedUser?.firstName || ""} ${
      loggedUser?.lastName || ""
    }`.trim() ||
    loggedUser?.username ||
    loggedUser?.userName ||
    "User";

  /* =========================================================
     EMAIL
  ========================================================= */

  const userEmail =
    loggedUser?.email ||
    loggedUser?.emailAddress ||
    loggedUser?.mail ||
    "";

  /* =========================================================
     ROLE
  ========================================================= */

  const userRole =
    loggedUser?.roleName ||
    loggedUser?.role?.roleName ||
    loggedUser?.roleCode ||
    loggedUser?.role?.roleCode ||
    loggedUser?.role?.name ||
    "USER";

  /* =========================================================
     STORE
  ========================================================= */

  const store =
    loggedUser?.store ||
    loggedUser?.storeDetails ||
    null;

  const storeName =
    typeof store === "object"
      ? (
          store?.storeName ||
          store?.name ||
          store?.storeCode ||
          ""
        )
      : store || "";

  /* =========================================================
     STORE CODE
  ========================================================= */

  const storeCode =
    typeof store === "object"
      ? store?.storeCode || ""
      : "";

  /* =========================================================
     FIRST LETTER
  ========================================================= */

  const firstLetter =
    String(userName)
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  /* =========================================================
     PAGE TITLE
  ========================================================= */

  const currentPage = {
    title: "Billing Pro",
    subtitle: "Department Billing ERP",
  };

  /* =========================================================
     NOTIFICATION ID
  ========================================================= */

  const getNotificationId = (
    notification
  ) => {
    return (
      notification?._id ||
      notification?.id ||
      notification?.notificationId
    );
  };

  /* =========================================================
     FETCH MY NOTIFICATIONS
  ========================================================= */

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const response =
        await getNotifications();

      console.log(
        "NOTIFICATION API RESPONSE:",
        response
      );

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   message: "Notifications retrieved successfully.",
       *   data: {
       *      total,
       *      page,
       *      limit,
       *      totalPages,
       *      data: []
       *   }
       * }
       */

      let notificationData = [];

      if (
        Array.isArray(
          response?.data?.data
        )
      ) {
        notificationData =
          response.data.data;
      } else if (
        Array.isArray(response?.data)
      ) {
        notificationData =
          response.data;
      } else if (
        Array.isArray(
          response?.notifications
        )
      ) {
        notificationData =
          response.notifications;
      } else if (
        Array.isArray(response)
      ) {
        notificationData =
          response;
      }

      setNotifications(
        Array.isArray(notificationData)
          ? notificationData
          : []
      );
    } catch (error) {
      console.error(
        "NOTIFICATIONS API ERROR:",
        error
      );

      setNotificationError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load notifications."
      );

      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  /* =========================================================
     UNREAD CHECK
  ========================================================= */

  const isUnread = (
    notification
  ) => {
    return (
      notification?.isRead === false
    );
  };

  /* =========================================================
     UNREAD NOTIFICATIONS
  ========================================================= */

  const unreadNotifications =
    Array.isArray(notifications)
      ? notifications.filter(
          isUnread
        )
      : [];

  /* =========================================================
     NOTIFICATION ICON
  ========================================================= */

  const getNotificationIcon = (
    type
  ) => {
    switch (
      String(type || "")
        .toLowerCase()
    ) {
      case "success":
      case "payment":
        return <FaCheckCircle />;

      case "warning":
      case "danger":
      case "error":
      case "critical":
        return (
          <FaExclamationTriangle />
        );

      default:
        return <FaInfoCircle />;
    }
  };

  /* =========================================================
     NOTIFICATION TYPE CLASS
  ========================================================= */

  const getNotificationTypeClass = (
    notification
  ) => {
    const type = String(
      notification?.type || "general"
    ).toLowerCase();

    if (
      type === "payment" ||
      type === "success"
    ) {
      return "success";
    }

    if (
      type === "expense" ||
      type === "stock" ||
      type === "purchase" ||
      type === "supplier"
    ) {
      return "warning";
    }

    if (
      type === "critical" ||
      type === "error" ||
      notification?.priority ===
        "Critical"
    ) {
      return "danger";
    }

    return "info";
  };

  /* =========================================================
     MARK SINGLE AS READ
  ========================================================= */

  const handleMarkAsRead = async (
    notification
  ) => {
    const id =
      getNotificationId(
        notification
      );

    if (!id) {
      return;
    }

    try {
      await markNotificationAsRead(
        id
      );

      /*
       * Remove it from notification
       * dropdown because dropdown
       * displays unread notifications.
       */

      setNotifications(
        (previous) =>
          Array.isArray(previous)
            ? previous.filter(
                (item) =>
                  getNotificationId(
                    item
                  ) !== id
              )
            : []
      );
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );
    }
  };

  /* =========================================================
     MARK ALL AS READ
  ========================================================= */

  const handleMarkAllAsRead =
    async () => {
      if (
        unreadNotifications.length ===
        0
      ) {
        return;
      }

      try {
        /*
         * Backend:
         * PUT /api/notifications/read-all
         *
         * No receiver is required because
         * backend gets req.user.id.
         */

        await markAllNotificationsAsRead();

        /*
         * Remove all unread notifications
         * from dropdown.
         */

        setNotifications(
          (previous) =>
            Array.isArray(previous)
              ? previous.filter(
                  (item) =>
                    !isUnread(item)
                )
              : []
        );
      } catch (error) {
        console.error(
          "MARK ALL NOTIFICATIONS ERROR:",
          error
        );
      }
    };

  /* =========================================================
     DELETE NOTIFICATION
  ========================================================= */

  const handleDeleteNotification =
    async (
      notification
    ) => {
      const id =
        getNotificationId(
          notification
        );

      if (!id) {
        return;
      }

      try {
        await deleteNotification(
          id
        );

        setNotifications(
          (previous) =>
            Array.isArray(previous)
              ? previous.filter(
                  (item) =>
                    getNotificationId(
                      item
                    ) !== id
                )
              : []
        );
      } catch (error) {
        console.error(
          "DELETE NOTIFICATION ERROR:",
          error
        );
      }
    };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    setShowProfile(false);
    setShowNotifications(false);

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  /* =========================================================
     TOGGLE NOTIFICATIONS
  ========================================================= */

  const toggleNotifications = () => {
    setShowProfile(false);

    setShowNotifications(
      (previous) => !previous
    );

    /*
     * Refresh whenever dropdown
     * is opened.
     */

    if (!showNotifications) {
      fetchNotifications();
    }
  };

  /* =========================================================
     TOGGLE PROFILE
  ========================================================= */

  const toggleProfile = () => {
    setShowNotifications(false);

    setShowProfile(
      (previous) => !previous
    );
  };

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatTime = (
    notification
  ) => {
    const date =
      notification?.createdAt ||
      notification?.updatedAt ||
      notification?.date;

    if (!date) {
      return "Recently";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Recently";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <header className="app-header">

      {/* =====================================================
          LEFT
      ===================================================== */}

      <div className="header-left">

        <div
          className="header-title"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <h1>
            {currentPage.title}
          </h1>

          <span>
            {currentPage.subtitle}
          </span>
        </div>

      </div>

      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="header-right">

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <div className="notification-wrapper">

          <button
            type="button"
            className={`header-icon-btn ${
              showNotifications
                ? "header-icon-active"
                : ""
            }`}
            onClick={
              toggleNotifications
            }
            aria-label="Notifications"
          >
            <FaBell />

            {unreadNotifications.length >
              0 && (
              <span className="notification-badge">
                {
                  unreadNotifications.length
                }
              </span>
            )}
          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

          {showNotifications && (
            <div className="notification-dropdown">

              {/* =============================================
                  HEADER
              ============================================= */}

              <div className="notification-header">

                <div>

                  <h3>
                    Notifications
                  </h3>

                  <span>
                    {
                      unreadNotifications.length
                    }{" "}
                    unread
                  </span>

                </div>

                <div className="notification-header-actions">

                  {unreadNotifications.length >
                    0 && (
                    <button
                      type="button"
                      className="mark-all-button"
                      onClick={
                        handleMarkAllAsRead
                      }
                    >
                      Mark all read
                    </button>
                  )}

                  <button
                    type="button"
                    className="refresh-notification"
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                    aria-label="Close notifications"
                  >
                    <FaTimes />
                  </button>

                </div>

              </div>

              {/* =============================================
                  LIST
              ============================================= */}

              <div className="notification-list">

                {/* LOADING */}

                {loadingNotifications ? (
                  <div className="notification-empty">

                    <div className="notification-loader" />

                    <h4>
                      Loading
                      notifications...
                    </h4>

                  </div>
                ) : notificationError ? (

                  /* ERROR */

                  <div className="notification-empty">

                    <FaExclamationTriangle />

                    <h4>
                      {notificationError}
                    </h4>

                    <button
                      type="button"
                      className="mark-all-button"
                      onClick={
                        fetchNotifications
                      }
                    >
                      Try again
                    </button>

                  </div>
                ) : unreadNotifications.length ===
                  0 ? (

                  /* EMPTY */

                  <div className="notification-empty">

                    <FaCheckCircle />

                    <h4>
                      You're all caught up
                    </h4>

                    <p>
                      No new notifications
                    </p>

                  </div>
                ) : (

                  /* NOTIFICATIONS */

                  unreadNotifications.map(
                    (
                      notification
                    ) => {

                      const id =
                        getNotificationId(
                          notification
                        );

                      const type =
                        notification?.type ||
                        "general";

                      const title =
                        notification?.title ||
                        "Notification";

                      const message =
                        notification?.message ||
                        "You have a new notification.";

                      const typeClass =
                        getNotificationTypeClass(
                          notification
                        );

                      return (
                        <div
                          className="notification-item"
                          key={id}
                        >

                          {/* ICON */}

                          <div
                            className={`notification-item-icon ${typeClass}`}
                          >
                            {getNotificationIcon(
                              type
                            )}
                          </div>

                          {/* CONTENT */}

                          <div className="notification-content">

                            <h4>
                              {title}
                            </h4>

                            <p>
                              {message}
                            </p>

                            {/* PRIORITY */}

                            {notification?.priority && (
                              <small
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "4px",
                                  fontSize:
                                    "10px",
                                  color:
                                    notification.priority ===
                                    "Critical"
                                      ? "#dc2626"
                                      : "#98a0b3",
                                }}
                              >
                                Priority:{" "}
                                {
                                  notification.priority
                                }
                              </small>
                            )}

                            <span>
                              {formatTime(
                                notification
                              )}
                            </span>

                            {/* ACTIONS */}

                            <div className="notification-actions">

                              <button
                                type="button"
                                className="small-action-button"
                                onClick={() =>
                                  handleMarkAsRead(
                                    notification
                                  )
                                }
                              >
                                Mark as read
                              </button>

                              <button
                                type="button"
                                className="delete-notification-button"
                                onClick={() =>
                                  handleDeleteNotification(
                                    notification
                                  )
                                }
                                title="Delete notification"
                                aria-label="Delete notification"
                              >
                                <FaTrash />
                              </button>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )
                )}

              </div>

              {/* =============================================
                  FOOTER
              ============================================= */}

              <div className="notification-footer">

                <button
                  type="button"
                  onClick={
                    fetchNotifications
                  }
                >
                  Refresh notifications
                </button>

              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            DIVIDER
        =================================================== */}

        <div className="header-divider" />

        {/* ===================================================
            PROFILE
        =================================================== */}

        <div className="profile-wrapper">

          <button
            type="button"
            className={`profile-button ${
              showProfile
                ? "profile-button-active"
                : ""
            }`}
            onClick={
              toggleProfile
            }
          >

            <div className="profile-avatar-default">
              {firstLetter}
            </div>

            <div className="profile-info">

              <strong>
                {userName}
              </strong>

              <span>
                {userRole}
              </span>

            </div>

            <FaChevronDown
              className={`profile-arrow ${
                showProfile
                  ? "rotate"
                  : ""
              }`}
            />

          </button>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          {showProfile && (
            <div className="profile-dropdown">

              {/* USER INFORMATION */}

              <div className="profile-dropdown-user">

                <div className="profile-large-avatar">
                  {firstLetter}
                </div>

                <div>

                  <h3>
                    {userName}
                  </h3>

                  <span>
                    {userRole}
                  </span>

                  {userEmail && (
                    <small>
                      {userEmail}
                    </small>
                  )}

                  {storeName && (
                    <small className="profile-store">
                      Store:{" "}
                      {storeName}
                    </small>
                  )}

                  {storeCode && (
                    <small className="profile-store-code">
                      Code:{" "}
                      {storeCode}
                    </small>
                  )}

                </div>

              </div>

              <div className="profile-menu-divider" />

              {/* MY PROFILE */}

              <NavLink
                to="/profile"
                className="profile-menu-item"
                onClick={() =>
                  setShowProfile(
                    false
                  )
                }
              >

                <FaUser />

                <div>

                  <strong>
                    My Profile
                  </strong>

                  <span>
                    View your account
                  </span>

                </div>

              </NavLink>

              {/* SETTINGS */}

              <NavLink
                to="/settings"
                className="profile-menu-item"
                onClick={() =>
                  setShowProfile(
                    false
                  )
                }
              >

                <FaCog />

                <div>

                  <strong>
                    Settings
                  </strong>

                  <span>
                    Account settings
                  </span>

                </div>

              </NavLink>

              <div className="profile-menu-divider" />

              {/* LOGOUT */}

              <button
                type="button"
                className="profile-menu-item logout-item"
                onClick={
                  handleLogout
                }
              >

                <FaSignOutAlt />

                <div>

                  <strong>
                    Logout
                  </strong>

                  <span>
                    Sign out of your
                    account
                  </span>

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