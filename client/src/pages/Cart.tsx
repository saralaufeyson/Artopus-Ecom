import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
 

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getSubtotal } = useContext(CartContext)!;

  return (
    <div className="cart-page">
      <div className="page-container">
        <div className="flex items-center gap-4 mb-12">
          <Link to="/shop" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="mb-6 text-gray-300 dark:text-gray-700">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
                <path d="M9 2L7 4M15 2l2 2M7 4h10l1 9H6l1-9z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="19" r="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="19" r="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't added any artworks to your collection yet.</p>
            <Link to="/shop" className="btn-primary">Explore Artworks</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.id} className="cart-item-card">
                  <div className="flex gap-6 items-center">
                    <div className="cart-item-image-wrapper">
                      <img src={item.image} alt={item.title} className="cart-item-img" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-logo-purple font-medium capitalize">{item.type.replace('-', ' ')}</p>
                        </div>
                        <button 
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-6">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.type === 'original-artwork'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-card">
              <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Estimated Tax</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-3xl font-black text-logo-purple">
                    ${getSubtotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <Link to="/checkout" className="checkout-btn-large">
                Proceed to Secure Checkout
              </Link>
              
              <p className="text-center mt-6 text-xs text-gray-400 flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Secure SSL Encrypted Payment
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
