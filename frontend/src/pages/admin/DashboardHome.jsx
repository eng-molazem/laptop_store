import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStats } from '../../api/admin';

export default function DashboardHome() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return <div className="spinner" />;

  return (
    <div>
      <div className="admin-topbar">
        <h1 className="section-title">{t('admin.dashboard')}</h1>
      </div>

      <div className="admin-stats-grid">
        <div className="card admin-stat-card">
          <span className="stat-value">{stats.ordersToday}</span>
          <span className="stat-label">{t('admin.ordersToday')}</span>
        </div>
        <div className="card admin-stat-card">
          <span className="stat-value">{stats.totalSales.toLocaleString()}</span>
          <span className="stat-label">{t('admin.totalSales')} ({t('common.currency')})</span>
        </div>
        <div className="card admin-stat-card">
          <span className="stat-value">{stats.pendingPaymentRequests}</span>
          <span className="stat-label">{t('admin.pendingPayments')}</span>
        </div>
        <div className="card admin-stat-card">
          <span className="stat-value">{stats.lowStockProducts.length}</span>
          <span className="stat-label">{t('admin.lowStock')}</span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 14 }}>{t('admin.topProducts')}</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-muted">{t('common.noResults')}</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.topProducts.map((p) => (
                <li key={p._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.name}</span>
                  <strong>{p.qty}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 14 }}>{t('admin.lowStock')}</h3>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-muted">{t('common.noResults')}</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.lowStockProducts.map((p) => (
                <li key={p._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.name_ar}</span>
                  <span className="badge badge-lowstock">{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
