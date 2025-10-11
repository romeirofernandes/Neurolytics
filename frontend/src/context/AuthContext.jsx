import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check localStorage on initialization
    const stored = localStorage.getItem('user');
    console.log('[AuthProvider] Initial user from localStorage:', stored);
    console.log('[AuthProvider] Parsed user data:', stored ? JSON.parse(stored) : null);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    console.log('[AuthProvider] Mounted');
    console.log('[AuthProvider] Current user on mount:', user);
    return () => {
      console.log('[AuthProvider] Unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('[AuthProvider] User state changed:', user);
    if (user) {
      console.log('[AuthProvider] User ID:', user._id);
      console.log('[AuthProvider] User name:', user.name);
      console.log('[AuthProvider] User email:', user.email);
    }
  }, [user]);

  const login = (userData) => {
    console.log('[AuthProvider] login called with:', userData);
    console.log('[AuthProvider] User ID from login:', userData._id);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('[AuthProvider] User saved to localStorage');
  };

  const logout = () => {
    console.log('[AuthProvider] logout called');
    console.log('[AuthProvider] Clearing user data');
    setUser(null);
    localStorage.removeItem('user');
    console.log('[AuthProvider] User removed from localStorage');
  };

  const isAuthenticated = !!user;
  console.log('[AuthProvider] isAuthenticated:', isAuthenticated);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
