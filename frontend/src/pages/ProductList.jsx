import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories } from '../api/public';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import './ProductList.css';

export default function ProductList() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const filters = Object.fromEntries(searchParams.entries());

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const activeCategory = categories.find((c) => c.slug === filters.category);
  const pageTitle = filters.search
    ? t('filters.searchResults', { query: filters.search })
    : activeCategory
      ? i18n.language === 'ar'
        ? activeCategory.name_ar
        : activeCategory.name_en
      : t('filters.allProducts');

  // apply the last-used sort preference on first visit if the URL doesn't specify one
  useEffect(() => {
    if (!searchParams.get('sort')) {
      const savedSort = localStorage.getItem('sortPreference');
      if (savedSort) {
        const next = new URLSearchParams(searchParams);
        next.set('sort', savedSort);
        setSearchParams(next, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(filters)
      .then(setData)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const updateFilter = (key, value) => {
    if (key === 'sort') {
      if (value) localStorage.setItem('sortPreference', value);
      else localStorage.removeItem('sortPreference');
    }
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="container product-list-page">
      <div className="product-list-header">
        <h1 className="section-title">{pageTitle}</h1>
        <select className="select sort-select" value={filters.sort || 'newest'} onChange={(e) => updateFilter('sort', e.target.value)}>
          <option value="newest">{t('filters.sortNewest')}</option>
          <option value="price_asc">{t('filters.sortPriceAsc')}</option>
          <option value="price_desc">{t('filters.sortPriceDesc')}</option>
          <option value="rating">{t('filters.sortRating')}</option>
        </select>
      </div>

      <div className="product-list-layout">
        <FilterSidebar filters={filters} onChange={updateFilter} onClear={clearFilters} />

        <div>
          {loading ? (
            <div className="grid grid-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 320 }} />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="empty-state">{t('common.noResults')}</div>
          ) : (
            <>
              <div className="grid grid-3">
                {data.items.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {data.pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: data.pages }).map((_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${Number(filters.page || 1) === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => updateFilter('page', String(i + 1))}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
