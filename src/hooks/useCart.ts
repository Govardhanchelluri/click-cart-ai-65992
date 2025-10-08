import { useState, useEffect } from 'react';

export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  original_price: number;
  stock: number;
  demandLevel?: "high" | "medium" | "low";
}

const CART_STORAGE_KEY = 'shopping_cart';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = (items: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      setCartItems(items);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existingIndex = cartItems.findIndex(i => i.product_id === item.product_id);
    
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity = Math.min(
        updated[existingIndex].quantity + 1,
        item.stock
      );
      saveCart(updated);
    } else {
      saveCart([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updated = cartItems.map(item =>
      item.product_id === productId 
        ? { ...item, quantity: Math.min(quantity, item.stock) } 
        : item
    );
    saveCart(updated);
  };

  const removeFromCart = (productId: string) => {
    saveCart(cartItems.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getItemCount,
    loadCart
  };
};
