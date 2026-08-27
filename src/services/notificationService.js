import api from "../api/axios";

/* =========================================================
   GET MY NOTIFICATIONS

   GET /api/notifications/all
========================================================= */

export const getMyNotifications = async (
  params = {}
) => {
  const response = await api.get(
    "/notifications/all",
    {
      params,
    }
  );

  return response.data;
};

/* =========================================================
   GET NOTIFICATION BY ID
========================================================= */

export const getNotificationById = async (
  id
) => {
  const response = await api.get(
    `/notifications/${id}`
  );

  return response.data;
};

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

export const createNotification = async (
  payload
) => {
  const response = await api.post(
    "/notifications/create",
    payload
  );

  return response.data;
};

/* =========================================================
   UPDATE NOTIFICATION
========================================================= */

export const updateNotification = async (
  id,
  payload
) => {
  const response = await api.put(
    `/notifications/update/${id}`,
    payload
  );

  return response.data;
};

/* =========================================================
   MARK SINGLE AS READ
========================================================= */

export const markNotificationAsRead =
  async (id) => {
    const response = await api.put(
      `/notifications/read/${id}`
    );

    return response.data;
  };

/* =========================================================
   MARK ALL AS READ
========================================================= */

export const markAllNotificationsAsRead =
  async () => {
    const response = await api.put(
      "/notifications/read-all"
    );

    return response.data;
  };

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

export const deleteNotification = async (
  id
) => {
  const response = await api.delete(
    `/notifications/delete/${id}`
  );

  return response.data;
};

/* =========================================================
   BACKWARD COMPATIBILITY
========================================================= */

export const getNotifications =
  getMyNotifications;