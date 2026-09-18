import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingBag, Star, Award, Truck, ShieldCheck, RotateCcw, Share2 } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { toast } from 'react-toastify';
import { getOptimizedImageUrl } from '../utils/image';
import ProductCard from '../components/ProductCard';

interface Product {
  _id: string;
  title: string;
  price: number;
  printPrice?: number;
  canvasSketchPrice?: number;
  canvasSketchImageUrl?: string;
  outlineSketchPrice?: number;
  coloringPrice?: number;
  imageUrl: string;
  images?: string[];
  description: string;
  type: string;
  category?: string;
  stockQuantity?: number;
  artistId?: string;
  artistName?: string;
  medium?: string;
  dimensions?: string;
  year?: string;
  videoUrl?: string;
}

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  user?: {
    name?: string;
  };
}

interface ResolvedOption {
  key: string;
  label: string;
  price: number;
  dimensions: string;
  getImage: (product: Product) => string;
}

type BuyerOption = string;

const resolveBuyerOption = (optionKey: string): BuyerOption => {
  return optionKey;
};

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('painting');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { addToCart, cart } = useContext(CartContext)!;
  const auth = useContext(AuthContext);
  const { collections, wishlistIds, toggleWishlist, addToCollection } = useCollections();
  const navigate = useNavigate();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = window.location.href;
    const shareTitle = product.title;
    const shareText = `Check out this beautiful artwork "${product.title}" by ${product.artistName || 'Artopus India'} on Artopus India!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleShareOption = (option: string) => {
    if (!product) return;
    const shareUrl = window.location.href;
    const shareTitle = product.title;
    const shareText = `Check out this beautiful artwork "${product.title}" by ${product.artistName || 'Artopus India'} on Artopus India!`;

    if (option === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    } else if (option === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent('Artopus India - ' + shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_self');
    } else if (option === 'copy') {
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success('Link copied!'))
        .catch(() => toast.error('Failed to copy link'));
    }
    setShowShareMenu(false);
  };

  const resolvedOptions = React.useMemo<ResolvedOption[]>(() => {
    if (!product) return [];

    const p = product as Product & { variants?: Array<{ size?: string; category?: string; price?: number; dimensions?: string }> };
    if (p.variants && p.variants.length > 0) {
      const opts: ResolvedOption[] = p.variants.map((v) => {
        const key = v.size ? `print-${v.size.toLowerCase()}` : 'painting';
        const label = v.category === 'Original' ? 'Original Artwork' : `${v.size?.toUpperCase()} Print`;
        return {
          key,
          label,
          price: v.price || 0,
          dimensions: v.dimensions ? v.dimensions.toLowerCase() : '',
          getImage: (prod: Product) => prod.imageUrl,
        };
      });
      if (product.canvasSketchPrice && product.canvasSketchPrice > 0) {
        opts.push({
          key: 'canvas-sketch',
          label: 'Canvas Sketch',
          price: product.canvasSketchPrice,
          dimensions: '',
          getImage: (prod: Product) => prod.canvasSketchImageUrl || prod.imageUrl,
        });
      }
      return opts;
    }

    return [
      { key: 'painting', label: 'Original Artwork', price: product.price, dimensions: product.dimensions ? product.dimensions.toLowerCase() : '', getImage: (prod: Product) => prod.imageUrl },
      { key: 'outline-sketch', label: 'Outline Sketch', price: product.outlineSketchPrice || 0, dimensions: product.dimensions ? product.dimensions.toLowerCase() : '', getImage: (prod: Product) => prod.imageUrl },
      { key: 'colored-version', label: 'Colored Version', price: product.coloringPrice || 0, dimensions: '', getImage: (prod: Product) => prod.canvasSketchImageUrl || prod.imageUrl },
    ].filter((option) => option.key === 'painting' || option.price > 0);
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [productRes, reviewsRes] = await Promise.all([
          axios.get(`/api/products/${id}`),
          axios.get(`/api/reviews/product/${id}`),
          axios.post('/api/page-views', { page: 'product-details', productId: id }).catch(() => null),
        ]);

        setProduct(productRes.data);
        if (productRes.data.variants && productRes.data.variants.length > 0) {
          setSelectedOption(productRes.data.variants[0].size ? `print-${productRes.data.variants[0].size.toLowerCase()}` : 'original');
        }
        setReviews(reviewsRes.data.reviews || []);
        setReviewSummary(reviewsRes.data.summary || { averageRating: 0, totalReviews: 0 });
        const relatedRes = await axios.get(`/api/products/${id}/related`).catch(() => ({ data: [] }));
        setRelatedProducts(relatedRes.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Artwork details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const selectedOptionData = resolvedOptions.find((option: ResolvedOption) => option.key === selectedOption) || resolvedOptions[0];
  const selectedPrice = selectedOptionData ? selectedOptionData.price : 0;
  const isAlreadyInCart = product && cart?.some((item) => item.id === `${product._id}::${selectedOption}`);

  const handleAddToCart = () => {
    if (!auth?.user) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (product && selectedOptionData) {
      addToCart({
        ...product,
        id: `${product._id}::${selectedOption}`,
        productId: product._id,
        image: getOptimizedImageUrl(selectedOptionData.getImage(product)),
        price: selectedPrice,
        buyerOption: resolveBuyerOption(selectedOption),
        buyerOptionLabel: selectedOptionData.label,
      });
      toast.success(`${selectedOptionData.label} added to cart`);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!auth?.user) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.info('Please login to save artworks');
      navigate('/login');
      return;
    }

    try {
      const saved = await toggleWishlist(product._id);
      toast.success(saved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (error) {
      toast.error('Could not update wishlist');
    }
  };

  const handleSaveToCollection = async (collectionId: string) => {
    if (!product) return;
    try {
      await addToCollection(collectionId, product._id);
      toast.success('Saved to collection');
    } catch (error) {
      toast.error('Could not save to collection');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-logo-purple/30 border-t-logo-purple rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading artwork details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{error || 'Artwork not found'}</h2>
        <Link to="/shop" className="text-logo-purple font-bold hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const images = (product.images && product.images.length > 0) ? product.images : [product.imageUrl];
  const showSketch = selectedOption === 'canvas-sketch' && product.canvasSketchImageUrl;
  const carouselImages = showSketch ? [product.canvasSketchImageUrl] : images;

  return (
    <div className="product-details-page">
      <div className="container-custom">
        <div className="product-layout grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
          <div className="product-image-section">
            {carouselImages.length <= 1 ? (
              <div className="product-main-image rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                <img src={getOptimizedImageUrl(carouselImages[0])} alt={product.title} className="w-full h-auto object-cover" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="relative product-main-image rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 group">
                  <img src={getOptimizedImageUrl(carouselImages[carouselIndex] || carouselImages[0])} alt={product.title} className="w-full h-auto object-cover transition-all duration-300" />
                  
                  {/* Prev Button */}
                  <button 
                    type="button"
                    onClick={() => setCarouselIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur flex items-center justify-center shadow hover:bg-white text-gray-800 dark:text-gray-250 transition opacity-0 group-hover:opacity-100 font-bold"
                  >
                    ◀
                  </button>
                  
                  {/* Next Button */}
                  <button 
                    type="button"
                    onClick={() => setCarouselIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur flex items-center justify-center shadow hover:bg-white text-gray-800 dark:text-gray-250 transition opacity-0 group-hover:opacity-100 font-bold"
                  >
                    ▶
                  </button>
                </div>
                
                {/* Thumbnail Indicators */}
                <div className="flex gap-2 justify-center overflow-x-auto py-2">
                  {carouselImages.map((img, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      onClick={() => setCarouselIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${carouselIndex === idx ? 'border-logo-purple' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={getOptimizedImageUrl(img)} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="product-details-section">
            <h1 className="product-name text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {toTitleCase(product.title)}
            </h1>

            {product.type === 'original-artwork' && (
              <div className="flex gap-2 mb-3">
                <span className="bg-logo-purple/10 text-logo-purple px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider">
                  ORIGINAL
                </span>
                <span className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider">
                  PRINTS AVAILABLE
                </span>
              </div>
            )}

            {product.artistName && (
              <Link
                to={`/artist/${product.artistId}`}
                className="product-artist-name text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium hover:text-logo-purple transition-colors mb-2 block"
              >
                by {product.artistName}
              </Link>
            )}

            <div className="flex items-center gap-1.5 mb-6 text-xs text-gray-500 dark:text-gray-400 font-normal">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span>{reviewSummary.averageRating || 0} / 5</span>
              <span className="text-gray-400 dark:text-gray-500">·</span>
              <span className="text-gray-500 dark:text-gray-400">{reviewSummary.totalReviews} reviews</span>
            </div>

            <div className="mb-6">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal block mb-0.5">
                {selectedOptionData?.label === 'Original Artwork' ? 'Original Artwork' : selectedOptionData?.label || 'Price'}
              </span>
              <p className="product-price-large text-2xl md:text-3xl font-semibold text-logo-purple">
                ₹{selectedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8 items-center">
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`px-4 py-2.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-2 transition-colors ${
                  wishlistIds.has(product._id) ? 'border-red-200 bg-red-50 text-red-600 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Heart size={16} className={wishlistIds.has(product._id) ? 'fill-red-600 dark:fill-red-400' : ''} />
                {wishlistIds.has(product._id) ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Share2 size={16} />
                  Share
                </button>
                {showShareMenu && (
                  <div 
                    className="absolute top-12 left-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-2 flex flex-col gap-1 z-20 w-40"
                  >
                    <button
                      onClick={() => handleShareOption('whatsapp')}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 text-left w-full cursor-pointer"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShareOption('email')}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 text-left w-full cursor-pointer"
                    >
                      Email
                    </button>
                    <button
                      onClick={() => handleShareOption('copy')}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 text-left w-full cursor-pointer"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
              {auth?.user && collections.filter((collection) => !collection.isDefault).slice(0, 2).map((collection) => (
                <button
                  key={collection._id}
                  type="button"
                  onClick={() => handleSaveToCollection(collection._id)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Save to {collection.name}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Choose Format</h3>
              <div className="grid gap-3">
                {resolvedOptions.map((option: ResolvedOption) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedOption(option.key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedOption === option.key
                        ? 'border-logo-purple bg-logo-purple/5 shadow-sm'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-white block">{option.label}</span>
                        {option.dimensions && <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5 font-normal">{option.dimensions}</span>}
                      </div>
                      <span className="text-logo-purple font-semibold text-sm md:text-base">
                        ₹{option.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="product-description mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About This Artwork</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
            </div>

             <div className="product-details-list mb-6 space-y-2 border-t border-b border-gray-150 dark:border-gray-800 py-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Category:</span>
                <span className="font-bold text-gray-900 dark:text-white capitalize">{product.category || 'Artwork'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Medium:</span>
                <span className="font-bold text-gray-900 dark:text-white">{product.medium || 'Fine Art'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Dimensions:</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedOptionData?.dimensions || product.dimensions || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Year:</span>
                <span className="font-bold text-gray-900 dark:text-white">{product.year || 'Recent'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Stock Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-xs ${(product.stockQuantity ?? 0) > 0 ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'}`}>
                  {(product.stockQuantity ?? 0) > 0 ? 'In Stock (Available)' : 'Sold Out'}
                </span>
              </div>
              {product.videoUrl && (
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-500">Making-of Video:</span>
                  <a href={product.videoUrl} target="_blank" rel="noreferrer" className="text-logo-purple font-bold hover:underline">
                    Watch Reference
                  </a>
                </div>
              )}
            </div>

            {/* Visual Trust System Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex gap-3 p-4 rounded-xl border border-gray-150 dark:border-border-dark bg-gray-50/50 dark:bg-background-card-dark/40">
                <Award className="text-logo-purple shrink-0 animate-pulse-slow" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-text-dark-primary mb-0.5">Authenticity Guaranteed</h4>
                  <p className="text-[10px] text-gray-550 dark:text-text-dark-secondary leading-snug">Original works include a signed Certificate of Authenticity by the artist.</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-xl border border-gray-150 dark:border-border-dark bg-gray-50/50 dark:bg-background-card-dark/40">
                <Truck className="text-logo-purple shrink-0" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-text-dark-primary mb-0.5">Premium Art Insured Shipping</h4>
                  <p className="text-[10px] text-gray-550 dark:text-text-dark-secondary leading-snug">Secure packing in custom wooden crates/heavy tubes. Delivered in 10-14 days.</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-xl border border-gray-150 dark:border-border-dark bg-gray-50/50 dark:bg-background-card-dark/40">
                <RotateCcw className="text-logo-purple shrink-0" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-text-dark-primary mb-0.5">7-Day Easy Returns</h4>
                  <p className="text-[10px] text-gray-550 dark:text-text-dark-secondary leading-snug">Not completely in love? We offer hassle-free return shipping and processing.</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-xl border border-gray-150 dark:border-border-dark bg-gray-50/50 dark:bg-background-card-dark/40">
                <ShieldCheck className="text-logo-purple shrink-0" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-text-dark-primary mb-0.5">Secure Transaction</h4>
                  <p className="text-[10px] text-gray-550 dark:text-text-dark-secondary leading-snug">SSL encrypted checkout processing powered by PhonePe and Stripe protocols.</p>
                </div>
              </div>
            </div>

            {(product.stockQuantity ?? 0) > 0 ? (
              isAlreadyInCart ? (
                <Link
                  to="/cart"
                  className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-green-600/10 flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <ShoppingBag size={18} />
                  Go to Cart
                </Link>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full md:w-auto bg-logo-purple text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-logo-purple/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>
              )
            ) : (
              <button className="bg-gray-200 dark:bg-gray-800 text-gray-450 dark:text-gray-500 px-6 py-2.5 rounded-xl cursor-not-allowed font-semibold text-xs" disabled>
                Sold Out
              </button>
            )}
          </div>
        </div>

        <section className="py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ratings & Feedback</h2>
            {auth?.user ? (
              <Link to="/profile" className="text-logo-purple font-semibold hover:underline">Review from your orders</Link>
            ) : (
              <span className="text-sm text-gray-500">Login after purchase to leave feedback</span>
            )}
          </div>
          {reviews.length > 0 ? (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <p className="font-bold text-gray-900 dark:text-white">{review.title || 'Customer review'}</p>
                    <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-yellow-600 mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                  {review.comment && <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>}
                  <p className="text-sm text-gray-500 mt-3">by {review.user?.name || 'Verified buyer'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No feedback yet for this artwork.</p>
          )}
        </section>

        {relatedProducts.length > 0 && (
          <section className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Works</h2>
              <Link to={`/shop?category=${encodeURIComponent(product.category || '')}`} className="text-logo-purple font-semibold hover:underline">
                Explore category
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
