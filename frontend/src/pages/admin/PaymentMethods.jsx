import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../../api/admin';
import { fileUrl } from '../../api/client';

const emptyForm = { name: '', transferLink: '', accountDetailsText: '', isActive: true };

export default function AdminPaymentMethods() {
  const { t } = useTranslation();
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [qrImage, setQrImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = () => getAdminPaymentMethods().then(setMethods);
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setQrImage(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (qrImage) fd.append('qrImage', qrImage);
    if (editingId) await updatePaymentMethod(editingId, fd);
    else await createPaymentMethod(fd);
    resetForm();
    load();
  };

  const handleEdit = (m) => {
    setForm({ name: m.name, transferLink: m.transferLink, accountDetailsText: m.accountDetailsText, isActive: m.isActive });
    setEditingId(m._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    await deletePaymentMethod(id);
    load();
  };

  return (
    <div>
      <h1 className="section-title">{t('admin.paymentMethods')}</h1>

      <form className="card" style={{ padding: 20, margin: '20px 0' }} onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="label">الاسم</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">رابط التحويل (اختياري)</label>
            <input className="input" value={form.transferLink} onChange={(e) => setForm({ ...form, transferLink: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="label">تفاصيل الحساب (نصي)</label>
          <textarea className="textarea" value={form.accountDetailsText} onChange={(e) => setForm({ ...form, accountDetailsText: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="label">صورة رمز QR (اختياري)</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setQrImage(e.target.files[0])} />
        </div>
        <label className="filter-checkbox">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> مفعّلة
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn btn-primary" type="submit">{editingId ? t('common.save') : t('common.add')}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>{t('common.cancel')}</button>}
        </div>
      </form>

      <div className="grid grid-3">
        {methods.map((m) => (
          <div key={m._id} className="card" style={{ padding: 18 }}>
            <h4>{m.name} {!m.isActive && <span className="badge badge-outline">غير مفعّلة</span>}</h4>
            {m.qrImageUrl && <img src={fileUrl(m.qrImageUrl)} alt="" style={{ width: 100, height: 100, objectFit: 'contain' }} />}
            <p className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line' }}>{m.accountDetailsText}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(m)}>{t('common.edit')}</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>{t('common.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
