import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

import axios from 'axios';
import '../global.css';

interface Order {
  _id: string;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const { cart, getSubtotal } = useContext(CartContext)!;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders/my-orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (!user) {
    return <div className="profile-page"><p>Please log in to view your profile.</p></div>;
  }

  return (
    <div className="profile-page">
      <div className="page-container">
        <h1 className="page-title">My Profile</h1>

        <div className="profile-content">
          <section className="profile-section">
            <h2>User Details</h2>
            <div className="user-details">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          </section>

          <section className="profile-section">
            <h2>Current Cart</h2>
            {cart.length > 0 ? (
              <div className="cart-summary">
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.title} className="cart-item-image" />
                      <div className="cart-item-details">
                        <h3 className="cart-item-title">{item.title}</h3>
                        <p className="cart-item-price">${item.price} x {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <p><strong>Total: ${getSubtotal().toFixed(2)}</strong></p>
                </div>
              </div>
            ) : (
              <p>Your cart is empty.</p>
            )}
          </section>

          <section className="profile-section">
            <h2>Order History</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length > 0 ? (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order._id} className="order-item">
                    <div className="order-header">
                      <h3>Order #{order._id}</h3>
                      <p>Status: {order.status}</p>
                      <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item-detail">
                          <p>{item.title} - ${item.price} x {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <p><strong>Total: ${order.totalAmount.toFixed(2)}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No orders found.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;