import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CompareContext = createContext(null);
const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('compareItems') || 'null');
      if (Array.isArray(stored)) return stored;
      // migrate from the old plain-ids format
      const oldIds = JSON.parse(localStorage.getItem('compareIds') || '[]');
      return oldIds.map((id) => ({ id, categorySlug: null }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(items));
    localStorage.removeItem('compareIds');
  }, [items]);

  const categorySlug = items[0]?.categorySlug || null;

  const toggleCompare = useCallback((product) => {
    const productCategorySlug = product.category?.slug || product.category || null;
    setItems((prev) => {
      if (prev.some((i) => i.id === product._id)) {
        return prev.filter((i) => i.id !== product._id);
      }
      if (prev.length > 0 && prev[0].categorySlug && productCategorySlug && prev[0].categorySlug !== productCategorySlug) {
        window.alert('يمكن مقارنة منتجات من نفس الفئة فقط. أفرغ قائمة المقارنة أولاً للمقارنة مع فئة أخرى.');
        return prev;
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, { id: product._id, categorySlug: productCategorySlug }];
    });
  }, []);

  const removeCompare = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const clearCompare = useCallback(() => setItems([]), []);

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  return (
    <CompareContext.Provider
      value={{ ids, categorySlug, toggleCompare, removeCompare, clearCompare, maxCompare: MAX_COMPARE }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
