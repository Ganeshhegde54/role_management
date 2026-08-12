import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Derive roles and permissions lists
  const roles = user?.roles ? user.roles.map(r => r.name) : [];
  const permissions = user?.permissions ? Array.from(user.permissions) : [];
  const isAuthenticated = !!token && !!user;

  // Check if token exists on mount and fetch latest profile
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ username, password });
      const { token: jwtToken, user: userData } = response;

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    return await authApi.register(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roleName) => {
    if (!roles || roles.length === 0) return false;
    const formattedRole = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    return roles.includes(formattedRole) || roles.includes('ROLE_ADMIN');
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    // ADMIN has all permissions
    if (roles.includes('ROLE_ADMIN')) return true;
    return permissions.includes(permissionName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        roles,
        permissions,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        hasRole,
        hasPermission,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
