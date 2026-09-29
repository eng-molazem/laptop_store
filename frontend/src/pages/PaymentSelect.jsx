import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPaymentMethods, submitPaymentRequest } from '../api/public';
import { fileUrl } from '../api/client';
import { useSettings } from '../context/SettingsContext';
import './PaymentSelect.css';

export default function PaymentSelect() {
  const { orderId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [note, setNote] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderPhone, setOrderPhone] = useState('');

  useEffect(() => {
    getPaymentMethods().then((list) => {
      setMethods(list);
      if (list.length) setSelectedMethod(list[0]._id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedMethod || !amount) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('paymentMethod', selectedMethod);
      formData.append('note', note);
      if (proofImage) formData.append('proofImage', proofImage);
      await submitPaymentRequest(orderId, formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container payment-success">
        <div className="card payment-success-card">
          <h2>✓ {t('payment.submitted')}</h2>
          <p className="text-muted">{t('payment.reviewEstimate', { hours: settings?.reviewSlaHours || 24 })}</p>
          <p>{t('order.orderNumber')}: <strong>{orderId}</strong></p>
          <div className="form-group" style={{ maxWidth: 320, margin: '20px auto' }}>
            <label className="label">{t('order.enterPhone')}</label>
            <input className="input" value={orderPhone} onChange={(e) => setOrderPhone(e.target.value)} />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/track-order?orderId=${orderId}&phone=${encodeURIComponent(orderPhone)}`)}
          >
            {t('order.trackTitle')}
          </button>
          {settings?.socialLinks?.whatsapp && (
            <p style={{ marginTop: 16 }}>
              <a href={`https://wa.me/${settings.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                {t('payment.needHelp')}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container payment-select-page">
      <h1 className="section-title">{t('payment.title')}</h1>
      <p className="text-muted">{t('payment.instructions')}</p>
      <p className="text-muted">⏱ {t('payment.reviewEstimate', { hours: settings?.reviewSlaHours || 24 })}</p>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-methods-grid">
          {methods.map((m) => (
            <label key={m._id} className={`payment-method-card card ${selectedMethod === m._id ? 'selected' : ''}`}>
              <input type="radio" name="method" checked={selectedMethod === m._id} onChange={() => setSelectedMethod(m._id)} />
              <h4>{m.name}</h4>
              {m.qrImageUrl && (
                <div>
                  <p className="text-muted">{t('payment.scanQr')}</p>
                  <img src={fileUrl(m.qrImageUrl)} alt="QR" className="payment-qr" />
                </div>
              )}
              {m.accountDetailsText && <p className="payment-account-details">{m.accountDetailsText}</p>}
              {m.transferLink && (
                <a href={m.transferLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  {t('common.viewDetails')}
                </a>
              )}
            </label>
          ))}
        </div>

        <div className="card payment-details-form">
          <div className="form-group">
            <label className="label">{t('checkout.amountDue')}</label>
            <input className="input" type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">{t('payment.proofImage')}</label>
            <input className="input" type="file" accept="image/*" onChange={(e) => setProofImage(e.target.files[0])} />
          </div>
          <div className="form-group">
            <label className="label">{t('payment.note')}</label>
            <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={submitting}>
            {t('payment.submitRequest')}
          </button>
        </div>
      </form>
    </div>
  );
}
