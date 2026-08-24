import api from "../api/axios";

export const getNotifications = async () => {
  const response = await api.get("/notifications/all");
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/read/${id}`);
  return response.data;
};

export const markAllNotificationsAsRead = async (id) => {
  const response = await api.patch(`/notifications/read-all/${id}`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/delete/${id}`);
  return response.data;
};