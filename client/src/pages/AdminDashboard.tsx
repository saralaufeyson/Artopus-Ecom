import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
 

interface Metrics {
  products: number;
  orders: number;
  users: number;
  grossSales?: number;
  pageViews?: number;
  statusCounts?: Array<{ _id: string; count: number }>;
  lowStockProducts?: Array<{ _id: string; title: string; stockQuantity: number }>;
  walletTransactions?: Array<any>;
  monthlySales?: Array<{ _id: { year: number; month: number }; revenue: number; orders: number }>;
  topProducts?: Array<{ _id: string; title: string; unitsSold: number; revenue: number }>;
  topViewedProducts?: Array<{ _id: string; title: string; views: number }>;
  savedCollections?: number;
  averageOrderValue?: number;
  conversionRate?: number;
}

interface Artist {
  _id: string;
  artistName: string;
  email: string;
  penName?: string;
  bio?: string;
  isActive: boolean;
  walletBalance?: number;
  totalWithdrawn?: number;
}

interface ArtistRequest {
  _id: string;
  artistName: string;
  penName?: string;
  email: string;
  bio: string;
  portfolioLink?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [activeTab, setActiveTab] = useState('metrics');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistRequests, setArtistRequests] = useState<ArtistRequest[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ 
    title: '', price: '', description: '', category: '', type: '', imageUrl: '',
    artistId: '', artistName: '', artistEmail: '',
    medium: '', dimensions: '', year: ''
  });
  const [newArtist, setNewArtist] = useState({ artistName: '', email: '', penName: '', bio: '', profileImage: '' });
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [editingProductImage, setEditingProductImage] = useState<File | null>(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [payoutArtistId, setPayoutArtistId] = useState<string | null>(null);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, { deliveryPartner: string; trackingNumber: string; trackingUrl: string; note: string }>>({});

  const fetchData = async () => {
    try {
      // Individual try-catch for each request to ensure partial data still loads
      const fetchProducts = async () => {
        try {
          const res = await axios.get('/api/products/admin');
          setProducts(res.data);
        } catch (err) {
          console.error('Failed to fetch products:', err);
          toast.error('Could not load products');
        }
      };

      const fetchOrders = async () => {
        try {
          const res = await axios.get('/api/orders/admin/orders');
          setOrders(res.data);
        } catch (err) {
          console.error('Failed to fetch orders:', err);
          toast.error('Could not load orders');
        }
      };

      const fetchMetrics = async () => {
        try {
          const res = await axios.get('/api/metrics');
          setMetrics(res.data);
        } catch (err) {
          console.error('Failed to fetch metrics:', err);
        }
      };

      const fetchWithdrawals = async () => {
        try {
          const res = await axios.get('/api/admin/withdrawals');
          setWithdrawals(res.data);
        } catch (err) {
          console.error('Failed to fetch withdrawals:', err);
        }
      };

      const fetchUsers = async () => {
        try {
          const res = await axios.get('/api/admin/users');
          setUsers(res.data);
        } catch (err) {
          console.error('Failed to fetch users:', err);
          toast.error('Could not load users');
        }
      };

      const fetchArtists = async () => {
        try {
          const res = await axios.get('/api/artists');
          setArtists(res.data);
        } catch (err) {
          console.error('Failed to fetch artists:', err);
          toast.error('Could not load artists');
        }
      };

      const fetchArtistRequests = async () => {
        try {
          const res = await axios.get('/api/artist-requests');
          setArtistRequests(res.data);
        } catch (err) {
          console.error('Failed to fetch artist requests:', err);
        }
      };

      await Promise.allSettled([
        fetchProducts(),
        fetchOrders(),
        fetchMetrics(),
        fetchWithdrawals(),
        fetchUsers(),
        fetchArtists(),
        fetchArtistRequests()
      ]);
    } catch (err) {
      console.error('General error in fetchData:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate image (either file or URL)
    if (!newProductImage && !newProduct.imageUrl.trim()) {
      return toast.error("Please upload an image or enter an image URL");
    }

    // Validate file size if image is selected
    if (newProductImage && newProductImage.size > 2 * 1024 * 1024) {
      return toast.error("Image file size must be less than 2MB");
    }

    setIsAddingProduct(true);
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });
      
      if (newProductImage) {
        formData.append('image', newProductImage);
      }

      await axios.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Product added successfully!');
      await fetchData(); // Refresh all data
      setNewProduct({ 
        title: '', price: '', description: '', category: '', type: '', 
        imageUrl: '',
        artistId: '', artistName: '', artistEmail: '',
        medium: '', dimensions: '', year: ''
      });
      setNewProductImage(null);
    } catch (err: any) {
      if (err.response?.data?.message?.includes('File too large')) {
        toast.error('Image file size must be less than 2MB');
      } else {
        toast.error('Failed to add product');
      }
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/artists', newArtist);
      toast.success('Artist profile created!');
      await fetchData();
      setNewArtist({ artistName: '', email: '', penName: '', bio: '', profileImage: '' });
    } catch (err) {
      toast.error('Failed to create artist');
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (!window.confirm('Deactivate this artist profile?')) return;
    try {
      await axios.delete(`/api/artists/${id}`);
      toast.success('Artist deactivated');
      await fetchData();
    } catch (err) {
      toast.error('Failed to deactivate artist');
    }
  };

  const handleArtistPayout = async (artist: Artist) => {
    const balance = Number(artist.walletBalance || 0);
    if (balance <= 0) {
      toast.error('This artist has no wallet balance to pay out');
      return;
    }

    if (!window.confirm(`Pay out $${balance.toFixed(2)} to ${artist.artistName} and reset their wallet to zero?`)) return;

    setPayoutArtistId(artist._id);
    try {
      await axios.post(`/api/admin/artists/${artist._id}/payout`);
      toast.success(`Payment Success logged for ${artist.artistName}`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process artist payout');
    } finally {
      setPayoutArtistId(null);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Validate file size if image is selected
    if (editingProductImage && editingProductImage.size > 2 * 1024 * 1024) {
      return toast.error("Image file size must be less than 2MB");
    }

    setIsEditingProduct(true);
    try {
      const formData = new FormData();
      Object.entries(editingProduct).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      if (editingProductImage) {
        formData.append('image', editingProductImage);
      }

      await axios.put(`/api/products/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product updated successfully!');
      await fetchData();
      setEditingProduct(null);
      setEditingProductImage(null);
    } catch (err: any) {
      if (err.response?.data?.message?.includes('File too large')) {
        toast.error('Image file size must be less than 2MB');
      } else {
        toast.error('Failed to update product');
      }
    } finally {
      setIsEditingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully!');
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('/api/admin/users', newAdmin);
      toast.success('Admin created successfully!');
      await fetchData();
      setNewAdmin({ name: '', email: '', password: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, { role: newRole });
      toast.success('User role updated successfully!');
      await fetchData();
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const handleApproveArtist = async (requestId: string) => {
    try {
      await axios.post(`/api/artist-requests/${requestId}/approve`);
      toast.success('Artist request approved!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectArtist = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await axios.post(`/api/artist-requests/${requestId}/reject`);
      toast.success('Artist request rejected');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully!');
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const updateProductApproval = async (productId: string, approvalStatus: 'approved' | 'pending' | 'rejected') => {
    try {
      await axios.patch(`/api/products/${productId}/approval`, { approvalStatus });
      toast.success(`Product marked as ${approvalStatus}`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update approval status');
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/orders/admin/orders/${id}/status`, {
        status,
        ...(orderDrafts[id] || {}),
      });
      toast.success(`Order marked as ${status}`);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleWithdrawalDecision = async (withdrawalId: string, action: 'approve' | 'reject') => {
    try {
      await axios.post(`/api/admin/withdrawals/${withdrawalId}/${action}`, {});
      toast.success(`Withdrawal ${action}d`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} withdrawal`);
    }
  };

  if (user?.role !== 'admin') return <div className="access-denied">Access Denied</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin Center</h2>
        <nav className="admin-nav">
          <button onClick={() => setActiveTab('metrics')} className={`admin-nav-button ${activeTab === 'metrics' ? 'active' : ''}`}>Summary</button>
          <button onClick={() => setActiveTab('view-products')} className={`admin-nav-button ${activeTab === 'view-products' ? 'active' : ''}`}>Products</button>
          <button onClick={() => setActiveTab('add-product')} className={`admin-nav-button ${activeTab === 'add-product' ? 'active' : ''}`}>Add Product</button>
          <button onClick={() => setActiveTab('view-artists')} className={`admin-nav-button ${activeTab === 'view-artists' ? 'active' : ''}`}>Artists</button>
          <button onClick={() => setActiveTab('artist-requests')} className={`admin-nav-button ${activeTab === 'artist-requests' ? 'active' : ''}`}>
            Artist Requests
            {artistRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-logo-purple text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {artistRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('add-artist')} className={`admin-nav-button ${activeTab === 'add-artist' ? 'active' : ''}`}>Add Artist</button>
          <button onClick={() => setActiveTab('orders')} className={`admin-nav-button ${activeTab === 'orders' ? 'active' : ''}`}>Customer Orders</button>
          <button onClick={() => setActiveTab('withdrawals')} className={`admin-nav-button ${activeTab === 'withdrawals' ? 'active' : ''}`}>Payouts</button>
          <button onClick={() => setActiveTab('admins')} className={`admin-nav-button ${activeTab === 'admins' ? 'active' : ''}`}>Admin Management</button>
        </nav>
      </div>

      <div className="admin-main">
        {activeTab === 'metrics' && metrics && (
          <div className="admin-section">
            <h3 className="admin-section-title">Store Overview</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <p className="metric-label">Total Products</p>
                <p className="metric-value">{metrics.products}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Total Orders</p>
                <p className="metric-value">{metrics.orders}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Registered Users</p>
                <p className="metric-value">{metrics.users}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Gross Sales</p>
                <p className="metric-value">${(metrics.grossSales || 0).toFixed(2)}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Page Views</p>
                <p className="metric-value">{metrics.pageViews || 0}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Avg Order Value</p>
                <p className="metric-value">${(metrics.averageOrderValue || 0).toFixed(2)}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Conversion Rate</p>
                <p className="metric-value">{metrics.conversionRate || 0}%</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Saved Collections</p>
                <p className="metric-value">{metrics.savedCollections || 0}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <h4 className="admin-sub-title mb-4">Sales Trend</h4>
                <div className="space-y-3">
                  {(metrics.monthlySales || []).slice(-6).map((entry) => (
                    <div key={`${entry._id.year}-${entry._id.month}`} className="flex items-center justify-between">
                      <span>{entry._id.month}/{entry._id.year}</span>
                      <span className="font-bold">${entry.revenue.toFixed(2)} · {entry.orders} orders</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <h4 className="admin-sub-title mb-4">Low Stock Alerts</h4>
                <div className="space-y-3">
                  {(metrics.lowStockProducts || []).map((product) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <span>{product.title}</span>
                      <span className="font-bold">{product.stockQuantity} left</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <h4 className="admin-sub-title mb-4">Top Selling Products</h4>
                <div className="space-y-3">
                  {(metrics.topProducts || []).map((product) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <span>{product.title}</span>
                      <span className="font-bold">{product.unitsSold} sold · ${product.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <h4 className="admin-sub-title mb-4">Most Viewed Products</h4>
                <div className="space-y-3">
                  {(metrics.topViewedProducts || []).map((product) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <span>{product.title}</span>
                      <span className="font-bold">{product.views} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
              <h4 className="admin-sub-title mb-4">Financial History</h4>
              <div className="space-y-3">
                {(metrics.walletTransactions || []).map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                    <div>
                      <p className="font-bold capitalize">{entry.type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-500">{entry.artist?.artistName || 'Artist'} {entry.order?._id ? `· Order ${entry.order._id.slice(-6).toUpperCase()}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${entry.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{entry.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'view-products' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Product Inventory</h3>
            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Item Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>{p.title}</td>
                      <td className="capitalize">{p.type.replace('-', ' ')}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          p.approvalStatus === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : p.approvalStatus === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.approvalStatus || 'approved'}
                        </span>
                      </td>
                      <td>{p.stockQuantity}</td>
                      <td>${p.price}</td>
                      <td>
                        <button 
                          onClick={() => setEditingProduct(p)} 
                          className="action-btn edit-btn mr-2"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p._id)} 
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
                        {p.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => updateProductApproval(p._id, 'approved')}
                            className="action-btn edit-btn ml-2"
                          >
                            Approve
                          </button>
                        )}
                        {p.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => updateProductApproval(p._id, 'rejected')}
                            className="action-btn delete-btn ml-2"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingProduct && (
              <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h4 className="admin-sub-title">Edit Product: {editingProduct.title}</h4>
                <form onSubmit={handleEditProduct} className="product-form">
                  <div className="form-row">
                    <select 
                      className="form-select"
                      value={editingProduct.artistId || ''} 
                      onChange={(e) => {
                        const selected = artists.find(a => a._id === e.target.value);
                        setEditingProduct({ 
                          ...editingProduct, 
                          artistId: e.target.value,
                          artistName: selected?.artistName || '',
                          artistEmail: selected?.email || ''
                        });
                      }} 
                      required
                    >
                      <option value="">Select Artist</option>
                      {artists.map(a => (
                        <option key={a._id} value={a._id}>{a.artistName}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      className="admin-input"
                      placeholder="Title" 
                      value={editingProduct.title} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} 
                      required 
                    />
                  </div>
                  <textarea 
                    className="admin-input"
                    placeholder="Description" 
                    value={editingProduct.description} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} 
                    required 
                    rows={4}
                  />
                  <div className="form-row">
                    <input 
                      type="number" 
                      className="admin-input"
                      placeholder="Price" 
                      value={editingProduct.price} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} 
                      required 
                    />
                    <input 
                      type="text" 
                      className="admin-input"
                      placeholder="Category (e.g., Sticker, Painting)" 
                      value={editingProduct.category} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-row">
                    <select 
                      className="form-select"
                      value={editingProduct.type} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })} 
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="original-artwork">Original Artwork</option>
                      <option value="merchandise">Merchandise</option>
                    </select>
                    <input 
                      type="number" 
                      className="admin-input"
                      placeholder="Stock Quantity" 
                      value={editingProduct.stockQuantity || 0} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                  <div className="form-row">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload New Image</label>
                      <input 
                        type="file" 
                        className="admin-input pt-2"
                        accept="image/*"
                        onChange={(e) => setEditingProductImage(e.target.files?.[0] || null)} 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Or Image URL</label>
                      <input 
                        type="url" 
                        className="admin-input"
                        placeholder="Image URL" 
                        value={editingProduct.imageUrl || ''} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <input 
                      type="text" 
                      className="admin-input"
                      placeholder="Medium (e.g. Oil on Canvas)" 
                      value={editingProduct.medium || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, medium: e.target.value })} 
                    />
                    <input 
                      type="text" 
                      className="admin-input"
                      placeholder='Dimensions (e.g. 24" x 36")' 
                      value={editingProduct.dimensions || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })} 
                    />
                    <input 
                      type="text" 
                      className="admin-input"
                      placeholder="Year" 
                      value={editingProduct.year || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, year: e.target.value })} 
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="admin-button" disabled={isEditingProduct}>
                      {isEditingProduct ? 'Updating...' : 'Update Product'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditingProduct(null)} 
                      className="admin-button cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-product' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Create New Product</h3>
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-row">
                <select 
                  className="form-select"
                  value={newProduct.artistId} 
                  onChange={(e) => {
                    const selected = artists.find(a => a._id === e.target.value);
                    setNewProduct({ 
                      ...newProduct, 
                      artistId: e.target.value,
                      artistName: selected?.artistName || '',
                      artistEmail: selected?.email || ''
                    });
                  }} 
                  required
                >
                  <option value="">Select Artist</option>
                  {artists.map(a => (
                    <option key={a._id} value={a._id}>{a.artistName}</option>
                  ))}
                </select>
                <input type="text" className="admin-input" placeholder="Title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} required />
              </div>
              <div className="form-row">
                <input type="number" className="admin-input" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                <input type="text" className="admin-input" placeholder="Category (e.g., Sticker, Painting)" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required />
              </div>
              <textarea className="admin-input" placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} required rows={4} />
              <select className="form-select" value={newProduct.type} onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="original-artwork">Original Artwork</option>
                <option value="merchandise">Merchandise</option>
              </select>
              
              <div className="form-row">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Product Image</label>
                  <input 
                    type="file" 
                    className="admin-input pt-2"
                    accept="image/*"
                    onChange={(e) => setNewProductImage(e.target.files?.[0] || null)} 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Or Image URL</label>
                  <input 
                    type="url" 
                    className="admin-input"
                    placeholder="Image URL (e.g., https://example.com/image.jpg)" 
                    value={newProduct.imageUrl} 
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} 
                  />
                </div>
              </div>
              <div className="form-row">
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="Medium (e.g. Oil on Canvas)" 
                  value={newProduct.medium} 
                  onChange={(e) => setNewProduct({ ...newProduct, medium: e.target.value })} 
                />
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder='Dimensions (e.g. 24" x 36")' 
                  value={newProduct.dimensions} 
                  onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })} 
                />
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="Year" 
                  value={newProduct.year} 
                  onChange={(e) => setNewProduct({ ...newProduct, year: e.target.value })} 
                />
              </div>
              
              <button type="submit" className="admin-button" disabled={isAddingProduct}>
                {isAddingProduct ? 'Uploading...' : 'Create Product Listing'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'view-artists' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Artist Management</h3>
            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Artist Name</th>
                    <th>Email</th>
                    <th>Pen Name</th>
                    <th>Wallet Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map(a => (
                    <tr key={a._id} style={{ opacity: a.isActive ? 1 : 0.5 }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span>{a.artistName}</span>
                          {a.isActive && (
                            <button
                              onClick={() => handleArtistPayout(a)}
                              className="action-btn edit-btn"
                              disabled={payoutArtistId === a._id || Number(a.walletBalance || 0) <= 0}
                            >
                              {payoutArtistId === a._id ? 'Paying...' : 'Payout'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{a.email}</td>
                      <td>{a.penName || '-'}</td>
                      <td>${Number(a.walletBalance || 0).toFixed(2)}</td>
                      <td>
                        {a.isActive ? (
                          <button onClick={() => handleDeleteArtist(a._id)} className="action-btn delete-btn">Deactivate</button>
                        ) : (
                          <span className="text-gray-400 font-bold">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'artist-requests' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Artist Application Requests</h3>
            <div className="space-y-6">
              {artistRequests.length === 0 ? (
                <p className="text-gray-500 italic">No artist requests found.</p>
              ) : (
                artistRequests.map(req => (
                  <div key={req._id} className={`p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 ${req.status === 'pending' ? 'border-logo-purple/20' : 'border-gray-100 dark:border-gray-700 opacity-75'}`}>
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{req.artistName} {req.penName && <span className="text-sm font-normal text-gray-500">({req.penName})</span>}</h4>
                        <p className="text-logo-purple font-medium">{req.email}</p>
                        <p className="text-sm text-gray-500">Applied on: {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bio:</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">{req.bio}</p>
                    </div>

                    {req.portfolioLink && (
                      <div className="mb-4">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Portfolio:</p>
                        <a href={req.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm break-all">{req.portfolioLink}</a>
                      </div>
                    )}

                    {req.socialLinks && Object.values(req.socialLinks).some(v => !!v) && (
                      <div className="mb-6 flex flex-wrap gap-4">
                        {req.socialLinks.instagram && <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded">IG: {req.socialLinks.instagram}</span>}
                        {req.socialLinks.website && <a href={req.socialLinks.website} target="_blank" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Website</a>}
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button 
                          onClick={() => handleApproveArtist(req._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                        >
                          Approve & Create Profile
                        </button>
                        <button 
                          onClick={() => handleRejectArtist(req._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-lg font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'add-artist' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Create New Artist Profile</h3>
            <form onSubmit={handleAddArtist} className="product-form">
              <div className="form-row">
                <input type="text" className="admin-input" placeholder="Artist Real Name" value={newArtist.artistName} onChange={(e) => setNewArtist({ ...newArtist, artistName: e.target.value })} required />
                <input type="email" className="admin-input" placeholder="Artist Email" value={newArtist.email} onChange={(e) => setNewArtist({ ...newArtist, email: e.target.value })} required />
              </div>
              <div className="form-row">
                <input type="text" className="admin-input" placeholder="Pen Name / Brand Name" value={newArtist.penName} onChange={(e) => setNewArtist({ ...newArtist, penName: e.target.value })} />
                <input type="url" className="admin-input" placeholder="Profile Image URL" value={newArtist.profileImage} onChange={(e) => setNewArtist({ ...newArtist, profileImage: e.target.value })} />
              </div>
              <textarea className="admin-input" placeholder="Artist Bio" value={newArtist.bio} onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })} rows={4} />
              <button type="submit" className="admin-button">Create Artist Profile</button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Fulfillment Queue</h3>
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-gray-100 dark:border-gray-700 mb-6">
                  <div className="order-info">
                    <p className="order-id text-xl font-black text-logo-purple mb-2">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="order-customer font-bold text-gray-900 dark:text-white">Customer: {order.customer?.name} ({order.customer?.email})</p>
                    <p className="order-items text-gray-600 dark:text-gray-400 mt-2">Items: {order.items.map((it: any) => `${it.quantity}x ${it.title}`).join(', ')}</p>
                    <p className="order-address text-gray-600 dark:text-gray-400">Address: {Object.values(order.shippingAddress).join(', ')}</p>
                  </div>
                  <div className="order-actions mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="grid md:grid-cols-3 gap-3 flex-1">
                      <input
                        className="admin-input"
                        placeholder="Delivery partner"
                        value={orderDrafts[order._id]?.deliveryPartner || order.deliveryPartner || ''}
                        onChange={(e) => setOrderDrafts({
                          ...orderDrafts,
                          [order._id]: { ...(orderDrafts[order._id] || { deliveryPartner: '', trackingNumber: '', trackingUrl: '', note: '' }), deliveryPartner: e.target.value },
                        })}
                      />
                      <input
                        className="admin-input"
                        placeholder="Tracking number"
                        value={orderDrafts[order._id]?.trackingNumber || order.trackingNumber || ''}
                        onChange={(e) => setOrderDrafts({
                          ...orderDrafts,
                          [order._id]: { ...(orderDrafts[order._id] || { deliveryPartner: '', trackingNumber: '', trackingUrl: '', note: '' }), trackingNumber: e.target.value },
                        })}
                      />
                      <input
                        className="admin-input"
                        placeholder="Tracking URL"
                        value={orderDrafts[order._id]?.trackingUrl || order.trackingUrl || ''}
                        onChange={(e) => setOrderDrafts({
                          ...orderDrafts,
                          [order._id]: { ...(orderDrafts[order._id] || { deliveryPartner: '', trackingNumber: '', trackingUrl: '', note: '' }), trackingUrl: e.target.value },
                        })}
                      />
                    </div>
                    <p className="order-total text-2xl font-black text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)} 
                      className="form-select max-w-[200px]"
                    >
                      <option value="succeeded">Paid (Processing)</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Artist Payout Workflow</h3>
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal._id} className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-lg">{withdrawal.artist?.artistName || 'Artist'}</p>
                    <p className="text-sm text-gray-500">${withdrawal.amount.toFixed(2)} · {withdrawal.status}</p>
                    <p className="text-sm text-gray-500">{withdrawal.note || 'No note provided'}</p>
                    <p className="text-sm text-gray-500">Wallet balance: ${withdrawal.artist?.walletBalance?.toFixed?.(2) || '0.00'}</p>
                  </div>
                  <div className="flex gap-3">
                    {withdrawal.status === 'pending' ? (
                      <>
                        <button className="admin-button" onClick={() => handleWithdrawalDecision(withdrawal._id, 'approve')}>Approve payout</button>
                        <button className="admin-button cancel-btn" onClick={() => handleWithdrawalDecision(withdrawal._id, 'reject')}>Reject & refund</button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${
                        withdrawal.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {withdrawal.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Admin Management</h3>
            
            <div className="users-table-container mb-12">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select 
                          value={user.role} 
                          onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                          className="form-select py-2 px-4"
                        >
                          <option value="customer">Customer</option>
                          <option value="artist">Artist</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteUser(user._id)} 
                          className="action-btn delete-btn"
                          disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="admin-sub-title text-xl font-bold mb-6">Add New Admin</h4>
            <form onSubmit={handleAddAdmin} className="product-form">
              <div className="form-row">
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="Full Name" 
                  value={newAdmin.name} 
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} 
                  required 
                />
                <input 
                  type="email" 
                  className="admin-input"
                  placeholder="Email Address" 
                  value={newAdmin.email} 
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} 
                  required 
                />
              </div>
              <input 
                type="password" 
                className="admin-input"
                placeholder="Password" 
                value={newAdmin.password} 
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} 
                required 
              />
              <button type="submit" className="admin-button">Create Admin Account</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
