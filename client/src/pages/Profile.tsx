import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import axios from 'axios';
import { getOptimizedImageUrl } from '../utils/image';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Heart, Package, MapPin, UserCheck, Upload, Trash2, Star } from 'lucide-react';

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
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;

  const navigate = useNavigate();
  const { collections, createCollection, removeFromCollection } = useCollections();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'details' | 'wishlist' | 'orders' | 'address'>('details');
  
  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  // Address form state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // Feedback states
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; title: string; comment: string }>>({});
  const [newCollectionName, setNewCollectionName] = useState('');

  // Sync profile details state when user context is loaded
  useEffect(() => {
    if (user) {
      const parts = user.name ? user.name.split(' ') : ['', ''];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setGender(user.gender || 'Select');
      setPhone(user.phone || '');
      setWhatsappNumber(user.whatsappNumber || '');
      setEmail(user.email || '');
      setProfilePic(user.profilePicture || '');

      if (user.shippingAddress) {
        setStreet(user.shippingAddress.street || '');
        setCity(user.shippingAddress.city || '');
        setState(user.shippingAddress.state || '');
        setZip(user.shippingAddress.zip || '');
        setCountry(user.shippingAddress.country || '');
      }
    }
  }, [user]);

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

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPic(true);
      const sigRes = await axios.get('/api/uploads/signature?folder=artopus/users');
      const { signature, timestamp, apiKey, cloudName } = sigRes.data;

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('signature', signature);
      uploadData.append('timestamp', timestamp.toString());
      uploadData.append('api_key', apiKey);
      uploadData.append('folder', 'artopus/users');

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        uploadData
      );

      const newPicUrl = uploadRes.data.secure_url;
      setProfilePic(newPicUrl);
      
      await axios.patch('/api/auth/profile', { profilePicture: newPicUrl });
      toast.success('Profile picture updated successfully!');
      
      // Reload profile
      if (auth?.fetchUser) await auth.fetchUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      setProfilePic('');
      await axios.patch('/api/auth/profile', { profilePicture: '' });
      toast.success('Profile picture removed!');
      if (auth?.fetchUser) await auth.fetchUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete profile picture');
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const payload: any = {
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone,
        whatsappNumber,
        gender: gender === 'Select' ? '' : gender,
      };
      if (password.trim()) {
        payload.password = password;
      }
      await axios.patch('/api/auth/profile', payload);
      toast.success('Details updated successfully!');
      setPassword('');
      if (auth?.fetchUser) await auth.fetchUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update details');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await axios.patch('/api/auth/shipping-address', { street, city, state, zip, country });
      toast.success('Shipping address updated successfully!');
      if (auth?.fetchUser) await auth.fetchUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

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

  const getExistingReview = (productId: string, orderId: string) => 
    reviews.find((review) => review.product?._id === productId && review.order === orderId);

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

  const handleLogoutClick = () => {
    if (logout) {
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-500 mb-6">Please log in to view your profile.</p>
        <Link to="/login" className="btn-primary">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="container-custom max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-widest">
          <Link to="/" className="hover:text-logo-purple transition-colors">Home</Link>
          <span>&rarr;</span>
          <span className="text-gray-600 dark:text-gray-400">Account</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">My account</h1>
            
            <nav className="flex flex-col gap-2 mb-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-left transition-all ${
                  activeTab === 'details'
                    ? 'bg-white dark:bg-gray-900 text-logo-purple shadow-sm border border-gray-100 dark:border-gray-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <UserCheck size={18} />
                My details
              </button>
              
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-left transition-all ${
                  activeTab === 'wishlist'
                    ? 'bg-white dark:bg-gray-900 text-logo-purple shadow-sm border border-gray-100 dark:border-gray-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Heart size={18} />
                My wishlist
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-left transition-all ${
                  activeTab === 'orders'
                    ? 'bg-white dark:bg-gray-900 text-logo-purple shadow-sm border border-gray-100 dark:border-gray-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Package size={18} />
                My orders
              </button>

              <button
                onClick={() => setActiveTab('address')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-left transition-all ${
                  activeTab === 'address'
                    ? 'bg-white dark:bg-gray-900 text-logo-purple shadow-sm border border-gray-100 dark:border-gray-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MapPin size={18} />
                My address book
              </button>
            </nav>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-500 border-2 border-red-500/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>

          {/* Right Content Panel */}
          <div className="lg:col-span-9 bg-white dark:bg-gray-900 rounded-3xl p-8 lg:p-12 border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* TAB: My Details */}
            {activeTab === 'details' && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">My details</h2>
                
                {/* Profile Pic Section */}
                <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-gray-800">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-logo-purple/20 flex-shrink-0">
                    {profilePic ? (
                      <img src={getOptimizedImageUrl(profilePic)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-logo-purple font-black text-2xl uppercase">
                        {user.name ? user.name[0] : 'U'}
                      </div>
                    )}
                    {uploadingPic && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">
                        Uploading
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="cursor-pointer px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
                      <Upload size={14} />
                      Upload new picture
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} disabled={uploadingPic} />
                    </label>
                    {profilePic && (
                      <button
                        onClick={handleDeleteProfilePicture}
                        className="px-5 py-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 text-sm font-bold transition-all flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSaveDetails} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">First name</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Last name</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Gender</label>
                      <select
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="Select" disabled>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Phone number</label>
                      <input
                        type="tel"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email address</label>
                      <input
                        type="email"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-500 font-medium cursor-not-allowed outline-none"
                        value={email}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingDetails}
                    className="px-8 py-4 bg-logo-purple text-white rounded-2xl font-bold hover:bg-logo-purple/95 transition-all shadow-lg shadow-logo-purple/10 disabled:opacity-50"
                  >
                    {savingDetails ? 'Saving...' : 'Save my details'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: Wishlist */}
            {activeTab === 'wishlist' && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">My wishlist</h2>
                  <form onSubmit={handleCreateCollection} className="flex gap-2">
                    <input
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                      placeholder="New collection name"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                    />
                    <button className="px-5 py-2.5 bg-logo-purple text-white rounded-xl text-sm font-bold" type="submit">Create</button>
                  </form>
                </div>

                <div className="space-y-8">
                  {collections.map((collection) => (
                    <div key={collection._id} className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{collection.name}</h3>
                          <p className="text-xs text-gray-400">{collection.items.length} saved item{collection.items.length === 1 ? '' : 's'}</p>
                        </div>
                        {collection.isDefault && <span className="text-[10px] font-black bg-logo-purple/10 text-logo-purple px-3 py-1 rounded-full uppercase tracking-wider">Wishlist</span>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {collection.items.length > 0 ? collection.items.map((item) => (
                          <div key={item._id} className="flex gap-4 items-center p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <img src={getOptimizedImageUrl(item.imageUrl)} alt={item.title} className="w-16 h-16 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${item._id}`} className="font-bold text-gray-900 dark:text-white hover:text-logo-purple line-clamp-1">{item.title}</Link>
                              <p className="text-xs text-gray-400">{item.artistName || 'Artist'}</p>
                              <p className="font-bold text-logo-purple text-sm mt-0.5">₹{item.price.toFixed(2)}</p>
                            </div>
                            <button
                              type="button"
                              className="text-xs text-red-500 font-bold hover:underline"
                              onClick={() => removeFromCollection(collection._id, item._id)}
                            >
                              Remove
                            </button>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-400">No saved items yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: My Orders */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">My orders</h2>
                
                {loading ? (
                  <div className="py-12 text-center text-gray-400">Loading orders...</div>
                ) : orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order._id} className="order-item p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                        <div className="flex flex-wrap gap-4 justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-800">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order ID</p>
                            <p className="font-mono text-sm text-gray-900 dark:text-white">#{order._id}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-logo-purple/10 text-logo-purple uppercase tracking-wider">
                              {order.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          {order.trackingUrl && (
                            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-logo-purple text-white text-xs font-bold rounded-full">
                              Track Shipment
                            </a>
                          )}
                        </div>

                        <div className="order-items space-y-4 mt-6">
                          {order.items.map((item, index) => {
                            const existingReview = getExistingReview(item.productId, order._id);
                            const draftKey = `${order._id}-${item.productId}`;
                            const draft = reviewDrafts[draftKey] || { rating: 5, title: '', comment: '' };

                            return (
                              <div key={index} className="order-item-detail p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <span className="font-bold text-gray-900 dark:text-white">{item.title}</span>
                                    {item.buyerOptionLabel && <p className="text-xs text-gray-400">{item.buyerOptionLabel}</p>}
                                  </div>
                                  <span className="font-bold text-logo-purple">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>

                                {existingReview ? (
                                  <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-sm">
                                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                                      <Star size={14} className="fill-yellow-500" />
                                      <span className="font-bold text-gray-900 dark:text-white">{existingReview.rating} / 5</span>
                                    </div>
                                    <p className="font-bold text-gray-700 dark:text-gray-300">{existingReview.title}</p>
                                    {existingReview.comment && <p className="text-gray-500 mt-1">{existingReview.comment}</p>}
                                  </div>
                                ) : (
                                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Leave Feedback</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <select
                                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                                        value={draft.rating}
                                        onChange={(e) => setReviewDrafts({ ...reviewDrafts, [draftKey]: { ...draft, rating: Number(e.target.value) } })}
                                      >
                                        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} Stars</option>)}
                                      </select>
                                      <input
                                        className="md:col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                                        placeholder="Review Title"
                                        value={draft.title}
                                        onChange={(e) => setReviewDrafts({ ...reviewDrafts, [draftKey]: { ...draft, title: e.target.value } })}
                                      />
                                    </div>
                                    <textarea
                                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm min-h-20 focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                                      placeholder="Share your experience with this artwork..."
                                      value={draft.comment}
                                      onChange={(e) => setReviewDrafts({ ...reviewDrafts, [draftKey]: { ...draft, comment: e.target.value } })}
                                    />
                                    <button
                                      className="px-5 py-2.5 bg-logo-purple text-white text-xs font-bold rounded-xl"
                                      type="button"
                                      onClick={() => submitReview(item.productId, order._id)}
                                    >
                                      Submit Feedback
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-bold">Total Amount</span>
                          <span className="text-xl font-black text-logo-purple">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">No orders placed yet.</p>
                )}
              </div>
            )}

            {/* TAB: Address Book */}
            {activeTab === 'address' && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">My address book</h2>
                
                <form onSubmit={handleSaveAddress} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                      placeholder="Street, apartment, floor, suite"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">State / Province</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ZIP / Postal Code</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Country</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white font-medium focus:ring-2 focus:ring-logo-purple/20 focus:border-logo-purple outline-none"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="px-8 py-4 bg-logo-purple text-white rounded-2xl font-bold hover:bg-logo-purple/95 transition-all shadow-lg shadow-logo-purple/10 disabled:opacity-50"
                  >
                    {savingAddress ? 'Saving...' : 'Save address details'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
