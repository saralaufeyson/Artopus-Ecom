import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';

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
  const [clientSecret, setClientSecret] = useState<string>('');
  const [shipping, setShipping] = useState<Shipping>({ street: '', city: '', state: '', zip: '', country: '' });

  useEffect(() => {
    const createIntent = async () => {
      try {
        const res = await axios.post('/api/create-intent', { amount: getSubtotal() * 100 }); // Amount in cents
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error('Failed to create payment intent:', err);
      }
    };
    createIntent();
  }, [getSubtotal]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: { name: 'Customer Name' }, // Add more details
      },
    });

    if (error) {
      console.error(error.message);
    } else {
      // Handle success, e.g., redirect or show confirmation
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
        Pay ${getSubtotal().toFixed(2)}
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
