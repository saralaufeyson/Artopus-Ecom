import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { useCollections } from '../contexts/CollectionsContext';
import axios from 'axios';
import { getOptimizedImageUrl } from '../utils/image';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

interface Order {
  _id: string;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    buyerOptionLabel?: string;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  deliveryPartner?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const { cart, getSubtotal } = useContext(CartContext)!;
  const { collections, createCollection, removeFromCollection } = useCollections();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; title: string; comment: string }>>({});
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [ordersRes, reviewsRes] = await Promise.all([
          axios.get('/api/orders/my-orders'),
          axios.get('/api/reviews/mine'),
        ]);
        setOrders(ordersRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const submitReview = async (productId: string, orderId: string) => {
    const draft = reviewDrafts[`${orderId}-${productId}`];
    if (!draft?.rating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await axios.post('/api/reviews', {
        productId,
        orderId,
        ...draft,
      });
      toast.success('Feedback saved');
      const reviewsRes = await axios.get('/api/reviews/mine');
      setReviews(reviewsRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save review');
    }
  };

  const getExistingReview = (productId: string, orderId: string) => reviews.find((review) => review.product?._id === productId && review.order === orderId);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await createCollection(newCollectionName.trim());
      setNewCollectionName('');
      toast.success('Collection created');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not create collection');
    }
  };

  if (!user) {
    return <div className="profile-page"><p>Please log in to view your profile.</p></div>;
  }

  return (
    <div className="profile-page">
      <div className="page-container">
        <h1 className="page-title">My Profile</h1>

        <div className="profile-content space-y-8">
          <section className="profile-section">
            <h2>User Details</h2>
            <div className="user-details">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Phone:</strong> {user.phone || '-'}</p>
              <p><strong>WhatsApp:</strong> {user.whatsappNumber || '-'}</p>
            </div>
          </section>

          <section className="profile-section">
            <h2>Current Cart</h2>
            {cart.length > 0 ? (
              <div className="cart-summary">
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={getOptimizedImageUrl(item.image)} alt={item.title} className="cart-item-image" />
                      <div className="cart-item-details">
                        <h3 className="cart-item-title">{item.title}</h3>
                        <p className="cart-item-price">${item.price} x {item.quantity}</p>
                        {item.buyerOptionLabel && <p className="text-sm text-gray-500">{item.buyerOptionLabel}</p>}
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
              <div className="orders-list space-y-6">
                {orders.map(order => (
                  <div key={order._id} className="order-item p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    <div className="order-header">
                      <h3>Order #{order._id}</h3>
                      <p>Status: {order.status}</p>
                      <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      {order.deliveryPartner && <p>Delivery Partner: {order.deliveryPartner}</p>}
                      {order.trackingNumber && <p>Tracking Number: {order.trackingNumber}</p>}
                      {order.trackingUrl && <p><a href={order.trackingUrl} className="text-logo-purple hover:underline" target="_blank" rel="noreferrer">Track shipment</a></p>}
                    </div>
                    <div className="order-items space-y-4 mt-4">
                      {order.items.map((item, index) => {
                        const existingReview = getExistingReview(item.productId, order._id);
                        const draftKey = `${order._id}-${item.productId}`;
                        const draft = reviewDrafts[draftKey] || { rating: 5, title: '', comment: '' };

                        return (
                          <div key={index} className="order-item-detail p-4 rounded-2xl bg-gray-50 dark:bg-gray-950">
                            <p>{item.title} - ${item.price} x {item.quantity}</p>
                            {item.buyerOptionLabel && <p className="text-sm text-gray-500">{item.buyerOptionLabel}</p>}

                            {existingReview ? (
                              <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                <p className="font-bold">Your review: {existingReview.rating}/5</p>
                                {existingReview.comment && <p>{existingReview.comment}</p>}
                              </div>
                            ) : (
                              <div className="mt-4 space-y-3">
                                <select
                                  className="auth-input"
                                  value={draft.rating}
                                  onChange={(e) => setReviewDrafts({ ...reviewDrafts, [draftKey]: { ...draft, rating: Number(e.target.value) } })}
                                >
                                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                                </select>
                                <input
                                  className="auth-input"
                                  placeholder="Review title"
                                  value={draft.title}
                                  onChange={(e) => setReviewDrafts({ ...reviewDrafts, [draftKey]: { ...draft, title: e.target.value } })}
                                />
                                <textarea
                                  className="auth-input min-h-24"
                                  placeholder="Share your feedback"
                                  value={draft.comment}
                                  onChange={(e) => setReviewDrafts({ ...reviewDrafts, [draftKey]: { ...draft, comment: e.target.value } })}
                                />
                                <button className="auth-button" type="button" onClick={() => submitReview(item.productId, order._id)}>
                                  Save Feedback
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="order-total mt-4">
                      <p><strong>Total: ${order.totalAmount.toFixed(2)}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No orders found.</p>
            )}
          </section>

          <section className="profile-section">
            <div className="flex items-center justify-between mb-4">
              <h2>Wishlist & Saved Collections</h2>
              <form onSubmit={handleCreateCollection} className="flex gap-3">
                <input
                  className="auth-input"
                  placeholder="New collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <button className="auth-button" type="submit">Create</button>
              </form>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              {collections.map((collection) => (
                <div key={collection._id} className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{collection.name}</h3>
                      <p className="text-sm text-gray-500">{collection.items.length} saved item{collection.items.length === 1 ? '' : 's'}</p>
                    </div>
                    {collection.isDefault && <span className="text-xs font-bold text-logo-purple uppercase">Wishlist</span>}
                  </div>
                  <div className="space-y-3">
                    {collection.items.length > 0 ? collection.items.map((item) => (
                      <div key={item._id} className="flex gap-4 items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-950">
                        <img src={getOptimizedImageUrl(item.imageUrl)} alt={item.title} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1">
                          <Link to={`/product/${item._id}`} className="font-bold hover:text-logo-purple">{item.title}</Link>
                          <p className="text-sm text-gray-500">{item.artistName || 'Artist'}</p>
                          <p className="font-bold text-logo-purple">${item.price.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-red-600 font-bold"
                          onClick={() => removeFromCollection(collection._id, item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    )) : (
                      <p className="text-gray-500">No saved artworks yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
