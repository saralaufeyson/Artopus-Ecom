import { Link } from 'react-router-dom';
import './Cart.css';

function Cart() {
  const cartItems = [
    { id: 1, title: 'Artwork Title 1', artist: 'Artist Name', price: 850, quantity: 1 },
    { id: 2, title: 'Artwork Title 2', artist: 'Artist Name', price: 650, quantity: 1 },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <div className="page-container">
        <h1 className="page-title">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/shop" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <span>Art {item.id}</span>
                  </div>
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.title}</h3>
                    <p className="cart-item-artist">{item.artist}</p>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button className="quantity-button">-</button>
                    <span>{item.quantity}</span>
                    <button className="quantity-button">+</button>
                  </div>
                  <button className="remove-button">Remove</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="checkout-button">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
