import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import './admin.css';

const MENU = [
  { to: '/admin', end: true, icon: '📊', key: 'dashboard' },
  { to: '/admin/products', icon: '💻', key: 'products', permission: 'manageProducts' },
  { to: '/admin/categories', icon: '🗂️', key: 'categories', permission: 'manageProducts' },
  { to: '/admin/category-attributes', icon: '🧩', key: 'categoryAttributes', permission: 'manageProducts' },
  { to: '/admin/orders', icon: '📦', key: 'orders', permission: 'manageOrders' },
  { to: '/admin/payment-requests', icon: '💳', key: 'paymentRequests', permission: 'managePaymentRequests' },
  { to: '/admin/payment-methods', icon: '🏦', key: 'paymentMethods', permission: 'manageSettings' },
  { to: '/admin/coupons', icon: '🏷️', key: 'coupons', permission: 'manageCoupons' },
  { to: '/admin/reviews', icon: '⭐', key: 'reviews', permission: 'manageProducts' },
  { to: '/admin/settings', icon: '⚙️', key: 'settings', permission: 'manageSettings' },
  { to: '/admin/admins', icon: '👥', key: 'admins', ownerOnly: true },
  { to: '/admin/audit-log', icon: '📜', key: 'auditLog', ownerOnly: true },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { admin, can, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const visibleMenu = MENU.filter((m) => {
    if (m.ownerOnly) return admin?.role === 'owner';
    if (m.permission) return can(m.permission);
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">⚙️ {t('admin.dashboard')}</div>
        {visibleMenu.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span>{m.icon}</span> {t(`admin.${m.key}`)}
          </NavLink>
        ))}
        <div className="admin-sidebar-footer">
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 10 }}>{admin?.name}</p>
          <button className="btn btn-ghost btn-sm btn-block" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="btn btn-outline btn-sm btn-block" style={{ marginTop: 8 }} onClick={handleLogout}>
            {t('admin.logout')}
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
