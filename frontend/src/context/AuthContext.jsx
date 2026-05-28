/**
 * Global auth state — user, JWT token, persisted in localStorage.
 * Refreshes profile from GET /auth/me when a token is present.
 */
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

  // On load / token change — sync user from server (picks up profile image updates)
  useEffect(() => {
    if (!token) return;

    authApi
      .getProfile()
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      });
  }, [token]);

  const loginUser = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  const signupUser = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
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
      value={{
        user,
        token,
        isLoggedIn: !!token,
        loginUser,
        signupUser,
        updateUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
