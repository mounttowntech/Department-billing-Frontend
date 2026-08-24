import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API BASE URL:", import.meta.env.VITE_API_URL);

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (
      token &&
      token !== "undefined" &&
      token !== "null"
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData request
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;
    const token = localStorage.getItem("token");

    // --------------------------------
    // Only redirect to login when
    // an existing token is invalid/expired
    // --------------------------------
    if (
      status === 401 &&
      token &&
      token !== "undefined" &&
      token !== "null"
    ) {
      console.warn(
        "Authentication expired. Logging out..."
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Avoid unnecessary redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;