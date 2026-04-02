import { useState, useEffect } from 'react';

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

const MAX_ITEMS = 20;

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.sku === item.sku);
      const currentTotal = prev.reduce((acc, i) => acc + i.quantity, 0);
      
      if (currentTotal >= MAX_ITEMS) {
        alert("Cart limit reached (max 20 items)");
        return prev;
      }

      if (existing) {
        return prev.map(i => i.sku === item.sku ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(i => i.sku !== sku));
  };

  const clearCart = () => setCart([]);

  return { cart, addToCart, removeFromCart, clearCart, totalItems: cart.reduce((acc, i) => acc + i.quantity, 0) };
}
