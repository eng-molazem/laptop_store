import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container empty-state" style={{ padding: '100px 20px' }}>
      <h1 style={{ fontSize: '3rem' }}>404</h1>
      <Link to="/" className="btn btn-primary">
        {t('nav.home')}
      </Link>
    </div>
  );
}
