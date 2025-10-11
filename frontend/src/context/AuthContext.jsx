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
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    console.log('[AuthProvider] Mounted');
    return () => {
      console.log('[AuthProvider] Unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('[AuthProvider] User state changed:', user);
  }, [user]);

  const login = (userData) => {
    console.log('[AuthProvider] login called with:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('[AuthProvider] logout called');
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;
  console.log('[AuthProvider] isAuthenticated:', isAuthenticated);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
