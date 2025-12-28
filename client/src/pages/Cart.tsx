import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import '../global.css';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getSubtotal } = useContext(CartContext)!;

  return (
    <div className="cart-page">
      <div className="page-container">
        <h1 className="page-title">Cart</h1>
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="continue-shopping">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.title}</h3>
                    <p className="cart-item-price">${item.price}</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button className="quantity-button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="quantity-button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-button" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="checkout-button">Proceed to Checkout</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
