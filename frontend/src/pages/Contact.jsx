import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import './Contact.css';

export default function Contact() {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <div className="container contact-page">
      <h1 className="section-title">{t('contact.title')}</h1>
      <div className="contact-grid">
        {settings?.socialLinks?.whatsapp && (
          <a
            href={`https://wa.me/${settings.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card contact-item whatsapp"
          >
            <span className="contact-icon">💬</span>
            <div>
              <h4>{t('contact.whatsapp')}</h4>
              <p>{settings.socialLinks.whatsapp}</p>
            </div>
          </a>
        )}
        {settings?.contactPhone && (
          <a href={`tel:${settings.contactPhone}`} className="card contact-item">
            <span className="contact-icon">📞</span>
            <div>
              <h4>{t('contact.phone')}</h4>
              <p>{settings.contactPhone}</p>
            </div>
          </a>
        )}
        {settings?.contactEmail && (
          <a href={`mailto:${settings.contactEmail}`} className="card contact-item">
            <span className="contact-icon">✉️</span>
            <div>
              <h4>{t('contact.email')}</h4>
              <p>{settings.contactEmail}</p>
            </div>
          </a>
        )}
      </div>

      {settings?.branches?.length > 0 && (
        <div className="grid grid-3" style={{ marginTop: 32 }}>
          {settings.branches.map((b) => (
            <div key={b._id} className="card branch-card">
              <h4>{b.name}</h4>
              <p className="text-muted">{b.address}</p>
              {b.phone && <p>{b.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
