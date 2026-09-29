import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilterOptions } from '../api/public';
import { getSpecIcon } from '../utils/specIcons';
import './FilterSidebar.css';

export default function FilterSidebar({ filters, onChange, onClear }) {
  const { t, i18n } = useTranslation();
  const [attributeDefs, setAttributeDefs] = useState([]);

  useEffect(() => {
    if (!filters.category) {
      setAttributeDefs([]);
      return;
    }
    getFilterOptions({ category: filters.category })
      .then(setAttributeDefs)
      .catch(() => setAttributeDefs([]));
  }, [filters.category]);

  const attrParamKey = (key) => `attr[${key}]`;

  const toggleMulti = (attrKey, value) => {
    const paramKey = attrParamKey(attrKey);
    const current = filters[paramKey] ? filters[paramKey].split(',') : [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange(paramKey, next.join(','));
  };

  const isChecked = (attrKey, value) => (filters[attrParamKey(attrKey)] || '').split(',').includes(value);

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <h3>{t('filters.title')}</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>
          {t('filters.clear')}
        </button>
      </div>

      {!filters.category && (
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          {i18n.language === 'ar' ? 'اختر فئة لعرض فلاترها الخاصة' : 'Choose a category to see its filters'}
        </p>
      )}

      {attributeDefs.map(
        (def) =>
          def.values.length > 0 && (
            <div key={def.key} className="filter-group">
              <h4>
                {getSpecIcon(def.icon)} {i18n.language === 'ar' ? def.label_ar : def.label_en}
              </h4>
              {def.values.map((v) => (
                <label key={v} className="filter-checkbox">
                  <input type="checkbox" checked={isChecked(def.key, v)} onChange={() => toggleMulti(def.key, v)} />
                  {v}
                </label>
              ))}
            </div>
          )
      )}

      <div className="filter-group">
        <h4>{t('filters.price')}</h4>
        <div className="filter-price-range">
          <input
            className="input"
            type="number"
            placeholder="من"
            value={filters.priceMin || ''}
            onChange={(e) => onChange('priceMin', e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="إلى"
            value={filters.priceMax || ''}
            onChange={(e) => onChange('priceMax', e.target.value)}
          />
        </div>
      </div>
    </aside>
  );
}
