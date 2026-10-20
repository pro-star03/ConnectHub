import { createContext, useState, useEffect } from 'react';
import { login, register } from '../services/authService';
import { getUserProfile } from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [blockedUserIds, setBlockedUserIds] = useState(new Set());

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
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
      profilePicture: data.profilePicture || '',
      coverPhoto: data.coverPhoto || '',
      headline: data.headline || '',
      bio: data.bio || '',
      notificationSettings: data.notificationSettings,
      themePreference: data.themePreference || 'system'
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const registerUser = async (registrationData) => {
    const { data } = await register(registrationData);
    localStorage.setItem('token', data.token);
    const newUser = { 
      _id: data._id, 
      name: data.name, 
      username: data.username, 
      email: data.email,
      role: data.role,
      isAdmin: data.isAdmin,
      profilePicture: data.profilePicture || '',
      coverPhoto: data.coverPhoto || '',
      headline: data.headline || '',
      bio: data.bio || '',
      notificationSettings: data.notificationSettings,
      themePreference: data.themePreference || 'system'
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return data;
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setFollowingIds(new Set());
    setBlockedUserIds(new Set());
    document.documentElement.removeAttribute('data-theme');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  useEffect(() => {
    const pref = user?.themePreference || localStorage.getItem('theme') || 'system';
    if (pref === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', pref);
    }
  }, [user?.themePreference]);

  useEffect(() => {
    if (user?._id) {
      getUserProfile(user._id)
        .then(res => {
          const ids = (res.data.following || []).map(f => (typeof f === 'object' ? f._id : f).toString());
          setFollowingIds(new Set(ids));
          const blocked = (res.data.blockedUsers || []).map(b => (typeof b === 'object' ? b._id : b).toString());
          setBlockedUserIds(new Set(blocked));
        })
        .catch(console.error);
    } else {
      setFollowingIds(new Set());
      setBlockedUserIds(new Set());
    }
  }, [user?._id]);

  const addFollowing = (id) => {
    if (!id) return;
    setFollowingIds(prev => {
      const next = new Set(prev);
      next.add(id.toString());
      return next;
    });
  };

  const removeFollowing = (id) => {
    if (!id) return;
    setFollowingIds(prev => {
      const next = new Set(prev);
      next.delete(id.toString());
      return next;
    });
  };

  const addBlockedId = (id) => {
    if (!id) return;
    const strId = id.toString();
    setBlockedUserIds(prev => new Set(prev).add(strId));
    setFollowingIds(prev => {
      const next = new Set(prev);
      next.delete(strId);
      return next;
    });
  };

  const removeBlockedId = (id) => {
    if (!id) return;
    setBlockedUserIds(prev => {
      const next = new Set(prev);
      next.delete(id.toString());
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginUser,
      registerUser,
      logoutUser,
      updateUser,
      loading,
      followingIds,
      addFollowing,
      removeFollowing,
      blockedUserIds,
      addBlockedId,
      removeBlockedId
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
