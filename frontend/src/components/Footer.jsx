import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { subscribeNewsletter } from '../api/public';
import './Footer.css';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const storeName = i18n.language === 'ar' ? settings?.storeName : settings?.storeNameEn;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter(email);
      setSent(true);
      setEmail('');
    } catch {
      /* ignore */
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3 className="footer-logo">{storeName}</h3>
          <p className="text-muted">{t('footer.about')}</p>
          <div className="footer-social">
            {settings?.socialLinks?.facebook && (
              <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            )}
            {settings?.socialLinks?.instagram && (
              <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
          </div>
        </div>

        <div>
          <h4>{t('footer.quickLinks')}</h4>
          <ul className="footer-links">
            <li><Link to="/products">{t('nav.laptops')}</Link></li>
            <li><Link to="/offers">{t('nav.offers')}</Link></li>
            <li><Link to="/about">{t('nav.about')}</Link></li>
            <li><Link to="/contact">{t('nav.contact')}</Link></li>
            <li><Link to="/track-order">{t('nav.trackOrder')}</Link></li>
          </ul>
        </div>

        <div>
          <h4>{t('footer.contactUs')}</h4>
          <ul className="footer-links">
            {settings?.contactPhone && <li>{settings.contactPhone}</li>}
            {settings?.contactEmail && <li>{settings.contactEmail}</li>}
          </ul>
        </div>

        <div>
          <h4>{t('home.newsletterTitle')}</h4>
          {sent ? (
            <p className="text-muted">✓ {t('common.success')}</p>
          ) : (
            <form className="footer-newsletter" onSubmit={handleSubscribe}>
              <input
                className="input"
                type="email"
                placeholder={t('home.newsletterPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="btn btn-accent" type="submit">
                {t('home.subscribe')}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} {storeName} — {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
