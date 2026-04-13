import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialForm = {
  title: '',
  description: '',
  type: 'original-artwork',
  category: 'Painting',
  price: '',
  outlineSketchPrice: '',
  coloringPrice: '',
  stockQuantity: '1',
  medium: '',
  dimensions: '',
  year: '',
  videoUrl: '',
  imageUrl: '',
};

const ArtistDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState<File | null>(null);
  const [withdrawal, setWithdrawal] = useState({ amount: '', note: '' });

  const fetchDashboard = async () => {
    const res = await axios.get('/api/artist-portal/dashboard');
    setData(res.data);
  };

  useEffect(() => {
    fetchDashboard().catch((error) => {
      toast.error(error.response?.data?.message || 'Could not load artist dashboard');
    });
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });
    if (image) payload.append('image', image);

    try {
      await axios.post('/api/artist-portal/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Artwork submitted for admin approval');
      setForm(initialForm);
      setImage(null);
      setStep(1);
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not submit artwork');
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/artist-portal/wallet/withdrawals', {
        amount: Number(withdrawal.amount),
        note: withdrawal.note,
      });
      toast.success('Withdrawal request sent to admin');
      setWithdrawal({ amount: '', note: '' });
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not request withdrawal');
    }
  };

  if (!data) {
    return <div className="container-custom py-20 text-center">Loading artist dashboard...</div>;
  }

  const calculatorPreview = {
    base: Number(form.price || 0),
    outline: Number(form.outlineSketchPrice || form.price || 0),
    colored: Number(form.coloringPrice || form.price || 0),
  };

  return (
    <div className="container-custom py-10 space-y-10">
      <section className="grid md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="text-3xl font-black text-logo-purple">${data.stats.walletBalance.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">Lifetime Earnings</p>
          <p className="text-3xl font-black">${data.stats.lifetimeEarnings.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">Approved Works</p>
          <p className="text-3xl font-black">{data.stats.approvedProducts}</p>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-3xl font-black">{data.stats.pendingProducts}</p>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Art Upload Studio</h1>
              <p className="text-gray-500">Multi-step submission with pricing and video verification.</p>
            </div>
            <div className="text-sm text-gray-500">Step {step} of 3</div>
          </div>

          <form onSubmit={handleProductSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <input className="auth-input" placeholder="Artwork title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea className="auth-input min-h-32" placeholder="Artwork story and description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                <div className="grid md:grid-cols-2 gap-4">
                  <select className="auth-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="original-artwork">Original Artwork</option>
                    <option value="merchandise">Merchandise</option>
                  </select>
                  <input className="auth-input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <input className="auth-input" type="number" min="0" placeholder="Base price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  <input className="auth-input" type="number" min="0" placeholder="Stock quantity" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input className="auth-input" type="number" min="0" placeholder="Outline sketch price" value={form.outlineSketchPrice} onChange={(e) => setForm({ ...form, outlineSketchPrice: e.target.value })} />
                  <input className="auth-input" type="number" min="0" placeholder="Colored version price" value={form.coloringPrice} onChange={(e) => setForm({ ...form, coloringPrice: e.target.value })} />
                </div>
                <div className="p-5 rounded-2xl bg-logo-purple/5 border border-logo-purple/10">
                  <p className="font-bold mb-2">Price calculator preview</p>
                  <p>Original: ${calculatorPreview.base.toFixed(2)}</p>
                  <p>Outline sketch: ${calculatorPreview.outline.toFixed(2)}</p>
                  <p>Colored version: ${calculatorPreview.colored.toFixed(2)}</p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <input className="auth-input" placeholder="Medium" value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} />
                  <input className="auth-input" placeholder="Dimensions" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
                  <input className="auth-input" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
                <input className="auth-input" placeholder="Making-of video URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} required />
                <input className="auth-input" placeholder="Optional image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                <input className="auth-input pt-3" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </>
            )}

            <div className="flex gap-3">
              {step > 1 && <button type="button" className="auth-button bg-gray-200 text-gray-900" onClick={() => setStep(step - 1)}>Back</button>}
              {step < 3 ? (
                <button type="button" className="auth-button" onClick={() => setStep(step + 1)}>Next</button>
              ) : (
                <button type="submit" className="auth-button">Submit for Review</button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-black mb-4">Wallet</h2>
            <form onSubmit={handleWithdrawal} className="space-y-4">
              <input className="auth-input" type="number" min="0" step="0.01" placeholder="Withdrawal amount" value={withdrawal.amount} onChange={(e) => setWithdrawal({ ...withdrawal, amount: e.target.value })} required />
              <textarea className="auth-input min-h-24" placeholder="Optional note for admin" value={withdrawal.note} onChange={(e) => setWithdrawal({ ...withdrawal, note: e.target.value })} />
              <button type="submit" className="auth-button">Request Withdrawal</button>
            </form>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-black mb-4">Recent Wallet Activity</h2>
            <div className="space-y-3">
              {data.walletTransactions.slice(0, 6).map((item: any) => (
                <div key={item._id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950">
                  <p className="font-bold capitalize">{item.type.replace(/_/g, ' ')}</p>
                  <p className="text-logo-purple font-bold">${item.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{item.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-black mb-4">Submitted Works</h2>
          <div className="space-y-3">
            {data.products.map((product: any) => (
              <div key={product._id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{product.title}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
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
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-black mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {data.recentOrders.map((order: any) => (
              <div key={order._id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950">
                <p className="font-bold">Order #{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-sm text-gray-500">{order.status}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArtistDashboard;
