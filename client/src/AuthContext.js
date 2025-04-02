import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/check-login', {
          withCredentials: true,
        });
        if (response.data.isLoggedIn) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Handle errors (like no cookie found) silently
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
