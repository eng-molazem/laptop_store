import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './admin.css';

export default function AdminLogin() {
  const { t } = useTranslation();
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="card admin-login-card" onSubmit={handleSubmit}>
        <h2>{t('admin.login')}</h2>
        <div className="form-group">
          <label className="label">{t('admin.email')}</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">{t('admin.password')}</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {t('admin.login')}
        </button>
      </form>
    </div>
  );
}
