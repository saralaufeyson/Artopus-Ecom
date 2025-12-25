import './Checkout.css';

function Checkout() {
  return (
    <div className="checkout-page">
      <div className="page-container">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-form">
            <section className="form-section">
              <h2>Shipping Information</h2>
              <div className="form-row">
                <input type="text" placeholder="First Name" className="form-input" />
                <input type="text" placeholder="Last Name" className="form-input" />
              </div>
              <input type="email" placeholder="Email" className="form-input" />
              <input type="text" placeholder="Address" className="form-input" />
              <div className="form-row">
                <input type="text" placeholder="City" className="form-input" />
                <input type="text" placeholder="State" className="form-input" />
                <input type="text" placeholder="ZIP Code" className="form-input" />
              </div>
            </section>

            <section className="form-section">
              <h2>Payment Information</h2>
              <input type="text" placeholder="Card Number" className="form-input" />
              <div className="form-row">
                <input type="text" placeholder="MM/YY" className="form-input" />
                <input type="text" placeholder="CVC" className="form-input" />
              </div>
            </section>

            <button className="place-order-button">Place Order</button>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              <div className="summary-item">
                <span>Artwork Title 1</span>
                <span>$850.00</span>
              </div>
              <div className="summary-item">
                <span>Artwork Title 2</span>
                <span>$650.00</span>
              </div>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>$1,500.00</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>$50.00</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-total">
              <span>Total</span>
              <span>$1,550.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
