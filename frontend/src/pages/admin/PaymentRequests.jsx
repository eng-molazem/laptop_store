import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminPaymentRequests, approvePaymentRequest, rejectPaymentRequest, exportPaymentRequestsCsv } from '../../api/admin';
import { fileUrl } from '../../api/client';

export default function AdminPaymentRequests() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminPaymentRequests({ status: status || undefined }).then((r) => setItems(r.items)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const handleApprove = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    await approvePaymentRequest(id);
    load();
  };

  const handleReject = async (id) => {
    const reason = window.prompt(t('admin.rejectionReason'));
    if (reason == null) return;
    await rejectPaymentRequest(id, reason);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="section-title">{t('admin.paymentRequests')}</h1>
        <button className="btn btn-outline" onClick={exportPaymentRequestsCsv}>⬇ {t('admin.exportCsv')}</button>
      </div>

      <div className="admin-filter-tabs">
        {[
          { value: 'pending', label: t('order.status.payment_review') },
          { value: 'approved', label: t('admin.approve') },
          { value: 'rejected', label: t('admin.reject') },
          { value: '', label: 'الكل' },
        ].map((s) => (
          <button key={s.value || 'all'} className={`chip ${status === s.value ? 'active' : ''}`} onClick={() => setStatus(s.value)}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>الاسم</th><th>الطريقة</th><th>المبلغ</th><th>إثبات</th><th>الحالة</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((pr) => (
                <tr key={pr._id}>
                  <td>{pr.buyerName}</td>
                  <td>{pr.paymentMethod?.name}</td>
                  <td>{pr.amount.toLocaleString()}</td>
                  <td>
                    {pr.proofImageUrl ? (
                      <a href={fileUrl(pr.proofImageUrl)} target="_blank" rel="noopener noreferrer">عرض</a>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`status-pill ${pr.status}`}>
                      {pr.status === 'pending' ? t('order.status.payment_review') : pr.status === 'approved' ? t('admin.approve') : t('admin.reject')}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {pr.status === 'pending' && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(pr._id)}>{t('admin.approve')}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(pr._id)}>{t('admin.reject')}</button>
                      </>
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
