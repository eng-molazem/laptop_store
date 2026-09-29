import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../api/public';
import ProductCard from '../components/ProductCard';

export default function Offers() {
  const { t } = useTranslation();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    getProducts({ weeklyDeal: true, limit: 24 }).then((r) => setDeals(r.items));
  }, []);

  return (
    <div className="container" style={{ padding: '32px 20px 60px' }}>
      <h1 className="section-title">🔥 {t('home.weeklyDeals')}</h1>
      {deals.length === 0 ? (
        <div className="empty-state">{t('common.noResults')}</div>
      ) : (
        <div className="grid grid-4" style={{ marginTop: 24 }}>
          {deals.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
