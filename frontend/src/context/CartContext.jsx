import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCart, saveCart } from '../api/public';
import { useGuestId } from './GuestIdContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const guestId = useGuestId();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    getCart(guestId)
      .then((cart) => {
        setItems((cart.items || []).filter((i) => i.product));
        setContactEmail(cart.contactEmail || '');
      })
      .finally(() => setLoading(false));
  }, [guestId]);

  const persist = useCallback(
    (nextItems, email) => {
      saveCart(guestId, {
        items: nextItems.map((i) => ({ product: i.product._id, qty: i.qty })),
        contactEmail: email,
      }).catch(() => {});
    },
    [guestId]
  );

  const addItem = useCallback(
    (product, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product._id === product._id);
        const next = existing
          ? prev.map((i) => (i.product._id === product._id ? { ...i, qty: i.qty + qty } : i))
          : [...prev, { product, qty }];
        persist(next, contactEmail);
        return next;
      });
    },
    [persist, contactEmail]
  );

  const updateQty = useCallback(
    (productId, qty) => {
      setItems((prev) => {
        const next = prev.map((i) => (i.product._id === productId ? { ...i, qty: Math.max(1, qty) } : i));
        persist(next, contactEmail);
        return next;
      });
    },
    [persist, contactEmail]
  );

  const removeItem = useCallback(
    (productId) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.product._id !== productId);
        persist(next, contactEmail);
        return next;
      });
    },
    [persist, contactEmail]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    persist([], contactEmail);
  }, [persist, contactEmail]);

  const updateContactEmail = useCallback(
    (email) => {
      setContactEmail(email);
      persist(items, email);
    },
    [items, persist]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.product.discountPrice ?? i.product.price) * i.qty, 0),
    [items]
  );

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, loading, addItem, updateQty, removeItem, clearCart, subtotal, count, contactEmail, updateContactEmail }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
