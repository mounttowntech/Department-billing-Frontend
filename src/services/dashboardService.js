import api from "../api/axios";

/* ============================================================
   GET DASHBOARD OVERVIEW
============================================================ */

export const getDashboardOverview = async () => {
  return api.get("/dashboard/overview");
};