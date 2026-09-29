import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAdminCategories, getCategoryAttributes, createCategoryAttribute, updateCategoryAttribute, deleteCategoryAttribute } from '../../api/admin';
import TagListEditor from '../../components/admin/TagListEditor';
import { getSpecIcon } from '../../utils/specIcons';

const ICON_OPTIONS = ['info', 'cpu', 'ram', 'storage', 'screen', 'gpu', 'battery', 'wifi', 'ruler', 'weight', 'os', 'camera'];

const emptyNewAttr = { key: '', label_ar: '', label_en: '', icon: 'info' };

export default function AdminCategoryAttributes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [attrs, setAttrs] = useState([]);
  const [newAttr, setNewAttr] = useState(emptyNewAttr);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAdminCategories().then((cats) => {
      setCategories(cats);
      if (!categoryId && cats.length) setCategoryId(cats[0]._id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAttrs = (catId) => {
    if (!catId) return;
    getCategoryAttributes(catId).then(setAttrs);
  };

  useEffect(() => {
    loadAttrs(categoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleCategorySelect = (id) => {
    setCategoryId(id);
    setSearchParams({ category: id });
  };

  const handleAddAttr = async (e) => {
    e.preventDefault();
    if (!newAttr.key || !newAttr.label_ar || !newAttr.label_en) return;
    await createCategoryAttribute({ ...newAttr, category: categoryId });
    setNewAttr(emptyNewAttr);
    loadAttrs(categoryId);
  };

  const handleUpdateValues = async (attr, values) => {
    await updateCategoryAttribute(attr._id, { values });
    loadAttrs(categoryId);
  };

  const handleDelete = async (attrId) => {
    if (!window.confirm('حذف هذه الخاصية نهائياً؟')) return;
    await deleteCategoryAttribute(attrId);
    loadAttrs(categoryId);
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="section-title">خصائص الفئات</h1>
      </div>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        كل فئة (لابتوبات، بطاريات، كاميرات...) لها خصائصها الخاصة (المعالج للابتوبات، السعة للبطاريات...). اختر فئة
        لإدارة خصائصها وقيمها.
      </p>

      <div className="form-group" style={{ maxWidth: 300 }}>
        <label className="label">الفئة</label>
        <select className="select" value={categoryId} onChange={(e) => handleCategorySelect(e.target.value)}>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name_ar}</option>
          ))}
        </select>
      </div>

      {saved && <p style={{ color: 'var(--color-success)' }}>✓ تم الحفظ</p>}

      {attrs.map((attr) => (
        <div key={attr._id} className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h4>
              {getSpecIcon(attr.icon)} {attr.label_ar} <span className="text-muted">({attr.label_en})</span>
            </h4>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(attr._id)}>
              حذف الخاصية
            </button>
          </div>
          <TagListEditor
            label="القيم المتاحة"
            items={attr.values}
            onChange={(values) => handleUpdateValues(attr, values).then(flashSaved)}
          />
        </div>
      ))}

      <form className="card" style={{ padding: 20 }} onSubmit={handleAddAttr}>
        <h4 style={{ marginBottom: 14 }}>+ إضافة خاصية جديدة لهذه الفئة</h4>
        <div className="grid grid-4">
          <div className="form-group">
            <label className="label">المفتاح (بالإنكليزية، بدون مسافات)</label>
            <input
              className="input"
              placeholder="cpu, capacity..."
              value={newAttr.key}
              onChange={(e) => setNewAttr({ ...newAttr, key: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">التسمية (عربي)</label>
            <input className="input" value={newAttr.label_ar} onChange={(e) => setNewAttr({ ...newAttr, label_ar: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="label">Label (English)</label>
            <input className="input" value={newAttr.label_en} onChange={(e) => setNewAttr({ ...newAttr, label_en: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="label">الأيقونة</label>
            <select className="select" value={newAttr.icon} onChange={(e) => setNewAttr({ ...newAttr, icon: e.target.value })}>
              {ICON_OPTIONS.map((i) => (
                <option key={i} value={i}>{getSpecIcon(i)} {i}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" type="submit">+ إضافة الخاصية</button>
      </form>
    </div>
  );
}
