import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import { MapPin, Smartphone, ShieldCheck, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/image';

interface Shipping {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getSubtotal, clearCart } = useContext(CartContext)!;
  const [shipping, setShipping] = useState<Shipping>({ street: '', city: '', state: '', zip: '', country: '' });
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const shippingCost = 15;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/payments/create-intent', {
        items: cart.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          buyerOption: item.buyerOption || 'painting',
        })),
        shippingAddress: shipping,
      });

      const { redirectUrl, orderId, clientSecret } = res.data;

      // Keep the existing mock/Stripe fallback behavior for local or test-like environments.
      if (clientSecret?.startsWith('mock_')) {
        clearCart();
        navigate(`/order-success/${orderId}`);
        return;
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      alert('Payment gateway is not configured correctly. Please try again.');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong while starting the payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom checkout-page">
      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-main">
          <section className="checkout-card">
            <h2 className="checkout-section-title">
              <MapPin className="text-logo-purple" size={24} />
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={shipping.street}
                  onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                  className="checkout-input"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="City"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                className="checkout-input"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={shipping.state}
                onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                className="checkout-input"
                required
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={shipping.zip}
                onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                className="checkout-input"
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={shipping.country}
                onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                className="checkout-input"
                required
              />
            </div>
          </section>

          <section className="checkout-card">
            <h2 className="checkout-section-title">
              <Smartphone className="text-logo-purple" size={24} />
              Payment Gateway
            </h2>

            <div className="payment-method-card payment-method-card-active">
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center border-logo-purple bg-logo-purple">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-white">PhonePe Checkout</span>
                <span className="text-xs text-gray-500">UPI, cards, and other supported PhonePe methods</span>
              </div>
              <Smartphone className="ml-auto text-gray-400" size={20} />
            </div>

            <div className="mt-6 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                You’ll be redirected to PhonePe to complete the payment securely. We only clear the cart after the payment is confirmed.
              </p>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="auth-button flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continue to PhonePe
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <aside className="checkout-sidebar">
          <div className="checkout-card sticky top-32">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
                    <img src={getOptimizedImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    {item.buyerOptionLabel && <p className="text-xs text-gray-500">{item.buyerOptionLabel}</p>}
                    <p className="text-sm font-bold text-logo-purple">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="order-summary-row">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="order-summary-row">
                <span className="text-gray-500">Shipping</span>
                <span className="font-bold text-gray-900 dark:text-white">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="order-summary-total">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-black text-logo-purple">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/20 flex items-start gap-3">
              <ShieldCheck className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">Secure Redirect</p>
                <p className="text-xs text-green-700 dark:text-green-400/80">PhonePe handles the payment step on its secure checkout.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
