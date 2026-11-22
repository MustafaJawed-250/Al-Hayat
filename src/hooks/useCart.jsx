import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'al-hayat-cart';
const DELIVERY = 250;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
      }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const updateQty = (id, quantity) => {
    if (quantity < 1) return removeItem(id);
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, quantity } : i)));
  };
  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const deliveryCharge = items.length ? DELIVERY : 0;
  const total = subtotal + deliveryCharge;
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      subtotal, deliveryCharge, total, count,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
