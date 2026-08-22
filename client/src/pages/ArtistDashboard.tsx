import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from 'axios';
import { toast } from 'react-toastify';
import { ImageSlotsManager } from './AdminDashboard';
import type { ImageSlot } from './AdminDashboard';

type Artist = {
  _id: string;
  artistName?: string;
  penName?: string;
  bio?: string;
  profileImage?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  commissionRate?: number;
  payoutAccount?: {
    maskedAccountNumber?: string;
    verificationStatus?: string;
  } | null;
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
  images?: string[];
  medium?: string;
  dimensions?: string;
  year?: string;
  videoUrl?: string;
  description?: string;
  type: string;
  isActive: boolean;
  approvalStatus?: string;
  viewsCount?: number;
  views?: number;
  wishlistCount?: number;
};

type OrderItem = {
  productId?: string;
  artistId?: string;
  title: string;
  quantity: number;
  price?: number;
};

type Order = {
  _id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

type TabType = 'dashboard' | 'artworks' | 'orders' | 'analytics' | 'earnings' | 'profile';
type ArtworkFilter = 'all' | 'published' | 'pending' | 'rejected' | 'draft' | 'sold';
type TimeRange = '7d' | '30d' | '3m';

type DashboardStats = {
  grossSales?: number;
  lifetimeEarnings?: number;
  totalWithdrawn?: number;
};

const ArtistDashboard: React.FC = () => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Tab & Filter state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [artworkFilter, setArtworkFilter] = useState<ArtworkFilter>('all');
  const [salesTimeRange, setSalesTimeRange] = useState<TimeRange>('30d');

  // Add/Edit states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    title: '', price: '', printPrice: '', canvasSketchPrice: '', description: '', category: '', type: 'original-artwork',
    imageUrl: '', canvasSketchImageUrl: '',
    medium: '', dimensions: '', year: '', videoUrl: 'https://youtube.com'
  });

  const [, setNewProductImage] = useState<File | null>(null);
  const [newCanvasSketchImage, setNewCanvasSketchImage] = useState<File | null>(null);
  const [, setEditingProductImage] = useState<File | null>(null);
  const [editingCanvasSketchImage, setEditingCanvasSketchImage] = useState<File | null>(null);
  const [newImagesList, setNewImagesList] = useState<ImageSlot[]>([]);
  const [editingImagesList, setEditingImagesList] = useState<ImageSlot[]>([]);
  const [offerPrint, setOfferPrint] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const handleCloseEditModal = (force = false) => {
    if (!force && isFormDirty) {
      if (!window.confirm('You have unsaved changes. Discard them?')) {
        return;
      }
    }
    setEditingProduct(null);
    setEditingProductImage(null);
    setEditingCanvasSketchImage(null);
    setEditingImagesList([]);
    setIsFormDirty(false);
  };

  useEffect(() => {
    if (!editingProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseEditModal();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingProduct, isFormDirty]);

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

      const productsList = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.data || []);
      setArtist(dashboardRes.data.artist);
      setDashboardStats(dashboardRes.data.stats || {});
      setWallet(artistWalletRes.data.wallet || { balance: dashboardRes.data.stats?.walletBalance || 0 });
      setProducts(productsList);
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
    if (newImagesList.length === 0) {
      return toast.error("Please add at least one product image");
    }
    if (newImagesList.length > 5) {
      return toast.error("Maximum 5 images allowed");
    }

    for (const slot of newImagesList) {
      if (slot.type === 'file' && slot.file && slot.file.size > 2 * 1024 * 1024) {
        return toast.error("Each product image file size must be less than 2MB");
      }
    }
    if (newCanvasSketchImage && newCanvasSketchImage.size > 2 * 1024 * 1024) {
      return toast.error("Canvas sketch image file size must be less than 2MB");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });
      if (newCanvasSketchImage) formData.append('canvasSketchImage', newCanvasSketchImage);

      const variants: any[] = [
        {
          category: 'Original',
          price: Number(newProduct.price) || null,
          dimensions: newProduct.dimensions || '',
          stockQuantity: 1
        }
      ];
      if (offerPrint) {
        variants.push(
          { category: 'Print on Demand', size: 'A5', price: 1234.70, dimensions: '5.8 x 8.3 in', stockQuantity: 999 },
          { category: 'Print on Demand', size: 'A4', price: 2806.70, dimensions: newProduct.dimensions || '', stockQuantity: 999 },
          { category: 'Print on Demand', size: 'A3', price: 3144.00, dimensions: '11.7 x 16.5 in', stockQuantity: 999 }
        );
      }
      formData.append('variants', JSON.stringify(variants));

      let fileCounter = 0;
      newImagesList.forEach((slot) => {
        if (slot.type === 'file' && slot.file) {
          formData.append('images', slot.file);
          formData.append('images', `file_${fileCounter}`);
          fileCounter++;
        } else if (slot.type === 'url' && slot.url) {
          formData.append('images', slot.url);
        }
      });

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
      setNewImagesList([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingImagesList.length === 0) {
      return toast.error("Please add at least one product image");
    }
    if (editingImagesList.length > 5) {
      return toast.error("Maximum 5 images allowed");
    }

    for (const slot of editingImagesList) {
      if (slot.type === 'file' && slot.file && slot.file.size > 2 * 1024 * 1024) {
        return toast.error("Each product image file size must be less than 2MB");
      }
    }
    if (editingCanvasSketchImage && editingCanvasSketchImage.size > 2 * 1024 * 1024) {
      return toast.error("Canvas sketch image file size must be less than 2MB");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(editingProduct).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'imageUrl' && key !== 'variants' && value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });
      if (editingCanvasSketchImage) formData.append('canvasSketchImage', editingCanvasSketchImage);

      const variants: any[] = [
        {
          category: 'Original',
          price: Number(editingProduct.price) || null,
          dimensions: editingProduct.dimensions || '',
          stockQuantity: 1
        }
      ];
      if (offerPrint) {
        variants.push(
          { category: 'Print on Demand', size: 'A5', price: 1234.70, dimensions: '5.8 x 8.3 in', stockQuantity: 999 },
          { category: 'Print on Demand', size: 'A4', price: 2806.70, dimensions: editingProduct.dimensions || '', stockQuantity: 999 },
          { category: 'Print on Demand', size: 'A3', price: 3144.00, dimensions: '11.7 x 16.5 in', stockQuantity: 999 }
        );
      }
      formData.append('variants', JSON.stringify(variants));

      let fileCounter = 0;
      editingImagesList.forEach((slot) => {
        if (slot.type === 'file' && slot.file) {
          formData.append('images', slot.file);
          formData.append('images', `file_${fileCounter}`);
          fileCounter++;
        } else if (slot.type === 'url' && slot.url) {
          formData.append('images', slot.url);
        }
      });

      await axiosInstance.put(`/api/artist-portal/products/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product updated and submitted for review!');
      await fetchData();
      handleCloseEditModal(true);
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
    return (
      <div className="container-custom py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-logo-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-semibold">Loading artist business dashboard...</p>
      </div>
    );
  }

  // Calculated Metrics
  const activeListings = products.filter((product) => product.isActive && product.approvalStatus !== 'rejected').length;
  const pendingArtworks = products.filter((product) => product.approvalStatus === 'pending');
  const rejectedArtworks = products.filter((product) => product.approvalStatus === 'rejected');
  const ordersAwaitingFulfillment = orders.filter((o) => o.status === 'succeeded');

  const hasViewData = products.some((p) => typeof p.viewsCount === 'number' || typeof p.views === 'number');
  const hasWishlistData = products.some((p) => typeof p.wishlistCount === 'number');
  const totalViews = hasViewData ? products.reduce((acc, p) => acc + (p.viewsCount || p.views || 0), 0) : null;
  const totalWishlist = hasWishlistData ? products.reduce((acc, p) => acc + (p.wishlistCount || 0), 0) : null;

  // Check Needs Attention items
  const needsAttentionItems: Array<{ id: string; title: string; description: string; action: () => void; tag: string; tagColor: string }> = [];

  if (ordersAwaitingFulfillment.length > 0) {
    needsAttentionItems.push({
      id: 'orders_fulfillment',
      title: `${ordersAwaitingFulfillment.length} Order${ordersAwaitingFulfillment.length > 1 ? 's' : ''} Awaiting Fulfillment`,
      description: 'Customer orders are ready for packing and shipping update.',
      action: () => setActiveTab('orders'),
      tag: 'Urgent',
      tagColor: 'bg-red-500/10 text-red-500 dark:bg-red-500/20'
    });
  }

  if (pendingArtworks.length > 0) {
    needsAttentionItems.push({
      id: 'artworks_pending',
      title: `${pendingArtworks.length} Artwork${pendingArtworks.length > 1 ? 's' : ''} Pending Approval`,
      description: 'Your uploaded artwork is currently under admin review.',
      action: () => {
        setActiveTab('artworks');
        setArtworkFilter('pending');
      },
      tag: 'In Review',
      tagColor: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
    });
  }

  if (rejectedArtworks.length > 0) {
    needsAttentionItems.push({
      id: 'artworks_rejected',
      title: `${rejectedArtworks.length} Artwork Submission${rejectedArtworks.length > 1 ? 's' : ''} Require Attention`,
      description: 'Please review guidelines and resubmit updated images or details.',
      action: () => {
        setActiveTab('artworks');
        setArtworkFilter('rejected');
      },
      tag: 'Action Needed',
      tagColor: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
    });
  }

  if (!artist?.bio || !artist?.profileImage) {
    needsAttentionItems.push({
      id: 'profile_incomplete',
      title: 'Incomplete Artist Public Profile',
      description: 'Add a bio and profile photo to boost buyer trust and sales.',
      action: () => setActiveTab('profile'),
      tag: 'Profile',
      tagColor: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
    });
  }

  if (!artist?.payoutAccount) {
    needsAttentionItems.push({
      id: 'payout_setup',
      title: 'Payout & Bank Account Setup Required',
      description: 'Configure your UPI ID or Bank details to receive automated payouts.',
      action: () => { window.location.href = '/artist-earnings'; },
      tag: 'Payouts',
      tagColor: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
    });
  }

  if (artist?.payoutAccount && artist.payoutAccount.verificationStatus !== 'verified') {
    needsAttentionItems.push({
      id: 'payout_verification',
      title: 'Payout Account Verification Pending',
      description: 'Your payout account must be verified before you can request a withdrawal.',
      action: () => { window.location.href = '/artist-earnings'; },
      tag: 'Payouts',
      tagColor: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
    });
  }

  // Filtered Artworks list
  const soldProductIds = new Set(orders.flatMap((order) => order.items.filter(() => ['succeeded', 'shipped', 'delivered'].includes(order.status)).map((item) => String(item.productId))));
  const filteredProducts = products.filter((p) => {
    if (artworkFilter === 'published') return p.approvalStatus === 'approved' && p.isActive;
    if (artworkFilter === 'pending') return p.approvalStatus === 'pending';
    if (artworkFilter === 'rejected') return p.approvalStatus === 'rejected';
    if (artworkFilter === 'draft') return p.approvalStatus === 'draft' || !p.isActive;
    if (artworkFilter === 'sold') return soldProductIds.has(String(p._id));
    return true;
  });

  // Calculate Onboarding completion for new artists
  const onboardingSteps = [
    { key: 'profile', label: 'Create your artist profile', done: Boolean(artist?.artistName && artist?.bio) },
    { key: 'artwork', label: 'Add your first artwork', done: products.length > 0 },
    { key: 'pricing', label: 'Configure pricing & prints', done: products.some(p => p.price > 0 || (p.printPrice && p.printPrice > 0)) },
    { key: 'payout', label: 'Configure payout settings', done: Boolean(artist?.payoutAccount?.verificationStatus === 'verified') },
    { key: 'published', label: 'Publish your first listing live', done: products.some(p => p.approvalStatus === 'approved') }
  ];
  const completedOnboardingCount = onboardingSteps.filter(s => s.done).length;
  const onboardingProgressPercent = Math.round((completedOnboardingCount / onboardingSteps.length) * 100);

  const topArtworks = hasViewData || hasWishlistData
    ? [...products].filter((product) => typeof product.viewsCount === 'number' || typeof product.views === 'number' || typeof product.wishlistCount === 'number')
      .sort((a, b) => ((b.viewsCount || b.views || 0) + (b.wishlistCount || 0)) - ((a.viewsCount || a.views || 0) + (a.wishlistCount || 0))).slice(0, 3)
    : [];

  return (
    <div className="container-custom py-8 space-y-8">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-logo-purple/10 text-logo-purple font-bold text-xs uppercase tracking-wider">
              Artist Business Control Center
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span> Shop Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1">
            Welcome back, {artist?.artistName || 'Artist'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Here's what's happening with your art business today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowAddForm(true);
              setOfferPrint(true);
              setActiveTab('artworks');
            }}
            className="rounded-2xl bg-logo-purple px-5 py-3 text-sm font-bold text-white shadow-lg shadow-logo-purple/20 transition hover:bg-logo-purple/90 cursor-pointer flex items-center gap-2"
          >
            <span>+</span> Add Artwork
          </button>
          {artist?._id && (
            <Link
              to={`/artist/${artist._id}`}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2"
            >
              <span>🎨</span> Public Profile
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100 dark:border-gray-800">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'artworks', label: 'Artworks', icon: '🖼️', count: products.length },
          { id: 'orders', label: 'Orders', icon: '📦', count: orders.length },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
          { id: 'earnings', label: 'Earnings', icon: '💰' },
          { id: 'profile', label: 'Profile', icon: '👤' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                if (tab.id !== 'artworks') setShowAddForm(false);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-logo-purple text-white shadow-md shadow-logo-purple/20'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Edit Artwork Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => handleCloseEditModal()}
        >
          <div
            className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Edit Artwork</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-md">{editingProduct.title}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCloseEditModal()}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Artwork Title</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Artwork Title"
                      value={editingProduct.title || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, title: e.target.value });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Category (e.g. Painting, Sketch)</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Category"
                      value={editingProduct.category || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, category: e.target.value });
                      }}
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
                      value={editingProduct.price || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, price: Number(e.target.value) });
                      }}
                      required
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offerPrint}
                        onChange={(e) => {
                          setIsFormDirty(true);
                          setOfferPrint(e.target.checked);
                        }}
                        className="w-4 h-4 text-logo-purple border-gray-350 rounded focus:ring-logo-purple"
                      />
                      Offer Print on Demand (A5, A4, A3)
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Canvas Sketch Price (₹)</label>
                    <input
                      type="number"
                      className="auth-input w-full"
                      placeholder="Canvas Sketch Price"
                      value={editingProduct.canvasSketchPrice || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, canvasSketchPrice: Number(e.target.value) });
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    className="auth-input w-full min-h-[100px] pt-3"
                    placeholder="Describe your artwork..."
                    value={editingProduct.description || ''}
                    onChange={(e) => {
                      setIsFormDirty(true);
                      setEditingProduct({ ...editingProduct, description: e.target.value });
                    }}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Product Type</label>
                    <select
                      className="auth-input w-full"
                      value={editingProduct.type || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, type: e.target.value });
                      }}
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
                      value={editingProduct.videoUrl || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, videoUrl: e.target.value });
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Medium</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Medium"
                      value={editingProduct.medium || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, medium: e.target.value });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Dimensions</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Dimensions"
                      value={editingProduct.dimensions || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, dimensions: e.target.value });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Year</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Year"
                      value={editingProduct.year || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, year: e.target.value });
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-1 border-t dark:border-gray-800 pt-6">
                  <div className="rounded-2xl border dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Product Images (Original/Print) - Up to 5 Images</label>
                    <ImageSlotsManager
                      slots={editingImagesList}
                      onChange={(slots) => {
                        setIsFormDirty(true);
                        setEditingImagesList(slots);
                      }}
                      onAddUrl={(url) => {
                        setIsFormDirty(true);
                        setEditingImagesList([...editingImagesList, { id: `editing_url_${Date.now()}`, type: 'url', url }]);
                      }}
                      onAddFile={(file) => {
                        setIsFormDirty(true);
                        setEditingImagesList([...editingImagesList, { id: `editing_file_${Date.now()}`, type: 'file', file }]);
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Canvas Sketch Image</label>
                    <input
                      type="file"
                      className="auth-input w-full pt-2"
                      accept="image/*"
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingCanvasSketchImage(e.target.files?.[0] || null);
                      }}
                    />
                    <input
                      type="url"
                      className="auth-input w-full mt-2"
                      placeholder="Or Canvas Sketch Image URL"
                      value={editingProduct.canvasSketchImageUrl || ''}
                      onChange={(e) => {
                        setIsFormDirty(true);
                        setEditingProduct({ ...editingProduct, canvasSketchImageUrl: e.target.value });
                      }}
                    />
                    {getPreview(editingCanvasSketchImage, editingProduct.canvasSketchImageUrl || '') && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Preview:</p>
                        <img
                          src={getPreview(editingCanvasSketchImage, editingProduct.canvasSketchImageUrl || '')}
                          className="h-24 w-auto rounded-xl object-cover border"
                          alt="Canvas Sketch Preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  className="rounded-2xl bg-gray-200 dark:bg-gray-800 px-6 py-3 font-bold text-gray-700 dark:text-gray-300 transition hover:opacity-90 cursor-pointer text-sm"
                  onClick={() => handleCloseEditModal()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-logo-purple px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD TAB VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Needs Attention Bar */}
          {needsAttentionItems.length > 0 ? (
            <div className="rounded-3xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <h2 className="text-lg font-black text-amber-950 dark:text-amber-200">Needs Attention</h2>
                </div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-200/50 dark:bg-amber-900/50 px-2.5 py-1 rounded-full">
                  {needsAttentionItems.length} Action Item{needsAttentionItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {needsAttentionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={item.action}
                    className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-amber-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.tagColor}`}>
                          {item.tag}
                        </span>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-logo-purple transition-colors">
                          Fix →
                        </span>
                      </div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-logo-purple transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-green-200/60 bg-green-50/60 p-5 dark:border-green-900/40 dark:bg-green-950/20">
              <p className="font-bold text-green-800 dark:text-green-300">You're all caught up.</p>
              <p className="mt-1 text-xs text-green-700/80 dark:text-green-400/80">No artwork, order, profile, or payout actions need your attention.</p>
            </div>
          )}

          {/* Onboarding Checklist for New Artists */}
          {(products.length === 0 || orders.length === 0) && (
            <div className="rounded-3xl border border-logo-purple/20 bg-gradient-to-br from-logo-purple/5 via-white to-logo-purple/5 dark:from-logo-purple/10 dark:via-gray-900 dark:to-logo-purple/5 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-logo-purple">Getting Started</span>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    Get your Artopus shop ready
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete these steps to set up your shop and launch your artwork to art buyers.
                  </p>
                </div>
                <div className="w-full md:w-48 text-right">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    <span>Shop Setup</span>
                    <span>{onboardingProgressPercent}% Done</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-logo-purple rounded-full transition-all duration-500"
                      style={{ width: `${onboardingProgressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {onboardingSteps.map((step, idx) => (
                  <div
                    key={step.key}
                    onClick={() => {
                      if (step.key === 'profile') setActiveTab('profile');
                      else if (step.key === 'artwork') {
                        setActiveTab('artworks');
                        setShowAddForm(true);
                      } else if (step.key === 'pricing') setActiveTab('artworks');
                      else if (step.key === 'payout') setActiveTab('earnings');
                      else if (step.key === 'published') setActiveTab('artworks');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      step.done
                        ? 'bg-green-500/5 border-green-500/20 text-gray-900 dark:text-white'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-logo-purple/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        step.done
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                    >
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <span className={`text-sm font-semibold ${step.done ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overview Statistics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div
              onClick={() => setActiveTab('earnings')}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <span className="text-lg">💰</span>
              </div>
                <p className="text-3xl font-black text-logo-purple">{dashboardStats.grossSales !== undefined ? `₹${Number(dashboardStats.grossSales).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '--'}</p>
              <p className="text-xs text-gray-400 mt-2 group-hover:text-logo-purple transition-colors">Gross sales from recorded transactions →</p>
            </div>

            <div
              onClick={() => setActiveTab('orders')}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <span className="text-lg">📦</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{orders.length}</p>
              <p className="text-xs text-gray-400 mt-2 group-hover:text-logo-purple transition-colors">Manage orders →</p>
            </div>

            <div
              onClick={() => setActiveTab('artworks')}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Listings</span>
                <span className="text-lg">🖼️</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{activeListings}</p>
              <p className="text-xs text-gray-400 mt-2 group-hover:text-logo-purple transition-colors">{products.length} total artworks →</p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Artwork Views</span>
                <span className="text-lg">👁️</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {totalViews !== null ? totalViews.toLocaleString('en-IN') : '--'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {totalViews !== null ? 'Total shop page impressions' : 'View tracking is not available yet'}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Wishlist Adds</span>
                <span className="text-lg">❤️</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {totalWishlist !== null ? totalWishlist : '--'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {totalWishlist !== null ? 'Saved by collectors' : 'Wishlist tracking is not available yet'}
              </p>
            </div>
          </div>

          {/* Sales Overview & Chart Structure */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sales Overview</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Revenue trajectory and order volume</p>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                {(['7d', '30d', '3m'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSalesTimeRange(range)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      salesTimeRange === range
                        ? 'bg-white dark:bg-gray-900 text-logo-purple shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '3 Months'}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
              <h3 className="font-bold text-gray-900 dark:text-white mt-2">Sales history is not available yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                This view is ready for time-series revenue and order data when the artist analytics API is available.
              </p>
              {orders.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">Recorded orders: {orders.length}</p>
              )}
            </div>
          </div>

          {/* Artworks & Orders Dual Column */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Artworks (2 Cols) */}
            <div className="lg:col-span-2 rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your Artworks</h2>
                  <p className="text-xs text-gray-500">{products.length} total listings submitted</p>
                </div>
                <button
                  onClick={() => setActiveTab('artworks')}
                  className="text-xs font-bold text-logo-purple hover:underline cursor-pointer"
                >
                  View All ({products.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {products.slice(0, 4).map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950/60 hover:bg-gray-100 dark:hover:bg-gray-950 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-14 h-14 object-cover rounded-xl border border-gray-200 dark:border-gray-800 bg-white shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.category} • {product.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-logo-purple">₹{Number(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            product.approvalStatus === 'approved'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : product.approvalStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {product.approvalStatus || 'pending'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          const p = product as any;
                          const hasPrints = p.variants && Array.isArray(p.variants) && p.variants.some((v: any) => v.category === 'Print on Demand');
                          setOfferPrint(hasPrints);
                          const initialImages: ImageSlot[] = (product.images && product.images.length > 0 ? product.images : [product.imageUrl]).filter(Boolean).map((imgUrl: string, idx: number) => ({
                            id: `existing_${idx}_${Date.now()}`,
                            type: 'url',
                            url: imgUrl
                          }));
                          setEditingImagesList(initialImages);
                        }}
                        className="rounded-xl bg-gray-200 dark:bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:opacity-90 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-gray-500 text-sm">No artworks uploaded yet.</p>
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        setActiveTab('artworks');
                      }}
                      className="mt-3 text-xs font-bold text-logo-purple underline cursor-pointer"
                    >
                      + Add your first artwork
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Top Artworks (1 Col) */}
            <div className="space-y-8">
              {/* Quick Actions Panel */}
              <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: '+ Add Artwork', action: () => { setActiveTab('artworks'); setShowAddForm(true); }, color: 'bg-logo-purple/10 text-logo-purple hover:bg-logo-purple/20' },
                    { label: 'Manage Artworks', action: () => setActiveTab('artworks'), color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                    { label: 'View Orders', action: () => setActiveTab('orders'), color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                    { label: 'View Earnings', action: () => setActiveTab('earnings'), color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                    { label: 'Edit Profile', action: () => { window.location.href = '/artist-profile/edit'; }, color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                    { label: 'Payout Setup', action: () => setActiveTab('earnings'), color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={btn.action}
                      className={`p-3 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer ${btn.color}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Performing Artworks Card */}
              <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Top Artworks</h2>
                <div className="space-y-3">
                  {topArtworks.map((art, idx) => (
                    <div key={art._id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 font-black text-gray-400 text-center">#{idx + 1}</span>
                        <img src={art.imageUrl} className="w-9 h-9 rounded-lg object-cover border" alt={art.title} />
                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-[110px]">{art.title}</span>
                      </div>
                      <span className="font-black text-logo-purple">{(art.viewsCount ?? art.views ?? 0).toLocaleString('en-IN')} views</span>
                    </div>
                  ))}
                  {topArtworks.length === 0 && (
                    <p className="text-xs text-gray-400 py-4 text-center">Performance rankings will appear when artwork analytics are available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARTWORKS TAB VIEW */}
      {activeTab === 'artworks' && (
        <div className="space-y-8">
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Artwork Management</h2>
              <p className="text-xs text-gray-500">Filter, edit, and publish your art catalog</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'published', 'pending', 'rejected', 'draft', 'sold'] as ArtworkFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setArtworkFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    artworkFilter === filter
                      ? 'bg-logo-purple text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="ml-2 rounded-xl bg-logo-purple/10 px-4 py-2 text-xs font-bold text-logo-purple hover:bg-logo-purple/20 transition-all cursor-pointer"
              >
                {showAddForm ? '✕ Close Form' : '+ Upload Artwork'}
              </button>
            </div>
          </div>

          {/* Add Artwork Form */}
          {showAddForm && (
            <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-6 text-2xl font-black text-gray-900 dark:text-white">Upload New Artwork</h2>

              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Artwork Title</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Artwork Title"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Category (e.g. Painting, Sketch)</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
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
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offerPrint}
                        onChange={(e) => setOfferPrint(e.target.checked)}
                        className="w-4 h-4 text-logo-purple border-gray-350 rounded focus:ring-logo-purple"
                      />
                      Offer Print on Demand (A5, A4, A3)
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Canvas Sketch Price (₹)</label>
                    <input
                      type="number"
                      className="auth-input w-full"
                      placeholder="Canvas Sketch Price"
                      value={newProduct.canvasSketchPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, canvasSketchPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    className="auth-input w-full min-h-[100px] pt-3"
                    placeholder="Describe your artwork..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Product Type</label>
                    <select
                      className="auth-input w-full"
                      value={newProduct.type}
                      onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
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
                      value={newProduct.videoUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, videoUrl: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Medium</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Medium"
                      value={newProduct.medium}
                      onChange={(e) => setNewProduct({ ...newProduct, medium: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Dimensions</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Dimensions"
                      value={newProduct.dimensions}
                      onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Year</label>
                    <input
                      type="text"
                      className="auth-input w-full"
                      placeholder="Year"
                      value={newProduct.year}
                      onChange={(e) => setNewProduct({ ...newProduct, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-1 border-t pt-6">
                  <div className="rounded-2xl border p-4 bg-gray-50 dark:bg-gray-800">
                    <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Product Images (Up to 5 Images)</label>
                    <ImageSlotsManager
                      slots={newImagesList}
                      onChange={(slots) => setNewImagesList(slots)}
                      onAddUrl={(url) => setNewImagesList([...newImagesList, { id: `new_url_${Date.now()}`, type: 'url', url }])}
                      onAddFile={(file) => setNewImagesList([...newImagesList, { id: `new_file_${Date.now()}`, type: 'file', file }])}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="rounded-2xl bg-logo-purple px-6 py-3 font-bold text-white transition hover:opacity-90 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Artwork'}
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl bg-gray-200 dark:bg-gray-800 px-6 py-3 font-bold text-gray-700 dark:text-gray-300 transition hover:opacity-90 cursor-pointer"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Artworks List Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 border border-gray-100 dark:border-gray-800 bg-gray-50">
                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black uppercase shadow-sm ${
                        product.approvalStatus === 'approved'
                          ? 'bg-green-500 text-white'
                          : product.approvalStatus === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {product.approvalStatus || 'pending'}
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-gray-900 dark:text-white line-clamp-1">{product.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{product.category} • {product.type}</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Price</span>
                    <span className="font-black text-logo-purple text-base">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      const p = product as any;
                      const hasPrints = p.variants && Array.isArray(p.variants) && p.variants.some((v: any) => v.category === 'Print on Demand');
                      setOfferPrint(hasPrints);
                      const initialImages: ImageSlot[] = (product.images && product.images.length > 0 ? product.images : [product.imageUrl]).filter(Boolean).map((imgUrl: string, idx: number) => ({
                        id: `existing_${idx}_${Date.now()}`,
                        type: 'url',
                        url: imgUrl
                      }));
                      setEditingImagesList(initialImages);
                    }}
                    className="rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                <p className="text-gray-500 font-bold">No artworks matching "{artworkFilter}" filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDERS TAB VIEW */}
      {activeTab === 'orders' && (
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Fulfillment & Orders</h2>
            <p className="text-xs text-gray-500">Track and update delivery status for collector orders</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase text-gray-400 dark:border-gray-800">
                  <th className="pb-4 pr-4">Order ID</th>
                  <th className="pb-4 pr-4">Items</th>
                  <th className="pb-4 pr-4">Total Amount</th>
                  <th className="pb-4 pr-4">Fulfillment Status</th>
                  <th className="pb-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 align-middle dark:border-gray-800">
                    <td className="py-4 pr-4">
                      <p className="font-bold text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-600 dark:text-gray-300">
                      {order.items
                        .filter((item) => String(item.artistId) === String(artist?._id))
                        .map((item) => `${item.quantity}x ${item.title}`)
                        .join(', ')}
                    </td>
                    <td className="py-4 pr-4 font-bold text-logo-purple">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 pr-4">
                      <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="auth-input max-w-[150px] py-1.5 text-xs"
                          value={statusDrafts[order._id] || (order.status === 'delivered' ? 'delivered' : 'shipped')}
                          onChange={(e) => setStatusDrafts((current) => ({ ...current, [order._id]: e.target.value }))}
                          disabled={order.status === 'delivered'}
                        >
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button
                          className="rounded-xl bg-logo-purple px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
                          onClick={() => handleStatusUpdate(order._id)}
                          disabled={updatingOrderId === order._id || order.status === 'delivered'}
                        >
                          {updatingOrderId === order._id ? 'Saving...' : 'Update'}
                        </button>
                        <button
                          className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Order
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <p className="font-bold">No orders found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB VIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs text-gray-400 font-bold uppercase">Listing Conversion</span>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {products.length > 0 ? `${((orders.length / products.length) * 100).toFixed(1)}%` : '0%'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Orders per submitted artwork listing</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs text-gray-400 font-bold uppercase">Avg Listing Price</span>
              <p className="text-3xl font-black text-logo-purple mt-1">
                ₹{products.length > 0 ? (products.reduce((a, b) => a + (b.price || 0), 0) / products.length).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Catalog pricing average</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs text-gray-400 font-bold uppercase">Approval Rate</span>
              <p className="text-3xl font-black text-green-500 mt-1">
                {products.length > 0 ? `${Math.round((products.filter(p => p.approvalStatus === 'approved').length / products.length) * 100)}%` : '100%'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Curator verification success</p>
            </div>
          </div>
        </div>
      )}

      {/* EARNINGS TAB VIEW */}
      {activeTab === 'earnings' && (
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-logo-purple">Available Balance</span>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-1">
                ₹{Number(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-gray-500 mt-1">Automated payouts processed weekly for active sales.</p>
            </div>
            <Link
              to="/artist-earnings"
              className="rounded-2xl bg-logo-purple px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-logo-purple/20 hover:opacity-90 transition-all cursor-pointer"
            >
              View Full Earnings Statement →
            </Link>
          </div>
        </div>
      )}

      {/* PROFILE TAB VIEW */}
      {activeTab === 'profile' && (
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Artist Profile</h2>
              <p className="text-xs text-gray-500">Public biography and shop details</p>
            </div>
            {artist?._id && (
              <div className="flex flex-wrap gap-2">
                <Link to="/artist-profile/edit" className="rounded-xl bg-logo-purple px-4 py-2 font-bold text-xs text-white hover:opacity-90 transition-all">
                  Edit Profile
                </Link>
                <Link to={`/artist/${artist._id}`} className="rounded-xl bg-logo-purple/10 text-logo-purple px-4 py-2 font-bold text-xs hover:bg-logo-purple/20 transition-all">
                  View Public Profile
                </Link>
              </div>
            )}
          </div>

          {(() => {
            const profileChecks = [artist?.artistName, artist?.bio, artist?.profileImage, artist?.socialLinks?.website || artist?.socialLinks?.instagram, artist?.payoutAccount?.verificationStatus === 'verified'];
            const completed = profileChecks.filter(Boolean).length;
            return (
              <div className="rounded-2xl border border-logo-purple/20 bg-logo-purple/5 p-4">
                <div className="flex items-center justify-between gap-4 text-sm font-bold text-gray-900 dark:text-white">
                  <span>Profile completion</span>
                  <span className="text-logo-purple">{Math.round((completed / profileChecks.length) * 100)}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-logo-purple" style={{ width: `${(completed / profileChecks.length) * 100}%` }} />
                </div>
                {completed < profileChecks.length && <p className="mt-2 text-xs text-gray-500">Complete your bio, photo, social link, and payout setup to present a stronger public profile.</p>}
              </div>
            );
          })()}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400">Artist Name</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{artist?.artistName || 'Not Set'}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-400">Commission Rate</label>
              <p className="text-lg font-bold text-logo-purple">{artist?.commissionRate ?? 18}% platform fee</p>
            </div>
            <div className="col-span-full">
              <label className="text-xs font-bold uppercase text-gray-400">Bio</label>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{artist?.bio || 'No biography added yet.'}</p>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                <p className="text-xs text-gray-500">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <button aria-label="Close order details" onClick={() => setSelectedOrder(null)} className="rounded-full bg-gray-100 px-3 py-1 text-lg text-gray-500 dark:bg-gray-800">×</button>
            </div>
            <div className="space-y-3 py-5">
              {selectedOrder.items.filter((item) => String(item.artistId) === String(artist?._id)).map((item) => (
                <div key={`${selectedOrder._id}-${item.productId || item.title}`} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{item.quantity} × {item.title}</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{Number((item.price || 0) * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-gray-100 pt-3 font-black dark:border-gray-800">
                <span className="text-gray-900 dark:text-white">Order total</span>
                <span className="text-logo-purple">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-xs font-bold uppercase text-gray-400">Status: {selectedOrder.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDashboard;
