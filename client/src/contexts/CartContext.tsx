import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  productId?: string;
  title: string;
  price: number;
  image: string;
  type: string;
  stockQuantity?: number;
  buyerOption?: 'painting' | 'outline-sketch' | 'colored-version';
  buyerOptionLabel?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => boolean;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'));

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product): boolean => {
    let success = true;
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      const baseProductId = product.productId || product.id;
      const totalForProduct = prevCart
        .filter(item => (item.productId || item.id) === baseProductId)
        .reduce((sum, item) => sum + item.quantity, 0);
      if (existing) {
        if (product.type === 'original-artwork' && totalForProduct >= 1) {
          toast.error("Original artworks are limited to one per customer");
          success = false;
          return prevCart;
        }
        if (totalForProduct >= (product.stockQuantity ?? 0)) {
          toast.error(`Only ${product.stockQuantity ?? 0} items available in stock`);
          success = false;
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      if ((product.stockQuantity ?? 0) <= 0) {
        toast.error("This item is out of stock");
        success = false;
        return prevCart;
      }

      if (product.type === 'original-artwork' && totalForProduct >= 1) {
        toast.error("Original artworks are limited to one per customer");
        success = false;
        return prevCart;
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
    return success;
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number): boolean => {
    let success = true;
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === id);
      if (!existing) return prevCart;

      const newQuantity = Math.max(1, quantity);
      if (newQuantity > (existing.stockQuantity ?? 0)) {
        toast.error(`Only ${existing.stockQuantity ?? 0} items available in stock`);
        success = false;
        return prevCart;
      }

      return prevCart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
    });
    return success;
  };

  const clearCart = () => {
    setCart([]);
  };

  const getSubtotal = (): number => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getSubtotal, getTotalItems }}>
      {children}
    </CartContext.Provider>
  );
};
