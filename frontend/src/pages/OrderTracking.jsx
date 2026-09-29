import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackOrder } from '../api/public';
import { useSocket } from '../context/SocketContext';
import OrderTimeline from '../components/OrderTimeline';
import './OrderTracking.css';

export default function OrderTracking() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { socket } = useSocket();

  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (id, ph) => {
    setError('');
    setLoading(true);
    try {
      const res = await trackOrder(id, ph);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && phone) load(orderId, phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket || !result?.order?._id) return;
    socket.emit('joinOrder', result.order._id);
    const refresh = () => load(orderId, phone);
    socket.on('paymentRequest:approved', refresh);
    socket.on('paymentRequest:rejected', refresh);
    socket.on('order:statusChanged', refresh);
    return () => {
      socket.off('paymentRequest:approved', refresh);
      socket.off('paymentRequest:rejected', refresh);
      socket.off('order:statusChanged', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, result?.order?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ orderId, phone });
    load(orderId, phone);
  };

  const latestRejected = result?.paymentRequests?.find((pr) => pr.status === 'rejected');

  return (
    <div className="container order-tracking-page">
      <h1 className="section-title">{t('order.trackTitle')}</h1>

      <form className="track-form card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">{t('order.orderNumber')}</label>
          <input className="input" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="label">{t('order.enterPhone')}</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {t('order.track')}
        </button>
      </form>

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {result && (
        <div className="track-result card">
          <OrderTimeline status={result.order.status} />

          {result.order.status === 'rejected' && (
            <div className="rejected-box">
              <p><strong>{t('order.rejectedNote')}:</strong> {latestRejected?.rejectionReason || '-'}</p>
              <button className="btn btn-accent" onClick={() => navigate(`/payment/${result.order._id}`)}>
                {t('order.resubmit')}
              </button>
            </div>
          )}

          <div className="track-order-details">
            <div><span className="text-muted">{t('checkout.total')}</span><strong>{result.order.total.toLocaleString()} {t('common.currency')}</strong></div>
            <div><span className="text-muted">{t('checkout.amountDue')}</span><strong>{result.order.amountDue.toLocaleString()} {t('common.currency')}</strong></div>
            <div><span className="text-muted">{t('checkout.city')}</span><strong>{result.order.city}</strong></div>
          </div>

          <div className="track-items">
            {result.order.items.map((item) => (
              <div key={item.product} className="track-item">
                <span>{item.name} × {item.qty}</span>
                <span>{(item.price * item.qty).toLocaleString()} {t('common.currency')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
