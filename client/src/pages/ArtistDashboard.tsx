import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardRes = await axios.get('/api/artist-portal/dashboard');
        const artistWalletRes = await axios.get('/api/artist-portal/wallet');
        const artistId = dashboardRes.data.artist?._id;

        if (!artistId) {
          throw new Error('Artist profile is missing');
        }

        const [productsRes, ordersRes] = await Promise.all([
          axios.get('/api/products', { params: { artistId } }),
          axios.get('/api/orders', { params: { artistId } }),
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

    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (orderId: string) => {
    if (!artist?._id || !statusDrafts[orderId]) return;
    try {
      setUpdatingOrderId(orderId);
      const res = await axios.patch(`/api/orders/${orderId}/status`, {
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
              <p className="text-3xl font-black text-logo-purple">${Number(wallet?.balance || 0).toFixed(2)}</p>
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

      <section className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-6 text-2xl font-black">Listings</h2>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product._id} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{product.title}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-logo-purple">${Number(product.price || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{product.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  product.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                  product.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {product.approvalStatus}
                </span>
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
                    <td className="py-4 pr-4 font-bold text-logo-purple">${order.totalAmount.toFixed(2)}</td>
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
