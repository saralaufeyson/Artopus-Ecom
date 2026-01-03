import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
 

interface Metrics {
  products: number;
  orders: number;
  users: number;
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
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    title: '', price: '', description: '', category: '', type: '', image: null as File | null, imageUrl: '', imageSource: 'upload' as 'upload' | 'url'
  });
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  const fetchData = async () => {
    try {
      const [prodRes, ordRes, metRes, userRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/admin/orders'),
        axios.get('/api/metrics'),
        axios.get('/api/admin/users')
      ]);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
      setMetrics(metRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate image source
    if (newProduct.imageSource === 'upload' && !newProduct.image) {
      return toast.error("Please upload an image");
    }
    if (newProduct.imageSource === 'url' && !newProduct.imageUrl.trim()) {
      return toast.error("Please enter an image URL");
    }

    try {
      if (newProduct.imageSource === 'upload') {
        // File upload
        const formData = new FormData();
        formData.append('title', newProduct.title);
        formData.append('price', newProduct.price);
        formData.append('description', newProduct.description);
        formData.append('category', newProduct.category);
        formData.append('type', newProduct.type);
        formData.append('image', newProduct.image!);

        await axios.post('/api/products', formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
      } else {
        // URL input
        await axios.post('/api/products', {
          title: newProduct.title,
          price: newProduct.price,
          description: newProduct.description,
          category: newProduct.category,
          type: newProduct.type,
          imageUrl: newProduct.imageUrl
        });
      }
      
      toast.success('Product added successfully!');
      fetchData(); // Refresh all data
      setNewProduct({ title: '', price: '', description: '', category: '', type: '', image: null, imageUrl: '', imageSource: 'upload' });
    } catch (err) {
      toast.error('Failed to add product');
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
        imageUrl: editingProduct.imageUrl
      });
      toast.success('Product updated successfully!');
      fetchData();
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
      fetchData();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('/api/admin/users', newAdmin);
      toast.success('Admin created successfully!');
      fetchData();
      setNewAdmin({ name: '', email: '', password: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, { role: newRole });
      toast.success('User role updated successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      // Correct endpoint: PATCH /api/admin/orders/:id/status
      await axios.patch(`/api/admin/orders/${id}/status`, { status });
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
          <button onClick={() => setActiveTab('inventory')} className={`admin-nav-button ${activeTab === 'inventory' ? 'active' : ''}`}>Inventory</button>
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

        {activeTab === 'inventory' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Inventory Management</h3>
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

            <h4 className="admin-sub-title">Upload New Artwork/Item</h4>
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-row">
                <input type="text" placeholder="Title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} required />
                <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
              </div>
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} required />
              <div className="form-row">
                <input type="text" placeholder="Category (e.g., Sticker, Painting)" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required />
                <select value={newProduct.type} onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })} required>
                  <option value="">Select Type</option>
                  <option value="original-artwork">Original Artwork</option>
                  <option value="merchandise">Merchandise</option>
                </select>
              </div>
              
              {/* Image Source Selection */}
              <div className="image-source-selection">
                <label>
                  <input 
                    type="radio" 
                    value="upload" 
                    checked={newProduct.imageSource === 'upload'} 
                    onChange={(e) => setNewProduct({ ...newProduct, imageSource: e.target.value as 'upload' | 'url', imageUrl: '', image: null })} 
                  />
                  Upload Image File
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="url" 
                    checked={newProduct.imageSource === 'url'} 
                    onChange={(e) => setNewProduct({ ...newProduct, imageSource: e.target.value as 'upload' | 'url', image: null, imageUrl: '' })} 
                  />
                  Image URL
                </label>
              </div>
              
              {/* Conditional Image Input */}
              {newProduct.imageSource === 'upload' ? (
                <input type="file" onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files ? e.target.files[0] : null })} required />
              ) : (
                <input 
                  type="url" 
                  placeholder="Image URL (e.g., https://example.com/image.jpg)" 
                  value={newProduct.imageUrl} 
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} 
                  required 
                />
              )}
              
              <button type="submit" className="admin-button">Create Product Listing</button>
            </form>

            {editingProduct && (
              <>
                <h4 className="admin-sub-title">Edit Product: {editingProduct.title}</h4>
                <form onSubmit={handleEditProduct} className="product-form">
                  <div className="form-row">
                    <input 
                      type="text" 
                      placeholder="Title" 
                      value={editingProduct.title} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} 
                      required 
                    />
                    <input 
                      type="number" 
                      placeholder="Price" 
                      value={editingProduct.price} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} 
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
                      type="text" 
                      placeholder="Category (e.g., Sticker, Painting)" 
                      value={editingProduct.category} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} 
                      required 
                    />
                    <select 
                      value={editingProduct.type} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })} 
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="original-artwork">Original Artwork</option>
                      <option value="merchandise">Merchandise</option>
                    </select>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Stock Quantity" 
                    value={editingProduct.stockQuantity || 0} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })} 
                  />
                  <input 
                    type="url" 
                    placeholder="Image URL" 
                    value={editingProduct.imageUrl || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} 
                  />
                  
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
              </>
            )}
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