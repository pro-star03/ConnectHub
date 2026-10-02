import { createContext, useState, useEffect } from 'react';
import { login, register } from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    const { data } = await login({ email, password });
    localStorage.setItem('token', data.token);
    const userData = { 
      _id: data._id, 
      name: data.name, 
      username: data.username, 
      email: data.email, 
      role: data.role,
      isAdmin: data.isAdmin,
      notificationSettings: data.notificationSettings,
      themePreference: data.themePreference
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const registerUser = async (userData) => {
    const { data } = await register(userData);
    localStorage.setItem('token', data.token);
    const newUser = { 
      _id: data._id, 
      name: data.name, 
      username: data.username, 
      email: data.email,
      role: data.role,
      notificationSettings: data.notificationSettings,
      themePreference: data.themePreference
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return data;
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    document.documentElement.removeAttribute('data-theme');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    if (user?.themePreference) {
      if (user.themePreference === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', user.themePreference);
      }
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, [user?.themePreference]);

  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    if (user && user._id) {
      import('../services/userService').then(({ getUserProfile }) => {
        getUserProfile(user._id)
          .then(res => {
            setFollowingIds(new Set((res.data.following || []).map(f => typeof f === 'object' ? f._id : f)));
          })
          .catch(console.error);
      });
    } else {
      setFollowingIds(new Set());
    }
  }, [user?._id]);

  const addFollowing = (id) => {
    setFollowingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const removeFollowing = (id) => {
    setFollowingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, registerUser, logoutUser, updateUser, loading, followingIds, addFollowing, removeFollowing }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
