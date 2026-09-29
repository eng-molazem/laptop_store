import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/admin';

const emptyForm = { code: '', type: 'percent', value: '', minOrder: 0, maxUses: '', expiresAt: '' };

export default function AdminCoupons() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = () => getAdminCoupons().then(setCoupons);
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, maxUses: form.maxUses || null, expiresAt: form.expiresAt || null };
    if (editingId) await updateCoupon(editingId, payload);
    else await createCoupon(payload);
    resetForm();
    load();
  };

  const toggleActive = async (c) => {
    await updateCoupon(c._id, { isActive: !c.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    await deleteCoupon(id);
    load();
  };

  return (
    <div>
      <h1 className="section-title">{t('admin.coupons')}</h1>

      <form className="card" style={{ padding: 20, margin: '20px 0' }} onSubmit={handleSubmit}>
        <div className="grid grid-4">
          <div className="form-group">
            <label className="label">الكود</label>
            <input className="input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">النوع</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="percent">نسبة %</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">القيمة</label>
            <input className="input" type="number" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">حد أدنى للطلب</label>
            <input className="input" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="label">أقصى عدد استخدام (اختياري)</label>
            <input className="input" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">تاريخ الانتهاء (اختياري)</label>
            <input className="input" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" type="submit">{editingId ? t('common.save') : t('common.add')}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>{t('common.cancel')}</button>}
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>الاستخدام</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td><strong>{c.code}</strong></td>
                <td>{c.type === 'percent' ? '%' : 'ل.س'}</td>
                <td>{c.value}</td>
                <td>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                <td>
                  <button className={`status-pill ${c.isActive ? 'approved' : 'rejected'}`} onClick={() => toggleActive(c)} style={{ cursor: 'pointer', border: 'none' }}>
                    {c.isActive ? 'مفعّل' : 'موقوف'}
                  </button>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
