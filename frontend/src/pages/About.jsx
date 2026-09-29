import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import './About.css';

export default function About() {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();

  const about = i18n.language === 'ar' ? settings?.aboutText_ar : settings?.aboutText_en;

  return (
    <div className="container about-page">
      <h1 className="section-title">{t('about.title')}</h1>
      <p className="about-text">{about}</p>

      <h2 className="section-title" style={{ marginTop: 40 }}>
        {t('about.policyTitle')}
      </h2>
      <div className="policy-grid">
        <div className="card policy-card">
          <h4>🔁 استبدال خلال 7 أيام</h4>
          <p className="text-muted">يمكنك استبدال أي منتج خلال 7 أيام من الاستلام في حال وجود عيب مصنعي.</p>
        </div>
        <div className="card policy-card">
          <h4>🛡️ ضمان شامل</h4>
          <p className="text-muted">جميع منتجاتنا مغطاة بضمان رسمي يمتد حتى سنة كاملة حسب المنتج.</p>
        </div>
        <div className="card policy-card">
          <h4>✅ فحص قبل الشحن</h4>
          <p className="text-muted">كل جهاز يخضع لفحص شامل قبل تسليمه لضمان جودته.</p>
        </div>
      </div>

      {settings?.branches?.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 40 }}>
            {t('about.branches')}
          </h2>
          <div className="grid grid-3">
            {settings.branches.map((b) => (
              <div key={b._id} className="card branch-card">
                <h4>{b.name}</h4>
                <p className="text-muted">{b.address}</p>
                {b.phone && <p>{b.phone}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
