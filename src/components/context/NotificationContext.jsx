import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationService";

import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     GET MY NOTIFICATIONS
  ========================================================= */

  const fetchNotifications = useCallback(
    async (params = {}) => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getMyNotifications({
          page: 1,
          limit: 50,
          ...params,
        });

        console.log(
          "MY NOTIFICATIONS RESPONSE:",
          response
        );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load notifications."
          );
        }

        /*
          Backend response:

          {
            success: true,
            data: {
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1,
              data: [...]
            }
          }
        */

        const data = Array.isArray(
          response?.data?.data
        )
          ? response.data.data
          : [];

        setNotifications(data);

        /*
          Calculate unread count directly
          from notification list.
        */

        const unread = data.filter(
          (notification) =>
            notification?.isRead === false
        ).length;

        setUnreadCount(unread);
      } catch (error) {
        console.error(
          "FETCH NOTIFICATIONS ERROR:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load notifications."
        );

        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /* =========================================================
     REFRESH UNREAD COUNT
     
     No separate API call.
     Calculate from current notifications.
  ========================================================= */

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    setUnreadCount(
      notifications.filter(
        (notification) =>
          notification?.isRead === false
      ).length
    );
  }, [user, notifications]);

  /* =========================================================
     MARK SINGLE AS READ
  ========================================================= */

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) {
        return;
      }

      try {
        const response =
          await markNotificationAsRead(
            notificationId
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to mark notification as read."
          );
        }

        setNotifications((previous) =>
          previous.map((notification) =>
            notification?._id ===
            notificationId
              ? {
                  ...notification,
                  isRead: true,
                  readAt:
                    response?.data?.readAt ||
                    new Date().toISOString(),
                }
              : notification
          )
        );

        setUnreadCount((previous) =>
          Math.max(previous - 1, 0)
        );

        return response;
      } catch (error) {
        console.error(
          "MARK AS READ ERROR:",
          error
        );

        throw error;
      }
    },
    []
  );

  /* =========================================================
     MARK ALL AS READ
  ========================================================= */

  const markAllAsRead = useCallback(
    async () => {
      try {
        const response =
          await markAllNotificationsAsRead();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to mark all notifications as read."
          );
        }

        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,
            isRead: true,
            readAt:
              notification?.readAt ||
              new Date().toISOString(),
          }))
        );

        setUnreadCount(0);

        return response;
      } catch (error) {
        console.error(
          "MARK ALL AS READ ERROR:",
          error
        );

        throw error;
      }
    },
    []
  );

  /* =========================================================
     DELETE NOTIFICATION
  ========================================================= */

  const removeNotification = useCallback(
    async (notificationId) => {
      if (!notificationId) {
        return;
      }

      try {
        const notification =
          notifications.find(
            (item) =>
              item?._id === notificationId
          );

        const response =
          await deleteNotification(
            notificationId
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to delete notification."
          );
        }

        setNotifications((previous) =>
          previous.filter(
            (item) =>
              item?._id !== notificationId
          )
        );

        if (
          notification &&
          notification.isRead === false
        ) {
          setUnreadCount((previous) =>
            Math.max(previous - 1, 0)
          );
        }

        return response;
      } catch (error) {
        console.error(
          "DELETE NOTIFICATION ERROR:",
          error
        );

        throw error;
      }
    },
    [notifications]
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
  }, [user, fetchNotifications]);

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const value = {
    notifications,
    unreadCount,
    loading,
    error,

    fetchNotifications,
    fetchUnreadCount,

    markAsRead,
    markAllAsRead,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/* =========================================================
   CUSTOM HOOK
========================================================= */

export const useNotifications = () => {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
};

export default NotificationContext;