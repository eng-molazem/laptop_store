import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../api/admin';

const ICONS = ['laptop', 'desktop', 'mouse', 'camera', 'hdd', 'battery'];

export default function AdminCategories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name_ar: '', name_en: '', icon: 'laptop' });
  const [editingId, setEditingId] = useState(null);

  const load = () => getAdminCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name_ar: '', name_en: '', icon: 'laptop' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) await updateCategory(editingId, form);
    else await createCategory(form);
    resetForm();
    load();
  };

  const handleEdit = (c) => {
    setForm({ name_ar: c.name_ar, name_en: c.name_en, icon: c.icon });
    setEditingId(c._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    await deleteCategory(id);
    load();
  };

  return (
    <div>
      <h1 className="section-title">{t('admin.categories')}</h1>

      <form className="card" style={{ padding: 20, margin: '20px 0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }} onSubmit={handleSubmit}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="label">عربي</label>
          <input className="input" required value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="label">English</label>
          <input className="input" required value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="label">أيقونة</label>
          <select className="select" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">{editingId ? t('common.save') : t('common.add')}</button>
        {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>{t('common.cancel')}</button>}
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>عربي</th><th>English</th><th>Slug</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c.name_ar}</td>
                <td>{c.name_en}</td>
                <td>{c.slug}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(c)}>{t('common.edit')}</button>
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
