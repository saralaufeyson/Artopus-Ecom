import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingBag, Star } from 'lucide-react';
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
  outlineSketchPrice?: number;
  coloringPrice?: number;
  imageUrl: string;
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

const optionConfig = [
  { key: 'painting', label: 'Original Painting', getPrice: (product: Product) => product.price },
  { key: 'outline-sketch', label: 'Outline Sketch', getPrice: (product: Product) => product.outlineSketchPrice || product.price },
  { key: 'colored-version', label: 'Colored Version', getPrice: (product: Product) => product.coloringPrice || product.price },
] as const;

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'painting' | 'outline-sketch' | 'colored-version'>('painting');
  const { addToCart } = useContext(CartContext)!;
  const auth = useContext(AuthContext);
  const { collections, wishlistIds, toggleWishlist, addToCollection } = useCollections();
  const navigate = useNavigate();

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

  const selectedOptionData = product
    ? optionConfig.find((option) => option.key === selectedOption) || optionConfig[0]
    : optionConfig[0];
  const selectedPrice = product ? selectedOptionData.getPrice(product) : 0;

  const handleAddToCart = () => {
    if (!auth?.user) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (product) {
      addToCart({
        ...product,
        id: `${product._id}::${selectedOption}`,
        productId: product._id,
        image: getOptimizedImageUrl(product.imageUrl),
        price: selectedPrice,
        buyerOption: selectedOption,
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

  return (
    <div className="product-details-page">
      <div className="page-container">
        <div className="product-layout grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
          <div className="product-image-section">
            <div className="product-main-image rounded-2xl overflow-hidden shadow-2xl">
              <img src={getOptimizedImageUrl(product.imageUrl)} alt={product.title} className="w-full h-auto object-cover" />
            </div>
          </div>

          <div className="product-details-section">
            <h1 className="product-name text-4xl font-black text-gray-900 dark:text-white mb-2">{product.title}</h1>

            {product.artistName && (
              <Link
                to={`/artist/${product.artistId}`}
                className="product-artist-name text-lg text-logo-purple font-bold hover:underline mb-4 block"
              >
                by {product.artistName}
              </Link>
            )}

            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span>{reviewSummary.averageRating || 0} / 5</span>
              <span>({reviewSummary.totalReviews} reviews)</span>
            </div>

            <p className="product-price-large text-3xl font-black text-logo-purple mb-6">${selectedPrice.toFixed(2)}</p>

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`px-5 py-3 rounded-2xl border font-bold flex items-center gap-2 ${
                  wishlistIds.has(product._id) ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <Heart size={18} className={wishlistIds.has(product._id) ? 'fill-red-600' : ''} />
                {wishlistIds.has(product._id) ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>
              {auth?.user && collections.filter((collection) => !collection.isDefault).slice(0, 2).map((collection) => (
                <button
                  key={collection._id}
                  type="button"
                  onClick={() => handleSaveToCollection(collection._id)}
                  className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 font-bold"
                >
                  Save to {collection.name}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-3">Choose Format</h3>
              <div className="grid gap-3">
                {optionConfig.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedOption(option.key)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedOption === option.key
                        ? 'border-logo-purple bg-logo-purple/5'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-gray-900 dark:text-white">{option.label}</span>
                      <span className="text-logo-purple font-bold">${option.getPrice(product).toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="product-description mb-4">
              <h3 className="font-semibold">About this artwork</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-details-list mb-6">
              <div className="detail-item">
                <span className="detail-label font-semibold">Medium:</span>
                <span className="detail-value">{product.medium || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label font-semibold">Dimensions:</span>
                <span className="detail-value">{product.dimensions || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label font-semibold">Year:</span>
                <span className="detail-value">{product.year || '-'}</span>
              </div>
              {product.videoUrl && (
                <div className="detail-item">
                  <span className="detail-label font-semibold">Making-of Video:</span>
                  <a href={product.videoUrl} target="_blank" rel="noreferrer" className="text-logo-purple font-medium hover:underline">
                    Watch Reference
                  </a>
                </div>
              )}
            </div>

            {(product.stockQuantity ?? 0) > 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-full md:w-auto bg-logo-purple text-white px-10 py-4 rounded-2xl font-black text-lg hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-logo-purple/30 flex items-center justify-center gap-3"
              >
                <ShoppingBag size={24} />
                Add to Cart
              </button>
            ) : (
              <button className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed" disabled>
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
