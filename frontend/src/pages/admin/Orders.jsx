import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminOrders, updateOrderStatus, exportOrdersCsv } from '../../api/admin';

const STATUSES = ['awaiting_payment', 'payment_review', 'paid', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled'];
const ADVANCEABLE = { paid: 'processing', processing: 'shipped', shipped: 'delivered' };

export default function AdminOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminOrders({ status: status || undefined }).then((r) => setOrders(r.items)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const handleAdvance = async (order) => {
    const next = ADVANCEABLE[order.status];
    if (!next) return;
    await updateOrderStatus(order._id, next);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="section-title">{t('admin.orders')}</h1>
        <button className="btn btn-outline" onClick={exportOrdersCsv}>⬇ {t('admin.exportCsv')}</button>
      </div>

      <div className="admin-filter-tabs">
        <button className={`chip ${!status ? 'active' : ''}`} onClick={() => setStatus('')}>الكل</button>
        {STATUSES.map((s) => (
          <button key={s} className={`chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
            {t(`order.status.${s}`)}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>رقم الطلب</th><th>الاسم</th><th>الهاتف</th><th>النوع</th><th>الإجمالي</th><th>الحالة</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontSize: '0.75rem' }}>{o._id}</td>
                  <td>{o.buyerName}</td>
                  <td>{o.buyerPhone}</td>
                  <td>{o.type === 'reservation' ? 'حجز' : 'شراء'}</td>
                  <td>{o.total.toLocaleString()}</td>
                  <td><span className={`status-pill ${o.status}`}>{t(`order.status.${o.status}`)}</span></td>
                  <td>
                    {ADVANCEABLE[o.status] && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleAdvance(o)}>
                        → {t(`order.status.${ADVANCEABLE[o.status]}`)}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
