import React, { useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { MapPin, CreditCard, Smartphone, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';

const stripePromise = loadStripe('your-stripe-publishable-key'); // Replace with your key

interface Shipping {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, getSubtotal } = useContext(CartContext)!;
  const { theme } = useTheme();
  const [shipping, setShipping] = useState<Shipping>({ street: '', city: '', state: '', zip: '', country: '' });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');

  const subtotal = getSubtotal();
  const shippingCost = 15; // Flat rate for example
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (paymentMethod === 'card' && (!stripe || !elements)) return;

    setLoading(true);

    try {
      if (paymentMethod === 'card') {
        const res = await axios.post('/api/payments/create-intent', { 
          items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
          shippingAddress: shipping 
        });

        const { clientSecret } = res.data;

        const { error, paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements!.getElement(CardElement)!,
          },
        });

        if (error) {
          alert(error.message);
        } else if (paymentIntent.status === 'succeeded') {
          alert("Payment Successful!");
          window.location.href = "/"; 
        }
      } else {
        // Mock UPI Payment Logic
        console.log('Processing UPI Payment for:', upiId);
        alert("UPI Request Sent! (Mock)");
        window.location.href = "/";
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
        '::placeholder': {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        },
        iconColor: theme === 'dark' ? '#a855f7' : '#8b5cf6',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <div className="container-custom checkout-page">
      <div className="checkout-layout">
        {/* Main Section */}
        <form onSubmit={handleSubmit} className="checkout-main">
          {/* Shipping Address */}
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

          {/* Payment Method */}
          <section className="checkout-card">
            <h2 className="checkout-section-title">
              <CreditCard className="text-logo-purple" size={24} />
              Payment Method
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div 
                onClick={() => setPaymentMethod('card')}
                className={`payment-method-card ${paymentMethod === 'card' ? 'payment-method-card-active' : 'payment-method-card-inactive'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-logo-purple bg-logo-purple' : 'border-gray-300'}`}>
                  {paymentMethod === 'card' && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 dark:text-white">Credit / Debit Card</span>
                  <span className="text-xs text-gray-500">Secure payment via Stripe</span>
                </div>
                <CreditCard className="ml-auto text-gray-400" size={20} />
              </div>

              <div 
                onClick={() => setPaymentMethod('upi')}
                className={`payment-method-card ${paymentMethod === 'upi' ? 'payment-method-card-active' : 'payment-method-card-inactive'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-logo-purple bg-logo-purple' : 'border-gray-300'}`}>
                  {paymentMethod === 'upi' && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 dark:text-white">UPI Payment</span>
                  <span className="text-xs text-gray-500">Instant transfer via UPI app</span>
                </div>
                <Smartphone className="ml-auto text-gray-400" size={20} />
              </div>
            </div>

            {paymentMethod === 'card' ? (
              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <CardElement options={cardElementOptions} />
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g., username@bank)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="checkout-input"
                  required={paymentMethod === 'upi'}
                />
                <div className="flex items-center gap-2 px-2">
                  <ShieldCheck size={14} className="text-logo-purple" />
                  <p className="text-xs text-gray-500 italic">
                    A payment request will be sent to your UPI app.
                  </p>
                </div>
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={loading || (paymentMethod === 'card' && !stripe)}
            className="auth-button flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Confirm and Pay ${total.toFixed(2)}
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Sidebar / Order Summary */}
        <aside className="checkout-sidebar">
          <div className="checkout-card sticky top-32">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
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
                <p className="text-sm font-bold text-green-800 dark:text-green-300">Secure Checkout</p>
                <p className="text-xs text-green-700 dark:text-green-400/80">Your data is encrypted and protected by industry standards.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Checkout: React.FC = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
