import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import './Cart.css';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getSubtotal } = useContext(CartContext)!;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <img src={item.image} alt={item.title} className="w-16 h-16 object-cover" />
                <div className="flex-1 ml-4">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p>${item.price}</p>
                </div>
                <input
                  type="number"
                  min="1"
                  max={item.type === 'original-artwork' ? 1 : undefined}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border rounded"
                />
                <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-600">Remove</button>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <p className="text-xl font-bold">Subtotal: ${getSubtotal().toFixed(2)}</p>
            <Link to="/checkout" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
