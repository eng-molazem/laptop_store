import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fileUrl } from '../../api/client';
import { getCategoryAttributes } from '../../api/admin';
import { getSpecIcon } from '../../utils/specIcons';

export default function ProductFormModal({ product, categories, onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({
    name_ar: product?.name_ar || '',
    name_en: product?.name_en || '',
    category: product?.category?._id || categories[0]?._id || '',
    price: product?.price || '',
    discountPrice: product?.discountPrice || '',
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 3,
    description_ar: product?.description_ar || '',
    description_en: product?.description_en || '',
    isFeatured: product?.isFeatured || false,
    isWeeklyDeal: product?.isWeeklyDeal || false,
    dealEndsAt: product?.dealEndsAt ? product.dealEndsAt.slice(0, 16) : '',
    reservationAllowed: product?.reservationAllowed ?? true,
    reservationPercent: product?.reservationPercent || '',
  }));
  const [attributeValues, setAttributeValues] = useState(() => {
    const map = {};
    (product?.attributes || []).forEach((a) => {
      map[a.key] = a.value;
    });
    return map;
  });
  const [attributeDefs, setAttributeDefs] = useState([]);
  const [keepImages, setKeepImages] = useState(product?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!form.category) {
      setAttributeDefs([]);
      return;
    }
    getCategoryAttributes(form.category)
      .then(setAttributeDefs)
      .catch(() => setAttributeDefs([]));
  }, [form.category]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleCategoryChange = (value) => {
    set('category', value);
    setAttributeValues({}); // each category has its own attribute set, so old selections no longer apply
  };

  const setAttrValue = (key, value) => setAttributeValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const attributes = Object.entries(attributeValues)
      .filter(([, value]) => value)
      .map(([key, value]) => ({ key, value }));
    fd.append('attributes', JSON.stringify(attributes));
    fd.append('keepImages', JSON.stringify(keepImages));
    newImages.forEach((file) => fd.append('images', file));
    try {
      await onSave(fd, product?._id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{product ? t('common.edit') : t('common.add')}</h2>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="label">الاسم (عربي)</label>
            <input className="input" required value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Name (English)</label>
            <input className="input" required value={form.name_en} onChange={(e) => set('name_en', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="label">الفئة</label>
          <select className="select" value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name_ar}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-3">
          <div className="form-group">
            <label className="label">السعر</label>
            <input className="input" type="number" required value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">سعر الخصم</label>
            <input className="input" type="number" value={form.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">المخزون</label>
            <input className="input" type="number" required value={form.stock} onChange={(e) => set('stock', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="label">حد التنبيه للمخزون المنخفض</label>
          <input
            className="input"
            type="number"
            style={{ maxWidth: 200 }}
            value={form.lowStockThreshold}
            onChange={(e) => set('lowStockThreshold', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">خصائص هذه الفئة</label>
          {attributeDefs.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              لا توجد خصائص معرّفة لهذه الفئة بعد —{' '}
              <Link to={`/admin/category-attributes?category=${form.category}`}>أضِفها من هنا</Link>
            </p>
          ) : (
            <div className="grid grid-3">
              {attributeDefs.map((def) => (
                <div key={def.key} className="form-group" style={{ margin: 0 }}>
                  <label className="label">
                    {getSpecIcon(def.icon)} {def.label_ar}
                  </label>
                  {def.values.length > 0 ? (
                    <select className="select" value={attributeValues[def.key] || ''} onChange={(e) => setAttrValue(def.key, e.target.value)}>
                      <option value="">-</option>
                      {def.values.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.78rem' }}>
                      لا قيم بعد —{' '}
                      <Link to={`/admin/category-attributes?category=${form.category}`}>أضِف قيماً</Link>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 8 }}>
            لإضافة خاصية جديدة لهذه الفئة (مثل معالج، رام، سعة...):{' '}
            <Link to={`/admin/category-attributes?category=${form.category}`}>صفحة خصائص الفئات</Link>
          </p>
        </div>

        <div className="form-group">
          <label className="label">الوصف (عربي)</label>
          <textarea className="textarea" value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Description (English)</label>
          <textarea className="textarea" value={form.description_en} onChange={(e) => set('description_en', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label">الصور الحالية</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {keepImages.map((img) => (
              <div key={img} style={{ position: 'relative' }}>
                <img src={fileUrl(img)} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ position: 'absolute', top: -6, insetInlineEnd: -6, padding: '2px 6px' }}
                  onClick={() => setKeepImages((prev) => prev.filter((i) => i !== img))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="label">إضافة صور جديدة</label>
          <input className="input" type="file" accept="image/*" multiple onChange={(e) => setNewImages(Array.from(e.target.files))} />
        </div>

        <div className="grid grid-2">
          <label className="filter-checkbox">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> منتج مميز
          </label>
          <label className="filter-checkbox">
            <input type="checkbox" checked={form.isWeeklyDeal} onChange={(e) => set('isWeeklyDeal', e.target.checked)} /> عرض أسبوعي
          </label>
        </div>

        {form.isWeeklyDeal && (
          <div className="form-group">
            <label className="label">ينتهي العرض في</label>
            <input className="input" type="datetime-local" value={form.dealEndsAt} onChange={(e) => set('dealEndsAt', e.target.value)} />
          </div>
        )}

        <div className="grid grid-2">
          <label className="filter-checkbox">
            <input type="checkbox" checked={form.reservationAllowed} onChange={(e) => set('reservationAllowed', e.target.checked)} /> السماح بالحجز
          </label>
          {form.reservationAllowed && (
            <div className="form-group" style={{ margin: 0 }}>
              <input
                className="input"
                type="number"
                placeholder="نسبة الحجز % (اختياري، افتراضي عام)"
                value={form.reservationPercent}
                onChange={(e) => set('reservationPercent', e.target.value)}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{t('common.save')}</button>
        </div>
      </form>
    </div>
  );
}
