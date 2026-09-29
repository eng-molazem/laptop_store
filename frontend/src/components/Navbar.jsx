import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { applyDirection } from '../i18n';
import SearchBox from './SearchBox';
import './Navbar.css';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { count } = useCart();
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const storeName = i18n.language === 'ar' ? settings?.storeName : settings?.storeNameEn;

  const switchLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    applyDirection(next);
  };

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/products?category=laptops', label: t('nav.laptops') },
    { to: '/offers', label: t('nav.offers') },
    { to: '/compare', label: t('nav.compare') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <motion.span initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {storeName || '...'}
          </motion.span>
        </Link>

        <nav className="navbar-links">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="navbar-link">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="navbar-search">
          <SearchBox />
        </div>

        <div className="navbar-actions">
          <button className="btn btn-icon btn-ghost" onClick={switchLang} title="EN/AR">
            {i18n.language === 'ar' ? 'EN' : 'AR'}
          </button>
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme} title="Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/track-order" className="btn btn-icon btn-ghost" title={t('nav.trackOrder')}>
            📦
          </Link>
          <Link to="/admin/login" className="btn btn-icon btn-ghost" title={t('admin.login')}>
            🔒
          </Link>
          <Link to="/cart" className="btn btn-primary cart-btn">
            🛒 {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <button className="navbar-burger" onClick={() => setMenuOpen((o) => !o)}>
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          <SearchBox onNavigate={() => setMenuOpen(false)} />
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link to="/admin/login" onClick={() => setMenuOpen(false)}>
            🔒 {t('admin.login')}
          </Link>
        </div>
      )}
    </header>
  );
}
