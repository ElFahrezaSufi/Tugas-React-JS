import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

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
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
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
    try {
      // Ambil daftar users dari localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Cari user berdasarkan email dan password
      const foundUser = users.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        // Hapus password dari object user untuk keamanan
        const { password: _, ...userWithoutPassword } = foundUser;
        
        // Set user ke state
        setUser(userWithoutPassword);
        
        // Simpan user ke localStorage
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        return { 
          success: true, 
          message: 'Login berhasil!',
          user: userWithoutPassword 
        };
      }

      return { 
        success: false, 
        message: 'Email atau password salah!' 
      };
    } catch (error) {
      console.error('Error during login:', error);
      return { 
        success: false, 
        message: 'Terjadi kesalahan saat login' 
      };
    }
  };

  /**
   * Fungsi untuk register user baru
   * @param {Object} userData - Data user baru
   * @returns {Object} - { success: boolean, message: string }
   */
  const register = (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Cek apakah email sudah terdaftar
      if (users.find(u => u.email === userData.email)) {
        return { 
          success: false, 
          message: 'Email sudah terdaftar!' 
        };
      }

      // Buat user baru
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: userData.role || 'user', // default role adalah 'user'
        createdAt: new Date().toISOString(),
      };

      // Tambahkan user baru ke array
      users.push(newUser);
      
      // Simpan kembali ke localStorage
      localStorage.setItem('users', JSON.stringify(users));

      return { 
        success: true, 
        message: 'Registrasi berhasil! Silakan login.' 
      };
    } catch (error) {
      console.error('Error during registration:', error);
      return { 
        success: false, 
        message: 'Terjadi kesalahan saat registrasi' 
      };
    }
  };

  /**
   * Fungsi untuk logout user
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  /**
   * Fungsi untuk update profile user
   * @param {Object} updatedData - Data user yang diupdate
   */
  const updateProfile = (updatedData) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, ...updatedData } : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      const { password: _, ...userWithoutPassword } = { ...user, ...updatedData };
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return { success: true, message: 'Profile berhasil diupdate' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Gagal update profile' };
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
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
