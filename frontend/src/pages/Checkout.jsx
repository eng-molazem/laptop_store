import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useGuestId } from '../context/GuestIdContext';
import { useSettings } from '../context/SettingsContext';
import { createOrder, validateCoupon } from '../api/public';
import './Checkout.css';

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, subtotal, clearCart } = useCart();
  const guestId = useGuestId();
  const { settings } = useSettings();

  const [form, setForm] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    city: '',
    address: '',
    type: searchParams.get('type') === 'reservation' ? 'reservation' : 'purchase',
  });
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const shippingRate = settings?.shippingRates?.find((r) => r.city === form.city);
  const shippingCost = shippingRate?.cost || 0;
  const discountAmount = coupon?.discountAmount || 0;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);
  const reservationPercent = settings?.reservationPercentDefault || 20;
  const amountDue = form.type === 'reservation' ? Math.round((total * reservationPercent) / 100) : total;

  const cities = useMemo(() => settings?.shippingRates?.map((r) => r.city) || [], [settings]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    try {
      const res = await validateCoupon(couponCode, subtotal);
      setCoupon(res);
    } catch (err) {
      setCoupon(null);
      setCouponError(err.response?.data?.message || t('common.error'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.buyerName || !form.buyerPhone || !form.city || !form.address) return;
    setSubmitting(true);
    try {
      const order = await createOrder({
        items: items.map((i) => ({ product: i.product._id, qty: i.qty })),
        ...form,
        couponCode: coupon?.code,
        guestId,
      });
      clearCart();
      navigate(`/payment/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <div className="container empty-state">{t('cart.empty')}</div>;
  }

  return (
    <div className="container checkout-page">
      <h1 className="section-title">{t('checkout.title')}</h1>
      <form className="checkout-layout" onSubmit={handleSubmit}>
        <div className="checkout-form card">
          <h3>{t('checkout.buyerInfo')}</h3>

          <div className="form-group">
            <label className="label">{t('checkout.fullName')}</label>
            <input className="input" required value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">{t('checkout.phone')}</label>
            <input className="input" required value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">{t('checkout.email')}</label>
            <input className="input" type="email" value={form.buyerEmail} onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">{t('checkout.city')}</label>
            <select className="select" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
              <option value="">{t('checkout.selectCity')}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">{t('checkout.address')}</label>
            <textarea className="textarea" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="label">{t('checkout.orderType')}</label>
            <div className="order-type-options">
              <label className="chip-radio">
                <input type="radio" checked={form.type === 'purchase'} onChange={() => setForm({ ...form, type: 'purchase' })} />
                {t('checkout.purchase')}
              </label>
              <label className="chip-radio">
                <input type="radio" checked={form.type === 'reservation'} onChange={() => setForm({ ...form, type: 'reservation' })} />
                {t('checkout.reservation')} ({reservationPercent}%)
              </label>
            </div>
          </div>
        </div>

        <div className="checkout-summary card">
          <div className="form-group">
            <label className="label">{t('cart.couponCode')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button type="button" className="btn btn-ghost" onClick={handleApplyCoupon}>
                {t('cart.applyCoupon')}
              </button>
            </div>
            {couponError && <p className="text-muted" style={{ color: 'var(--color-danger)' }}>{couponError}</p>}
            {coupon && <p className="text-muted" style={{ color: 'var(--color-success)' }}>✓ {coupon.code}</p>}
          </div>

          <div className="summary-row"><span>{t('cart.subtotal')}</span><span>{subtotal.toLocaleString()} {t('common.currency')}</span></div>
          <div className="summary-row"><span>{t('checkout.shippingCost')}</span><span>{shippingCost.toLocaleString()} {t('common.currency')}</span></div>
          {discountAmount > 0 && (
            <div className="summary-row"><span>{t('checkout.discount')}</span><span>-{discountAmount.toLocaleString()} {t('common.currency')}</span></div>
          )}
          <div className="summary-row total"><span>{t('checkout.total')}</span><span>{total.toLocaleString()} {t('common.currency')}</span></div>
          {form.type === 'reservation' && (
            <div className="summary-row amount-due"><span>{t('checkout.amountDue')}</span><span>{amountDue.toLocaleString()} {t('common.currency')}</span></div>
          )}

          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={submitting}>
            {t('checkout.placeOrder')}
          </button>
        </div>
      </form>
    </div>
  );
}
