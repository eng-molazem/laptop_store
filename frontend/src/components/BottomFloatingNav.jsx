import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './BottomFloatingNav.css';

const CATEGORIES = [
  { slug: 'laptops', icon: '💻', key: 'laptops' },
  { slug: 'desktops', icon: '🖥️', key: 'desktops' },
  { slug: 'accessories', icon: '🖱️', key: 'accessories' },
  { slug: 'cameras', icon: '📷', key: 'cameras' },
  { slug: 'storage', icon: '💾', key: 'storage' },
  { slug: 'batteries', icon: '🔋', key: 'batteries' },
];

export default function BottomFloatingNav() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeCategory = location.pathname === '/products' ? searchParams.get('category') : null;

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const goingDown = currentY > lastScrollY.current + 4;
        const goingUp = currentY < lastScrollY.current - 4;
        if (currentY < 80) setVisible(true);
        else if (goingDown) setVisible(false);
        else if (goingUp) setVisible(true);
        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`bottom-nav ${visible ? 'visible' : 'hidden'}`}>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          to={`/products?category=${c.slug}`}
          className={`bottom-nav-item${activeCategory === c.slug ? ' active' : ''}`}
        >
          <span className="bottom-nav-icon">{c.icon}</span>
          <span className="bottom-nav-label">{t(`nav.${c.key}`)}</span>
        </Link>
      ))}
    </nav>
  );
}
