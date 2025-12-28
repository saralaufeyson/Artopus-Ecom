import React, { useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import '../global.css';

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
  const { cart } = useContext(CartContext)!; // Cart contains the items
  const [shipping, setShipping] = useState<Shipping>({ street: '', city: '', state: '', zip: '', country: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      // 1. Send items and shipping to get the clientSecret
      // Correct endpoint: /api/payments/create-intent
      const res = await axios.post('/api/payments/create-intent', { 
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        shippingAddress: shipping 
      });

      const { clientSecret } = res.data;

      // 2. Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        console.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // 3. Handle success (Clear cart, redirect to success page)
        alert("Payment Successful!");
        window.location.href = "/"; 
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
      <input type="text" placeholder="Street" value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} className="w-full mb-2 p-2 border rounded" required />
      <input type="text" placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="w-full mb-2 p-2 border rounded" required />
      <input type="text" placeholder="State" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className="w-full mb-2 p-2 border rounded" required />
      <input type="text" placeholder="Zip" value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} className="w-full mb-2 p-2 border rounded" required />
      <input type="text" placeholder="Country" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} className="w-full mb-4 p-2 border rounded" required />
      <h2 className="text-2xl font-bold mb-4">Payment</h2>
      <CardElement className="p-2 border rounded mb-4" />
      <button type="submit" disabled={!stripe} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Pay ${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
      </button>
    </form>
  );
};

const Checkout: React.FC = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
