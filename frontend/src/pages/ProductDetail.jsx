import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getProductBySlug, postReview, reportReview } from '../api/public';
import { fileUrl } from '../api/client';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import StarRating from '../components/StarRating';
import CountdownTimer from '../components/CountdownTimer';
import ProductCard from '../components/ProductCard';
import { getSpecIcon } from '../utils/specIcons';
import { getPlaceholderImage } from '../utils/placeholderImage';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { settings } = useSettings();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [attributeDefs, setAttributeDefs] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ buyerName: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getProductBySlug(slug).then((res) => {
      setProduct(res.product);
      setReviews(res.reviews);
      setAttributeDefs(res.attributeDefs || []);
      setActiveImage(0);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!product) return <div className="container" style={{ padding: 60 }}><div className="spinner" /></div>;

  const name = i18n.language === 'ar' ? product.name_ar : product.name_en;
  const description = i18n.language === 'ar' ? product.description_ar : product.description_en;
  const effectivePrice = product.discountPrice != null && product.discountPrice < product.price ? product.discountPrice : product.price;
  const hasDiscount = effectivePrice < product.price;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 3);
  const reservationPercent = product.reservationPercent || settings?.reservationPercentDefault || 20;

  const handleReserve = () => {
    addItem(product, 1);
    navigate('/checkout?type=reservation');
  };

  const handleBuyNow = () => {
    addItem(product, 1);
    navigate('/checkout');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.buyerName || !reviewForm.comment) return;
    setSubmitting(true);
    try {
      await postReview(product._id, reviewForm);
      setReviewForm({ buyerName: '', rating: 5, comment: '' });
      load();
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (reviewId) => {
    const reason = window.prompt(t('product.reportReason'));
    if (reason == null) return;
    await reportReview(reviewId, reason);
    alert(t('common.success'));
  };

  return (
    <div className="container product-detail">
      <div className="product-detail-top">
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img
              src={fileUrl(product.images?.[activeImage]) || getPlaceholderImage(product.category?.slug)}
              alt={name}
            />
            {hasDiscount && <span className="badge badge-deal product-detail-badge">{t('common.save')}</span>}
          </div>
          {product.images?.length > 1 && (
            <div className="product-gallery-thumbs">
              {product.images.map((img, i) => (
                <button key={i} className={`thumb ${i === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(i)}>
                  <img src={fileUrl(img)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div className="product-info" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1>{name}</h1>
          <div className="product-info-rating">
            <StarRating value={product.ratingAvg} />
            <span className="text-muted">({product.ratingCount} {t('common.reviews')})</span>
          </div>

          <div className="product-info-price">
            <span className="price" style={{ fontSize: '1.8rem' }}>
              {effectivePrice.toLocaleString()} {t('common.currency')}
            </span>
            {hasDiscount && <span className="price-old">{product.price.toLocaleString()}</span>}
          </div>

          {product.isWeeklyDeal && product.dealEndsAt && (
            <div className="product-deal-timer">
              {t('product.dealEndsIn')}: <CountdownTimer target={product.dealEndsAt} />
            </div>
          )}

          <div className="product-stock-info">
            {isOutOfStock ? (
              <span className="badge badge-outline">{t('common.outOfStock')}</span>
            ) : isLowStock ? (
              <span className="badge badge-lowstock">{t('common.lowStock', { count: product.stock })}</span>
            ) : (
              <span className="badge badge-new">{t('common.inStock')}</span>
            )}
          </div>

          <p className="product-description">{description}</p>

          <div className="product-actions">
            <button className="btn btn-primary btn-lg" disabled={isOutOfStock} onClick={handleBuyNow}>
              {t('common.buyNow')}
            </button>
            <button className="btn btn-ghost btn-lg" disabled={isOutOfStock} onClick={() => addItem(product, 1)}>
              {t('common.addToCart')}
            </button>
            {product.reservationAllowed && !isOutOfStock && (
              <button className="btn btn-accent btn-lg" onClick={handleReserve}>
                {t('common.reserve')}
              </button>
            )}
          </div>
          {product.reservationAllowed && !isOutOfStock && (
            <p className="text-muted reservation-note">{t('product.reservationNote', { percent: reservationPercent })}</p>
          )}
        </motion.div>
      </div>

      {product.attributes?.length > 0 && (
        <section className="product-specs-section">
          <h2 className="section-title">{t('product.specs')}</h2>
          <div className="specs-grid">
            {product.attributes.map((attrValue) => {
              const def = attributeDefs.find((d) => d.key === attrValue.key);
              if (!def) return null;
              return (
                <div key={attrValue.key} className="spec-item">
                  <span className="spec-icon">{getSpecIcon(def.icon)}</span>
                  <div>
                    <div className="spec-label">{i18n.language === 'ar' ? def.label_ar : def.label_en}</div>
                    <div className="spec-value">{attrValue.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {product.frequentlyBoughtWith?.length > 0 && (
        <section className="product-related-section">
          <h2 className="section-title">{t('product.frequentlyBoughtWith')}</h2>
          <div className="grid grid-4">
            {product.frequentlyBoughtWith.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {product.relatedProducts?.length > 0 && (
        <section className="product-related-section">
          <h2 className="section-title">{t('product.relatedProducts')}</h2>
          <div className="grid grid-4">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="product-reviews-section">
        <h2 className="section-title">{t('product.reviews')}</h2>

        <form className="review-form card" onSubmit={submitReview}>
          <h4>{t('product.writeReview')}</h4>
          <div className="form-group">
            <label className="label">{t('product.yourName')}</label>
            <input
              className="input"
              value={reviewForm.buyerName}
              onChange={(e) => setReviewForm({ ...reviewForm, buyerName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">{t('common.rating')}</label>
            <StarRating value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} size={24} />
          </div>
          <div className="form-group">
            <label className="label">{t('product.yourReview')}</label>
            <textarea
              className="textarea"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" disabled={submitting} type="submit">
            {t('product.submitReview')}
          </button>
        </form>

        <div className="review-list">
          {reviews.length === 0 && <p className="text-muted">{t('common.noResults')}</p>}
          {reviews.map((r) => (
            <div key={r._id} className="review-item card">
              <div className="review-item-header">
                <strong>{r.buyerName}</strong>
                <StarRating value={r.rating} size={14} />
              </div>
              <p>{r.comment}</p>
              <button className="btn btn-ghost btn-sm" onClick={() => handleReport(r._id)}>
                🚩 {t('product.report')}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
