import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('kci_user');
      return u ? JSON.parse(u) : null;
    } catch {
      localStorage.removeItem('kci_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync token state on initial mount if refresh token exists
  useEffect(() => {
    const token = localStorage.getItem('kci_token');
    const refreshToken = localStorage.getItem('kci_refresh_token');
    if (!token && refreshToken) {
      api.post('/auth/refresh-token', { refreshToken })
        .then(({ data }) => {
          if (data.accessToken) {
            localStorage.setItem('kci_token', data.accessToken);
            if (data.refreshToken) localStorage.setItem('kci_refresh_token', data.refreshToken);
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('kci_user', JSON.stringify(data.user));
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('kci_token');
          localStorage.removeItem('kci_refresh_token');
          localStorage.removeItem('kci_user');
          setUser(null);
        });
    }
  }, []);

  const login = async (email, password, role) => {
    for (let i = 0; i < 3; i++) {
      try {
        const { data } = await api.post('/auth/login', { email, password, role });
        const accessToken = data.accessToken || data.token;
        localStorage.setItem('kci_token', accessToken);
        if (data.refreshToken) {
          localStorage.setItem('kci_refresh_token', data.refreshToken);
        }
        localStorage.setItem('kci_user', JSON.stringify(data.user));
        setUser(data.user);

        if (data.suspiciousLogin) {
          toast('Security Alert: Login from a new device or network detected.', {
            icon: '🛡️',
            duration: 5000,
          });
        }

        return data.user;
      } catch (err) {
        const status = err.response?.status;
        // Only retry on gateway errors (502/503/504), not on auth errors (400, 401, 423)
        if (err.response && status !== 502 && status !== 503 && status !== 504) throw err;
        if (i < 2) await new Promise(r => setTimeout(r, 2500));
      }
    }
    throw new Error('Server not responding. Please try again.');
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const accessToken = data.accessToken || data.token;
    localStorage.setItem('kci_token', accessToken);
    if (data.refreshToken) {
      localStorage.setItem('kci_refresh_token', data.refreshToken);
    }
    localStorage.setItem('kci_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('kci_refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (_) {
      // quiet fallback
    } finally {
      localStorage.removeItem('kci_token');
      localStorage.removeItem('kci_refresh_token');
      localStorage.removeItem('kci_user');
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
      toast.success('Logged out from all devices');
    } catch (_) {
      // quiet
    } finally {
      localStorage.removeItem('kci_token');
      localStorage.removeItem('kci_refresh_token');
      localStorage.removeItem('kci_user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('kci_user', JSON.stringify(data.user));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, logoutAll, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
