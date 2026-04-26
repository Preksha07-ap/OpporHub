import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../api/authService';
import { getMyRegistrations } from '../api/registrationService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize user state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    } else {
      setRegistrations([]);
    }
  }, [user]);

  const fetchUserRegistrations = async () => {
    try {
      const data = await getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    role: user?.role || null,
    registrations,
    fetchUserRegistrations,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
