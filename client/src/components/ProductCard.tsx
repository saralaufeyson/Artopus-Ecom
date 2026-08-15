import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { toast } from 'react-toastify';
import { getOptimizedImageUrl } from '../utils/image';
import { Heart } from 'lucide-react';

interface Variant {
  category: string;
  size?: string;
  price: number;
  dimensions?: string;
  stockQuantity?: number;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  type: string;
  stockQuantity?: number;
  artistId?: string;
  artistName?: string;
  variants?: Variant[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useContext(CartContext)!;
  const auth = useContext(AuthContext);

  const isOriginal = product.type === 'original-artwork';
  const a4Variant = product.variants?.find((v) => v.category === 'Print on Demand' && v.size === 'A4');
  const displayPrice = isOriginal ? (a4Variant?.price || 2806.70) : product.price;
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist } = useCollections();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!auth?.user) {
      // Store current location for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if ((product.stockQuantity ?? 0) <= 0) {
      toast.error('Item is out of stock');
      return;
    }

    // Convert _id to id if CartContext expects id
    const success = addToCart({ ...product, id: product._id, image: getOptimizedImageUrl(product.imageUrl) });
    if (success) {
      toast.success('Added to cart!');
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  return (
    <div className={`card h-full flex flex-col group transition-all duration-300 hover:shadow-md border border-gray-150 dark:border-border-dark rounded-2xl overflow-hidden bg-white dark:bg-background-card-dark ${(product.stockQuantity ?? 0) <= 0 ? 'opacity-75' : ''}`}>
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden m-3 rounded-xl aspect-[4/3]">
        <img
          src={getOptimizedImageUrl(product.imageUrl)}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${(product.stockQuantity ?? 0) <= 0 ? 'grayscale' : ''}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-sm ${
            wishlistIds.has(product._id) ? 'bg-red-500 text-white' : 'bg-black/35 text-white hover:bg-black/55'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={wishlistIds.has(product._id) ? 'fill-white' : ''} />
        </button>
        {product.type === 'original-artwork' && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className="bg-logo-purple/95 text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm">
              Original
            </span>
            <span className="bg-emerald-600/95 text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm">
              Prints
            </span>
          </div>
        )}
        {(product.stockQuantity ?? 0) <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold uppercase tracking-wider text-xs shadow-md">Sold Out</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <Link to={`/product/${product._id}`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-text-dark-primary mb-1 line-clamp-1 group-hover:text-logo-purple transition-colors">
              {product.title}
            </h3>
          </Link>
          {product.artistName && (
            <Link 
              to={`/artist/${product.artistId}`}
              className="text-xs text-gray-500 dark:text-text-dark-secondary hover:text-logo-purple transition-colors mb-2 block font-medium"
            >
              by {product.artistName}
            </Link>
          )}
          <div className="flex justify-between items-end mt-2">
            <div>
              <p className="text-xl font-bold text-logo-purple">₹{displayPrice}</p>
              {isOriginal && (
                <span className="text-[9px] uppercase font-semibold tracking-wider text-gray-400 dark:text-gray-500 block mt-0.5">
                  A4 Print Price
                </span>
              )}
            </div>
            {!isOriginal && (product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) < 5 && (
              <p className="text-[10px] font-bold text-red-500 mb-0.5">Only {product.stockQuantity ?? 0} left!</p>
            )}
          </div>
        </div>

        <div className="mt-auto flex gap-3 items-center">
          <Link
            to={`/product/${product._id}`}
            className="flex-1 text-center py-2 rounded-xl border border-gray-200 dark:border-border-dark text-gray-805 dark:text-text-dark-primary font-bold text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
          >
            Details
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={(product.stockQuantity ?? 0) <= 0}
            className={`flex-[1.5] py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
              (product.stockQuantity ?? 0) > 0 
                ? 'bg-logo-purple text-white hover:opacity-90 active:scale-95 shadow-logo-purple/10' 
                : 'bg-gray-150 dark:bg-gray-800 text-gray-400 dark:text-gray-505 cursor-not-allowed shadow-none'
            }`}
          >
            {(product.stockQuantity ?? 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
