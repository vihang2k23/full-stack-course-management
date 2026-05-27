import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const loginUser = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  const signupUser = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  const logoutUser = async () => {
    try {
      if (token) await authApi.logout();
    } catch {
      // clear local session even if API fails
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoggedIn: !!token, loginUser, signupUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
