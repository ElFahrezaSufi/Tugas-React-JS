import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { handleApiResponse, mapBackendResponse } from "../utils/apiHelpers";

const AuthContext = createContext(null);

/**
 * AuthProvider - Provider untuk mengelola authentication state secara global
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user dari localStorage saat aplikasi pertama kali dijalankan
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fungsi untuk login user
   * @param {string} email - Email user
   * @param {string} password - Password user
   * @returns {Object} - { success: boolean, message?: string, user?: Object }
   */
  const login = (email, password) => {
    // Call backend login endpoint
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    return fetch(baseURL + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const json = await handleApiResponse(res, logout);

        // json.data: { token, user }
        const { token, user: userObj } = json.data || {};

        // Map snake_case to camelCase
        const userMapped = mapBackendResponse(userObj);
        const userToStore = { ...userMapped, token };

        setUser(userToStore);
        localStorage.setItem("currentUser", JSON.stringify(userToStore));

        // Also ensure we keep a local copy of known users so components
        // that rely on `localStorage.users` (eg. RegistrationList) can
        // resolve user names/emails when showing participants.
        try {
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          const userNoSensitive = { ...userMapped };
          delete userNoSensitive.password;
          const idx = users.findIndex((u) => u.id === userNoSensitive.id);
          if (idx >= 0) {
            users[idx] = { ...users[idx], ...userNoSensitive };
          } else {
            users.push(userNoSensitive);
          }
          localStorage.setItem("users", JSON.stringify(users));
        } catch (err) {
          console.warn("Failed to persist user to localStorage.users", err);
        }
        return { success: true, message: "Login berhasil!", user: userToStore };
      })
      .catch((err) => {
        console.error("Login error:", err);
        return {
          success: false,
          message: err.message || "Terjadi kesalahan saat login",
        };
      });
  };

  /**
   * Fungsi untuk register user baru
   * @param {Object} userData - Data user baru
   * @returns {Object} - { success: boolean, message: string }
   */
  const register = (userData) => {
    // Call backend register endpoint
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    return fetch(baseURL + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then(async (res) => {
        const json = await handleApiResponse(res);
        return {
          success: true,
          message: "Registrasi berhasil! Silakan login.",
        };
      })
      .catch((err) => {
        console.error("Register error:", err);
        return {
          success: false,
          message: err.message || "Terjadi kesalahan saat registrasi",
        };
      });
  };

  /**
   * Fungsi untuk logout user
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  /**
   * Fungsi untuk update profile user
   * @param {Object} updatedData - Data user yang diupdate
   */
  const updateProfile = (updatedData) => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, ...updatedData } : u
      );

      localStorage.setItem("users", JSON.stringify(updatedUsers));

      const { password: _, ...userWithoutPassword } = {
        ...user,
        ...updatedData,
      };
      setUser(userWithoutPassword);
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

      return { success: true, message: "Profile berhasil diupdate" };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, message: "Gagal update profile" };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook untuk menggunakan AuthContext
 * @returns {Object} - AuthContext value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
