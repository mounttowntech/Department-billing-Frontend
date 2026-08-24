import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        const parsed = JSON.parse(savedUser);
        // Prevent loading bad/null data objects
        if (parsed && parsed.success && parsed.data === null) return null;
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (userData, userToken) => {
    // Block bad null user objects completely
    let cleanUser = userData?.user || userData?.data?.user || userData;
    if (!cleanUser || cleanUser.success === true && cleanUser.data === null) {
      cleanUser = { firstName: "Administrator", email: "admin@billingpro.com" };
    }

    setUser(cleanUser);
    setToken(userToken);
    
    localStorage.setItem("user", JSON.stringify(cleanUser));
    localStorage.setItem("token", userToken);
    
    axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUser = (updatedData, newToken = null) => {
    setUser((prev) => {
      const mergedUser = { ...prev, ...updatedData };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      return mergedUser;
    });

    if (newToken) {
      setToken(newToken);
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);