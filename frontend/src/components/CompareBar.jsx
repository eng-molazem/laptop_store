import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useCompare } from '../context/CompareContext';
import './CompareBar.css';

export default function CompareBar() {
  const { t } = useTranslation();
  const { ids, clearCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {ids.length >= 1 && (
        <motion.div
          className="compare-bar"
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
        >
          <span>{ids.length} {t('common.compare')}</span>
          <div className="compare-bar-actions">
            <button className="btn btn-ghost btn-sm" onClick={clearCompare}>
              {t('common.cancel')}
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={ids.length < 2}
              onClick={() => navigate(`/compare?ids=${ids.join(',')}`)}
            >
              {t('nav.compare')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
