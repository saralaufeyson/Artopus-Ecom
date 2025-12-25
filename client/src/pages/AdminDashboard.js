import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', description: '', category: '', type: '', image: null });

  useEffect(() => {
    if (user?.role !== 'admin') return; // Redirect or show error if not admin
    const fetchData = async () => {
      try {
        const prodRes = await axios.get('/api/products');
        setProducts(prodRes.data);
        const ordRes = await axios.get('/api/admin/orders');
        setOrders(ordRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [user]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newProduct.title);
    formData.append('price', newProduct.price);
    formData.append('description', newProduct.description);
    formData.append('category', newProduct.category);
    formData.append('type', newProduct.type);
    formData.append('image', newProduct.image);
    try {
      await axios.post('/api/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      // Refresh products
      const res = await axios.get('/api/products');
      setProducts(res.data);
      setNewProduct({ title: '', price: '', description: '', category: '', type: '', image: null });
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/orders/${id}`, { status });
      setOrders(orders.map(order => order.id === id ? { ...order, status } : order));
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  if (user?.role !== 'admin') return <div>Access Denied</div>;

  return (
    <div className="flex">
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <button onClick={() => setActiveTab('inventory')} className="block mb-2">Inventory</button>
        <button onClick={() => setActiveTab('orders')} className="block">Orders</button>
      </div>
      <div className="flex-1 p-4">
        {activeTab === 'inventory' && (
          <>
            <h3 className="text-2xl font-bold mb-4">Inventory</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Title</th>
                  <th className="border border-gray-300 p-2">Stock</th>
                  <th className="border border-gray-300 p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="border border-gray-300 p-2">{product.title}</td>
                    <td className="border border-gray-300 p-2">{product.stockQuantity}</td>
                    <td className="border border-gray-300 p-2">${product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 className="text-xl font-bold mt-6 mb-4">Add New Product</h4>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" placeholder="Title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} className="w-full p-2 border rounded" required />
              <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full p-2 border rounded" required />
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full p-2 border rounded" required />
              <input type="text" placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full p-2 border rounded" required />
              <select value={newProduct.type} onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })} className="w-full p-2 border rounded" required>
                <option value="">Select Type</option>
                <option value="original-artwork">Original Artwork</option>
                <option value="merchandise">Merchandise</option>
              </select>
              <input type="file" onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })} className="w-full p-2 border rounded" required />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Product</button>
            </form>
          </>
        )}
        {activeTab === 'orders' && (
          <>
            <h3 className="text-2xl font-bold mb-4">Orders</h3>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border p-4 rounded">
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Items:</strong> {order.items.map(item => item.title).join(', ')}</p>
                  <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="mt-2 p-2 border rounded">
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
