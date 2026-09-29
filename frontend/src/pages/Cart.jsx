import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { fileUrl } from '../api/client';
import { getPlaceholderImage } from '../utils/placeholderImage';
import './Cart.css';

export default function Cart() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, updateQty, removeItem, subtotal, contactEmail, updateContactEmail } = useCart();

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <p>{t('cart.empty')}</p>
        <Link to="/products" className="btn btn-primary">
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="section-title">{t('cart.title')}</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const name = i18n.language === 'ar' ? item.product.name_ar : item.product.name_en;
            const price = item.product.discountPrice ?? item.product.price;
            return (
              <div key={item.product._id} className="cart-item card">
                <img
                  src={fileUrl(item.product.images?.[0]) || getPlaceholderImage(item.product.category?.slug)}
                  alt={name}
                />
                <div className="cart-item-info">
                  <Link to={`/product/${item.product.slug}`}>{name}</Link>
                  <span className="price">{price.toLocaleString()} {t('common.currency')}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  className="input cart-item-qty"
                  value={item.qty}
                  onChange={(e) => updateQty(item.product._id, Number(e.target.value))}
                />
                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.product._id)}>
                  {t('cart.remove')}
                </button>
              </div>
            );
          })}

          <div className="form-group">
            <label className="label">{t('cart.reminderEmail')}</label>
            <input
              className="input"
              type="email"
              value={contactEmail}
              onChange={(e) => updateContactEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="cart-summary card">
          <div className="cart-summary-row">
            <span>{t('cart.subtotal')}</span>
            <span className="price">{subtotal.toLocaleString()} {t('common.currency')}</span>
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/checkout')}>
            {t('cart.checkout')}
          </button>
          <Link to="/products" className="btn btn-ghost btn-block">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
