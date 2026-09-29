import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminSettings, updateAdminSettings } from '../../api/admin';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSettings() {
  const { t } = useTranslation();
  const { reload } = useSettings();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAdminSettings().then(setForm);
  }, []);

  if (!form) return <div className="spinner" />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setSocial = (key, value) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));

  const updateBranch = (i, key, value) => {
    setForm((f) => ({ ...f, branches: f.branches.map((b, idx) => (idx === i ? { ...b, [key]: value } : b)) }));
  };
  const addBranch = () => setForm((f) => ({ ...f, branches: [...f.branches, { name: '', address: '', phone: '' }] }));
  const removeBranch = (i) => setForm((f) => ({ ...f, branches: f.branches.filter((_, idx) => idx !== i) }));

  const updateRate = (i, key, value) => {
    setForm((f) => ({ ...f, shippingRates: f.shippingRates.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)) }));
  };
  const addRate = () => setForm((f) => ({ ...f, shippingRates: [...f.shippingRates, { city: '', cost: 0, etaDays: 2 }] }));
  const removeRate = (i) => setForm((f) => ({ ...f, shippingRates: f.shippingRates.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateAdminSettings(form);
    await reload();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-toolbar">
        <h1 className="section-title">{t('admin.settings')}</h1>
        <button className="btn btn-primary" type="submit">{t('common.save')}</button>
      </div>
      {saved && <p style={{ color: 'var(--color-success)' }}>✓ {t('common.success')}</p>}

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>معلومات المتجر</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="label">{t('admin.storeName')}</label>
            <input className="input" value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">{t('admin.storeNameEn')}</label>
            <input className="input" value={form.storeNameEn} onChange={(e) => set('storeNameEn', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="label">من نحن (عربي)</label>
          <textarea className="textarea" value={form.aboutText_ar} onChange={(e) => set('aboutText_ar', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">About (English)</label>
          <textarea className="textarea" value={form.aboutText_en} onChange={(e) => set('aboutText_en', e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>التواصل والسوشال ميديا</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="label">هاتف التواصل</label>
            <input className="input" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">بريد التواصل</label>
            <input className="input" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">رقم واتساب (بصيغة دولية بدون +)</label>
            <input className="input" value={form.socialLinks?.whatsapp || ''} onChange={(e) => setSocial('whatsapp', e.target.value)} placeholder="963999888777" />
          </div>
          <div className="form-group">
            <label className="label">Facebook</label>
            <input className="input" value={form.socialLinks?.facebook || ''} onChange={(e) => setSocial('facebook', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Instagram</label>
            <input className="input" value={form.socialLinks?.instagram || ''} onChange={(e) => setSocial('instagram', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>الدفع والحجز</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="label">مهلة مراجعة الدفع (ساعات)</label>
            <input className="input" type="number" value={form.reviewSlaHours} onChange={(e) => set('reviewSlaHours', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">نسبة الحجز الافتراضية (%)</label>
            <input className="input" type="number" value={form.reservationPercentDefault} onChange={(e) => set('reservationPercentDefault', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>أسعار الشحن حسب المدينة</h3>
        {form.shippingRates.map((r, i) => (
          <div key={i} className="grid grid-4" style={{ marginBottom: 8 }}>
            <input className="input" placeholder="المدينة" value={r.city} onChange={(e) => updateRate(i, 'city', e.target.value)} />
            <input className="input" type="number" placeholder="التكلفة" value={r.cost} onChange={(e) => updateRate(i, 'cost', e.target.value)} />
            <input className="input" type="number" placeholder="مدة التوصيل (أيام)" value={r.etaDays} onChange={(e) => updateRate(i, 'etaDays', e.target.value)} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRate(i)}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={addRate}>+ إضافة مدينة</button>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>الفروع</h3>
        {form.branches.map((b, i) => (
          <div key={i} className="grid grid-4" style={{ marginBottom: 8 }}>
            <input className="input" placeholder="اسم الفرع" value={b.name} onChange={(e) => updateBranch(i, 'name', e.target.value)} />
            <input className="input" placeholder="العنوان" value={b.address} onChange={(e) => updateBranch(i, 'address', e.target.value)} />
            <input className="input" placeholder="الهاتف" value={b.phone} onChange={(e) => updateBranch(i, 'phone', e.target.value)} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeBranch(i)}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={addBranch}>+ إضافة فرع</button>
      </div>
    </form>
  );
}
