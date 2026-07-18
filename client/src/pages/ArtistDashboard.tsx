import React, { useEffect, useState } from 'react';
import axiosInstance from 'axios';
import { toast } from 'react-toastify';

type Artist = {
  _id: string;
  artistName: string;
};

type Wallet = {
  balance: number;
};

type Product = {
  _id: string;
  title: string;
  category: string;
  price: number;
  printPrice?: number;
  canvasSketchPrice?: number;
  imageUrl: string;
  canvasSketchImageUrl?: string;
  medium?: string;
  dimensions?: string;
  year?: string;
  videoUrl?: string;
  description?: string;
  type: string;
  isActive: boolean;
  approvalStatus?: string;
};

type OrderItem = {
  artistId?: string;
  title: string;
  quantity: number;
};

type Order = {
  _id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

const ArtistDashboard: React.FC = () => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Add/Edit states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    title: '', price: '', printPrice: '', canvasSketchPrice: '', description: '', category: '', type: 'original-artwork',
    imageUrl: '', canvasSketchImageUrl: '',
    medium: '', dimensions: '', year: '', videoUrl: 'https://youtube.com'
  });

  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newCanvasSketchImage, setNewCanvasSketchImage] = useState<File | null>(null);
  const [editingProductImage, setEditingProductImage] = useState<File | null>(null);
  const [editingCanvasSketchImage, setEditingCanvasSketchImage] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const dashboardRes = await axiosInstance.get('/api/artist-portal/dashboard');
      const artistWalletRes = await axiosInstance.get('/api/artist-portal/wallet');
      const artistId = dashboardRes.data.artist?._id;

      if (!artistId) {
        throw new Error('Artist profile is missing');
      }

      const [productsRes, ordersRes] = await Promise.all([
        axiosInstance.get('/api/products', { params: { artistId } }),
        axiosInstance.get('/api/orders', { params: { artistId } }),
      ]);

      setArtist(dashboardRes.data.artist);
      setWallet(artistWalletRes.data.wallet || { balance: dashboardRes.data.stats?.walletBalance || 0 });
      setProducts(productsRes.data);
      setOrders(
        ordersRes.data.filter((order: Order) =>
          order.items.some((item) => String(item.artistId) === String(artistId))
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Could not load artist dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (orderId: string) => {
    if (!artist?._id || !statusDrafts[orderId]) return;
    try {
      setUpdatingOrderId(orderId);
      const res = await axiosInstance.patch(`/api/orders/${orderId}/status`, {
        artistId: artist._id,
        status: statusDrafts[orderId],
      });
      setOrders((current) => current.map((order) => (
        order._id === orderId ? res.data : order
      )));
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductImage && !newProduct.imageUrl.trim()) {
      return toast.error("Please upload a main image or enter a main image URL");
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });
      if (newProductImage) formData.append('image', newProductImage);
      if (newCanvasSketchImage) formData.append('canvasSketchImage', newCanvasSketchImage);

      await axiosInstance.post('/api/artist-portal/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product submitted for review!');
      await fetchData();
      setShowAddForm(false);
      setNewProduct({
        title: '', price: '', printPrice: '', canvasSketchPrice: '', description: '', category: '', type: 'original-artwork',
        imageUrl: '', canvasSketchImageUrl: '',
        medium: '', dimensions: '', year: '', videoUrl: 'https://youtube.com'
      });
      setNewProductImage(null);
      setNewCanvasSketchImage(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(editingProduct).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });
      if (editingProductImage) formData.append('image', editingProductImage);
      if (editingCanvasSketchImage) formData.append('canvasSketchImage', editingCanvasSketchImage);

      await axiosInstance.put(`/api/artist-portal/products/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product updated and submitted for review!');
      await fetchData();
      setEditingProduct(null);
      setEditingProductImage(null);
      setEditingCanvasSketchImage(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPreview = (file: File | null, url: string) => {
    if (file) {
      try {
        return URL.createObjectURL(file);
      } catch (err) {
        return '';
      }
    }
    return url || '';
  };

  if (loading) {
    return <div className="container-custom py-20 text-center">Loading artist dashboard...</div>;
  }

  const activeListings = products.filter((product) => product.isActive && product.approvalStatus !== 'rejected').length;

  return (
    <div className="container-custom py-10 space-y-10">
      <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-logo-purple">Artist Dashboard</p>
            <h1 className="mb-1 text-4xl font-black text-gray-900 dark:text-white">{artist?.artistName || 'Artist'}</h1>
            <p className="text-gray-500">Track earnings, listings, and order fulfillment in one place.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-6 py-5 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-3xl font-black text-logo-purple">₹{Number(wallet?.balance || 0).toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-6 py-5 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{activeListings}</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-6 py-5 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{orders.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Conditionally Render Add / Edit Forms */}
      {(showAddForm || editingProduct) && (
        <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-6 text-2xl font-black">{showAddForm ? 'Upload Artwork' : 'Edit Artwork'}</h2>
          
          <form onSubmit={showAddForm ? handleAddProduct : handleEditProduct} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Artwork Title</label>
                <input 
                  type="text" 
                  className="auth-input w-full" 
                  placeholder="Artwork Title" 
                  value={showAddForm ? newProduct.title : editingProduct?.title || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, title: e.target.value }) : setEditingProduct({ ...editingProduct!, title: e.target.value })}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Category (e.g. Painting, Sketch)</label>
                <input 
                  type="text" 
                  className="auth-input w-full" 
                  placeholder="Category" 
                  value={showAddForm ? newProduct.category : editingProduct?.category || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, category: e.target.value }) : setEditingProduct({ ...editingProduct!, category: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Original Price (₹)</label>
                <input 
                  type="number" 
                  className="auth-input w-full" 
                  placeholder="Price" 
                  value={showAddForm ? newProduct.price : editingProduct?.price || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, price: e.target.value }) : setEditingProduct({ ...editingProduct!, price: Number(e.target.value) })}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Print Price (₹)</label>
                <input 
                  type="number" 
                  className="auth-input w-full" 
                  placeholder="Print Price" 
                  value={showAddForm ? newProduct.printPrice : editingProduct?.printPrice || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, printPrice: e.target.value }) : setEditingProduct({ ...editingProduct!, printPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Canvas Sketch Price (₹)</label>
                <input 
                  type="number" 
                  className="auth-input w-full" 
                  placeholder="Canvas Sketch Price" 
                  value={showAddForm ? newProduct.canvasSketchPrice : editingProduct?.canvasSketchPrice || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, canvasSketchPrice: e.target.value }) : setEditingProduct({ ...editingProduct!, canvasSketchPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
              <textarea 
                className="auth-input w-full min-h-[100px] pt-3" 
                placeholder="Describe your artwork..." 
                value={showAddForm ? newProduct.description : editingProduct?.description || ''} 
                onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, description: e.target.value }) : setEditingProduct({ ...editingProduct!, description: e.target.value })}
                required 
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Product Type</label>
                <select 
                  className="auth-input w-full" 
                  value={showAddForm ? newProduct.type : editingProduct?.type || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, type: e.target.value }) : setEditingProduct({ ...editingProduct!, type: e.target.value })}
                  required
                >
                  <option value="original-artwork">Original Artwork</option>
                  <option value="merchandise">Merchandise / Print On Demand</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Video Link / YouTube URL</label>
                <input 
                  type="url" 
                  className="auth-input w-full" 
                  placeholder="Video URL" 
                  value={showAddForm ? newProduct.videoUrl : editingProduct?.videoUrl || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, videoUrl: e.target.value }) : setEditingProduct({ ...editingProduct!, videoUrl: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Medium (e.g. Acrylic on Canvas)</label>
                <input 
                  type="text" 
                  className="auth-input w-full" 
                  placeholder="Medium" 
                  value={showAddForm ? newProduct.medium : editingProduct?.medium || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, medium: e.target.value }) : setEditingProduct({ ...editingProduct!, medium: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Dimensions (e.g. 18" x 24")</label>
                <input 
                  type="text" 
                  className="auth-input w-full" 
                  placeholder="Dimensions" 
                  value={showAddForm ? newProduct.dimensions : editingProduct?.dimensions || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, dimensions: e.target.value }) : setEditingProduct({ ...editingProduct!, dimensions: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Year</label>
                <input 
                  type="text" 
                  className="auth-input w-full" 
                  placeholder="Year" 
                  value={showAddForm ? newProduct.year : editingProduct?.year || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, year: e.target.value }) : setEditingProduct({ ...editingProduct!, year: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 border-t pt-6">
              <div className="rounded-2xl border p-4 bg-gray-50 dark:bg-gray-800">
                <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Main Image (Original/Print)</label>
                <input 
                  type="file" 
                  className="auth-input w-full pt-2" 
                  accept="image/*"
                  onChange={(e) => showAddForm ? setNewProductImage(e.target.files?.[0] || null) : setEditingProductImage(e.target.files?.[0] || null)} 
                />
                <input 
                  type="url" 
                  className="auth-input w-full mt-2" 
                  placeholder="Or Main Image URL" 
                  value={showAddForm ? newProduct.imageUrl : editingProduct?.imageUrl || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, imageUrl: e.target.value }) : setEditingProduct({ ...editingProduct!, imageUrl: e.target.value })} 
                />
                {getPreview(showAddForm ? newProductImage : editingProductImage, showAddForm ? newProduct.imageUrl : editingProduct?.imageUrl || '') && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img 
                      src={getPreview(showAddForm ? newProductImage : editingProductImage, showAddForm ? newProduct.imageUrl : editingProduct?.imageUrl || '')} 
                      className="h-24 w-auto rounded-xl object-cover border" 
                      alt="Main Preview" 
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border p-4 bg-gray-50 dark:bg-gray-800">
                <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Canvas Sketch Image</label>
                <input 
                  type="file" 
                  className="auth-input w-full pt-2" 
                  accept="image/*"
                  onChange={(e) => showAddForm ? setNewCanvasSketchImage(e.target.files?.[0] || null) : setEditingCanvasSketchImage(e.target.files?.[0] || null)} 
                />
                <input 
                  type="url" 
                  className="auth-input w-full mt-2" 
                  placeholder="Or Canvas Sketch Image URL" 
                  value={showAddForm ? newProduct.canvasSketchImageUrl : editingProduct?.canvasSketchImageUrl || ''} 
                  onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, canvasSketchImageUrl: e.target.value }) : setEditingProduct({ ...editingProduct!, canvasSketchImageUrl: e.target.value })} 
                />
                {getPreview(showAddForm ? newCanvasSketchImage : editingCanvasSketchImage, showAddForm ? newProduct.canvasSketchImageUrl : editingProduct?.canvasSketchImageUrl || '') && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img 
                      src={getPreview(showAddForm ? newCanvasSketchImage : editingCanvasSketchImage, showAddForm ? newProduct.canvasSketchImageUrl : editingProduct?.canvasSketchImageUrl || '')} 
                      className="h-24 w-auto rounded-xl object-cover border" 
                      alt="Canvas Sketch Preview" 
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                className="rounded-2xl bg-logo-purple px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : showAddForm ? 'Submit Artwork' : 'Update Artwork'}
              </button>
              <button 
                type="button" 
                className="rounded-2xl bg-gray-200 dark:bg-gray-800 px-6 py-3 font-bold text-gray-700 dark:text-gray-300 transition hover:opacity-90"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">Listings</h2>
            {!showAddForm && !editingProduct && (
              <button 
                onClick={() => setShowAddForm(true)} 
                className="rounded-xl bg-logo-purple/10 px-4 py-2 text-sm font-bold text-logo-purple transition hover:bg-logo-purple/20"
              >
                + Add Artwork
              </button>
            )}
          </div>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product._id} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                <div className="flex items-center gap-3">
                  <img src={product.imageUrl} alt={product.title} className="w-12 h-12 object-cover rounded-xl border bg-white" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{product.title}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-logo-purple">₹{Number(product.price || 0).toFixed(2)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      product.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      product.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.approvalStatus || 'pending'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingProduct(product);
                      setShowAddForm(false);
                    }} 
                    className="rounded-lg bg-gray-200 dark:bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:opacity-90"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-gray-500">No listings found for this artist.</p>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-6 text-2xl font-black">Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500 dark:border-gray-800">
                  <th className="pb-4 pr-4">Order</th>
                  <th className="pb-4 pr-4">Items</th>
                  <th className="pb-4 pr-4">Total</th>
                  <th className="pb-4 pr-4">Status</th>
                  <th className="pb-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 align-top dark:border-gray-800">
                    <td className="py-4 pr-4">
                      <p className="font-bold text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-600 dark:text-gray-300">
                      {order.items
                        .filter((item) => String(item.artistId) === String(artist?._id))
                        .map((item) => `${item.quantity}x ${item.title}`)
                        .join(', ')}
                    </td>
                    <td className="py-4 pr-4 font-bold text-logo-purple">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="py-4 pr-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="auth-input max-w-[160px]"
                          value={statusDrafts[order._id] || (order.status === 'delivered' ? 'delivered' : 'shipped')}
                          onChange={(e) => setStatusDrafts((current) => ({ ...current, [order._id]: e.target.value }))}
                          disabled={order.status === 'delivered'}
                        >
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button
                          className="rounded-xl bg-logo-purple px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleStatusUpdate(order._id)}
                          disabled={updatingOrderId === order._id || order.status === 'delivered'}
                        >
                          {updatingOrderId === order._id ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="pt-4 text-gray-500">No orders found for this artist.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArtistDashboard;
