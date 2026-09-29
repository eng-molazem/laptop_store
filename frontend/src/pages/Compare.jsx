import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProductsByIds, getCategoryAttributesBySlug } from '../api/public';
import { fileUrl } from '../api/client';
import { useCompare } from '../context/CompareContext';
import { getSpecIcon } from '../utils/specIcons';
import { getPlaceholderImage } from '../utils/placeholderImage';
import './Compare.css';

export default function Compare() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { removeCompare } = useCompare();
  const [products, setProducts] = useState([]);
  const [attributeDefs, setAttributeDefs] = useState([]);

  const ids = useMemo(() => (searchParams.get('ids') || '').split(',').filter(Boolean), [searchParams]);

  useEffect(() => {
    if (ids.length) getProductsByIds(ids).then(setProducts);
  }, [ids]);

  const categorySlug = products[0]?.category?.slug;
  useEffect(() => {
    if (categorySlug) getCategoryAttributesBySlug(categorySlug).then(setAttributeDefs);
  }, [categorySlug]);

  if (products.length < 2) {
    return <div className="container empty-state">{t('compare.empty')}</div>;
  }

  return (
    <div className="container compare-page">
      <h1 className="section-title">{t('compare.title')}</h1>
      <div className="table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>{t('compare.spec')}</th>
              {products.map((p) => (
                <th key={p._id}>
                  <div className="compare-product-header">
                    <img src={fileUrl(p.images?.[0]) || getPlaceholderImage(p.category?.slug)} alt="" />
                    <span>{i18n.language === 'ar' ? p.name_ar : p.name_en}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeCompare(p._id)}>
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t('common.currency')}</td>
              {products.map((p) => (
                <td key={p._id} className="price">
                  {(p.discountPrice ?? p.price).toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td>{t('common.rating')}</td>
              {products.map((p) => (
                <td key={p._id}>{p.ratingAvg?.toFixed(1) || 0} ⭐ ({p.ratingCount || 0})</td>
              ))}
            </tr>
            {attributeDefs.map((def) => (
              <tr key={def.key}>
                <td>
                  {getSpecIcon(def.icon)} {i18n.language === 'ar' ? def.label_ar : def.label_en}
                </td>
                {products.map((p) => {
                  const attrValue = p.attributes.find((a) => a.key === def.key);
                  return <td key={p._id}>{attrValue ? attrValue.value : '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
