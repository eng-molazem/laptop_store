import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fileUrl } from '../api/client';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import StarRating from './StarRating';
import { getPlaceholderImage } from '../utils/placeholderImage';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const { ids, categorySlug, toggleCompare, maxCompare } = useCompare();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const name = i18n.language === 'ar' ? product.name_ar : product.name_en;
  const effectivePrice = product.discountPrice != null && product.discountPrice < product.price ? product.discountPrice : product.price;
  const hasDiscount = effectivePrice < product.price;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 3);
  const isOutOfStock = product.stock <= 0;
  const inCompare = ids.includes(product._id);
  const disabledOtherCategory = !inCompare && categorySlug && product.category?.slug && categorySlug !== product.category.slug;

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 8 });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      className="product-card card"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{ transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      <div className="product-card-badges">
        {hasDiscount && <span className="badge badge-deal">{t('common.save')}</span>}
        {isLowStock && <span className="badge badge-lowstock">{t('common.lowStock', { count: product.stock })}</span>}
      </div>

      <label
        className="product-card-compare"
        title={disabledOtherCategory ? 'يمكن مقارنة منتجات من نفس الفئة فقط' : undefined}
      >
        <input
          type="checkbox"
          checked={inCompare}
          disabled={disabledOtherCategory || (!inCompare && ids.length >= maxCompare)}
          onChange={() => toggleCompare(product)}
        />
        {t('common.compare')}
      </label>

      <Link to={`/product/${product.slug}`} className="product-card-image">
        <img src={fileUrl(product.images?.[0]) || getPlaceholderImage(product.category?.slug)} alt={name} />
      </Link>

      <div className="product-card-body">
        <Link to={`/product/${product.slug}`} className="product-card-name">
          {name}
        </Link>
        <div className="product-card-rating">
          <StarRating value={product.ratingAvg} size={13} />
          <span className="text-muted">({product.ratingCount || 0})</span>
        </div>
        <div className="product-card-price">
          <span className="price">
            {effectivePrice.toLocaleString()} {t('common.currency')}
          </span>
          {hasDiscount && <span className="price-old">{product.price.toLocaleString()}</span>}
        </div>
        <button className="btn btn-primary btn-block btn-sm" disabled={isOutOfStock} onClick={() => addItem(product, 1)}>
          {isOutOfStock ? t('common.outOfStock') : t('common.addToCart')}
        </button>
      </div>
    </motion.div>
  );
}
