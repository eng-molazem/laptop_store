import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../api/public';
import { fileUrl } from '../api/client';
import { getPlaceholderImage } from '../utils/placeholderImage';
import './SearchBox.css';

export default function SearchBox({ onNavigate }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getProducts({ search: query.trim(), limit: 5 })
        .then((res) => setSuggestions(res.items))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToProduct = (slug) => {
    setOpen(false);
    setQuery('');
    navigate(`/product/${slug}`);
    onNavigate?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
    onNavigate?.();
  };

  return (
    <div className="search-box" ref={wrapRef}>
      <form onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder={t('common.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        />
      </form>

      {open && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((p) => (
            <button key={p._id} type="button" className="search-suggestion-item" onClick={() => goToProduct(p.slug)}>
              <img src={fileUrl(p.images?.[0]) || getPlaceholderImage(p.category?.slug)} alt="" />
              <div>
                <span className="suggestion-name">{i18n.language === 'ar' ? p.name_ar : p.name_en}</span>
                <span className="suggestion-price">
                  {(p.discountPrice ?? p.price).toLocaleString()} {t('common.currency')}
                </span>
              </div>
            </button>
          ))}
          <button type="button" className="search-suggestion-more" onClick={handleSubmit}>
            {t('common.search')}: “{query}” →
          </button>
        </div>
      )}
    </div>
  );
}
