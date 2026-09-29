import { createContext, useContext, useEffect, useState } from 'react';
import { adminLogin, adminMe } from '../api/admin';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }
    adminMe()
      .then((res) => setAdmin(res.admin))
      .catch(() => localStorage.removeItem('adminToken'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await adminLogin(email, password);
    localStorage.setItem('adminToken', res.token);
    setAdmin(res.admin);
    return res.admin;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const can = (permission) => {
    if (!admin) return false;
    if (admin.role === 'owner') return true;
    return Boolean(admin.permissions?.[permission]);
  };

  return <AdminAuthContext.Provider value={{ admin, loading, login, logout, can }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
