import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getProducts, getCategories } from '../api/public';
import ProductCard from '../components/ProductCard';
import './Home.css';

const CATEGORY_ICONS = { laptops: '💻', desktops: '🖥️', accessories: '🖱️', cameras: '📷', storage: '💾', batteries: '🔋' };

export default function Home() {
  const { t, i18n } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getProducts({ featured: true, limit: 8 }).then((r) => setFeatured(r.items));
    getProducts({ weeklyDeal: true, limit: 8 }).then((r) => setDeals(r.items));
    getCategories().then(setCategories);
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>{t('home.heroTitle')}</h1>
            <p>{t('home.heroSubtitle')}</p>
            <Link to="/products" className="btn btn-accent btn-lg">
              {t('home.shopNow')}
            </Link>
          </motion.div>
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, rotateY: -25, scale: 0.85 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="hero-laptop">💻</div>
            <div className="hero-glow" />
          </motion.div>
        </div>
      </section>

      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">{t('home.categories')}</h2>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link to={`/products?category=${c.slug}`} className="category-card">
                <span className="category-icon">{CATEGORY_ICONS[c.slug] || '🔧'}</span>
                <span>{i18n.language === 'ar' ? c.name_ar : c.name_en}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {deals.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <div>
              <h2 className="section-title">🔥 {t('home.weeklyDeals')}</h2>
            </div>
            <Link to="/offers" className="btn btn-outline btn-sm">
              {t('common.viewDetails')}
            </Link>
          </div>
          <div className="grid grid-4">
            {deals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <h2 className="section-title">{t('home.featured')}</h2>
          </div>
          <div className="grid grid-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
