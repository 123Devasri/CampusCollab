import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("campuscollab_token") || "");
  const [loading, setLoading] = useState(true);

  // Check and restore user session on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem("campuscollab_token");
      if (storedToken) {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data);
        } catch (error) {
          console.error("Session restore failed:", error);
          localStorage.removeItem("campuscollab_token");
          localStorage.removeItem("campuscollab_user");
          setToken("");
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem("campuscollab_token", newToken);
    localStorage.setItem("campuscollab_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // Register handler
  const register = async (formData) => {
    const res = await API.post("/auth/register", formData);
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem("campuscollab_token", newToken);
    localStorage.setItem("campuscollab_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("campuscollab_token");
    localStorage.removeItem("campuscollab_user");
    setToken("");
    setUser(null);
  };

  // Refresh current user data from server
  const refreshUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
