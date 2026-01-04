import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
 

interface Metrics {
  products: number;
  orders: number;
  users: number;
}

interface Artist {
  _id: string;
  artistName: string;
  email: string;
  penName?: string;
  bio?: string;
  isActive: boolean;
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
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    title: '', price: '', description: '', category: '', type: '', imageUrl: '',
    artistId: '', artistName: '', artistEmail: '',
    medium: '', dimensions: '', year: ''
  });
  const [newArtist, setNewArtist] = useState({ artistName: '', email: '', penName: '', bio: '', profileImage: '' });
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

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

      await Promise.allSettled([
        fetchProducts(),
        fetchOrders(),
        fetchMetrics(),
        fetchUsers(),
        fetchArtists()
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
    
    // Validate image URL
    if (!newProduct.imageUrl.trim()) {
      return toast.error("Please enter an image URL");
    }

    try {
      await axios.post('/api/products', {
        title: newProduct.title,
        price: newProduct.price,
        description: newProduct.description,
        category: newProduct.category,
        type: newProduct.type,
        imageUrl: newProduct.imageUrl,
        artistId: newProduct.artistId,
        artistName: newProduct.artistName,
        artistEmail: newProduct.artistEmail,
        medium: newProduct.medium,
        dimensions: newProduct.dimensions,
        year: newProduct.year
      });
      
      toast.success('Product added successfully!');
      await fetchData(); // Refresh all data
      setNewProduct({ 
        title: '', price: '', description: '', category: '', type: '', 
        imageUrl: '',
        artistId: '', artistName: '', artistEmail: '',
        medium: '', dimensions: '', year: ''
      });
    } catch (err) {
      toast.error('Failed to add product');
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

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await axios.put(`/api/products/${editingProduct._id}`, {
        title: editingProduct.title,
        price: editingProduct.price,
        description: editingProduct.description,
        category: editingProduct.category,
        type: editingProduct.type,
        stockQuantity: editingProduct.stockQuantity,
        imageUrl: editingProduct.imageUrl,
        medium: editingProduct.medium,
        dimensions: editingProduct.dimensions,
        year: editingProduct.year
      });
      toast.success('Product updated successfully!');
      await fetchData();
      setEditingProduct(null);
    } catch (err) {
      toast.error('Failed to update product');
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

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      // Correct endpoint: PATCH /api/orders/admin/orders/:id/status
      await axios.patch(`/api/orders/admin/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      setOrders(orders.map(order => (order._id === id ? { ...order, status } : order)));
    } catch (err) {
      toast.error('Failed to update status');
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
          <button onClick={() => setActiveTab('add-artist')} className={`admin-nav-button ${activeTab === 'add-artist' ? 'active' : ''}`}>Add Artist</button>
          <button onClick={() => setActiveTab('orders')} className={`admin-nav-button ${activeTab === 'orders' ? 'active' : ''}`}>Customer Orders</button>
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
                      <td>{p.stockQuantity}</td>
                      <td>${p.price}</td>
                      <td>
                        <button 
                          onClick={() => setEditingProduct(p)} 
                          className="action-btn edit-btn"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p._id)} 
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
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
                      placeholder="Title" 
                      value={editingProduct.title} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} 
                      required 
                    />
                  </div>
                  <textarea 
                    placeholder="Description" 
                    value={editingProduct.description} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} 
                    required 
                  />
                  <div className="form-row">
                    <input 
                      type="number" 
                      placeholder="Price" 
                      value={editingProduct.price} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} 
                      required 
                    />
                    <input 
                      type="text" 
                      placeholder="Category (e.g., Sticker, Painting)" 
                      value={editingProduct.category} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-row">
                    <select 
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
                      placeholder="Stock Quantity" 
                      value={editingProduct.stockQuantity || 0} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                  <input 
                    type="url" 
                    placeholder="Image URL" 
                    value={editingProduct.imageUrl || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} 
                  />
                  <div className="form-row">
                    <input 
                      type="text" 
                      placeholder="Medium (e.g. Oil on Canvas)" 
                      value={editingProduct.medium || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, medium: e.target.value })} 
                    />
                    <input 
                      type="text" 
                      placeholder='Dimensions (e.g. 24" x 36")' 
                      value={editingProduct.dimensions || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })} 
                    />
                    <input 
                      type="text" 
                      placeholder="Year" 
                      value={editingProduct.year || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, year: e.target.value })} 
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="admin-button">Update Product</button>
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
                <input type="text" placeholder="Title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} required />
              </div>
              <div className="form-row">
                <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                <input type="text" placeholder="Category (e.g., Sticker, Painting)" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required />
              </div>
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} required />
              <select value={newProduct.type} onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="original-artwork">Original Artwork</option>
                <option value="merchandise">Merchandise</option>
              </select>
              
              <input 
                type="url" 
                placeholder="Image URL (e.g., https://example.com/image.jpg)" 
                value={newProduct.imageUrl} 
                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} 
                required 
              />
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="Medium (e.g. Oil on Canvas)" 
                  value={newProduct.medium} 
                  onChange={(e) => setNewProduct({ ...newProduct, medium: e.target.value })} 
                />
                <input 
                  type="text" 
                  placeholder='Dimensions (e.g. 24" x 36")' 
                  value={newProduct.dimensions} 
                  onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })} 
                />
                <input 
                  type="text" 
                  placeholder="Year" 
                  value={newProduct.year} 
                  onChange={(e) => setNewProduct({ ...newProduct, year: e.target.value })} 
                />
              </div>
              
              <button type="submit" className="admin-button">Create Product Listing</button>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map(a => (
                    <tr key={a._id} style={{ opacity: a.isActive ? 1 : 0.5 }}>
                      <td>{a.artistName}</td>
                      <td>{a.email}</td>
                      <td>{a.penName || '-'}</td>
                      <td>
                        {a.isActive ? (
                          <button onClick={() => handleDeleteArtist(a._id)} className="action-btn delete-btn">Deactivate</button>
                        ) : (
                          <span className="text-gray-400">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'add-artist' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Create New Artist Profile</h3>
            <form onSubmit={handleAddArtist} className="product-form">
              <div className="form-row">
                <input type="text" placeholder="Artist Real Name" value={newArtist.artistName} onChange={(e) => setNewArtist({ ...newArtist, artistName: e.target.value })} required />
                <input type="email" placeholder="Artist Email" value={newArtist.email} onChange={(e) => setNewArtist({ ...newArtist, email: e.target.value })} required />
              </div>
              <div className="form-row">
                <input type="text" placeholder="Pen Name / Brand Name" value={newArtist.penName} onChange={(e) => setNewArtist({ ...newArtist, penName: e.target.value })} />
                <input type="url" placeholder="Profile Image URL" value={newArtist.profileImage} onChange={(e) => setNewArtist({ ...newArtist, profileImage: e.target.value })} />
              </div>
              <textarea placeholder="Artist Bio" value={newArtist.bio} onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })} />
              <button type="submit" className="admin-button">Create Artist Profile</button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Fulfillment Queue</h3>
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-info">
                    <p className="order-id">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="order-customer">Customer: {order.customer?.name} ({order.customer?.email})</p>
                    <p className="order-items">Items: {order.items.map((it: any) => `${it.quantity}x ${it.title}`).join(', ')}</p>
                    <p className="order-address">Address: {Object.values(order.shippingAddress).join(', ')}</p>
                  </div>
                  <div className="order-actions">
                    <p className="order-total">${order.totalAmount.toFixed(2)}</p>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)} 
                      className="status-select"
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

        {activeTab === 'admins' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Admin Management</h3>
            
            <div className="users-table-container">
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
                          className="role-select"
                        >
                          <option value="customer">Customer</option>
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

            <h4 className="admin-sub-title">Add New Admin</h4>
            <form onSubmit={handleAddAdmin} className="product-form">
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={newAdmin.name} 
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} 
                  required 
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={newAdmin.email} 
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} 
                  required 
                />
              </div>
              <input 
                type="password" 
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