import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { toast } from 'react-toastify';
import { getOptimizedImageUrl } from '../utils/image';
import { Heart } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  type: string;
  stockQuantity?: number;
  artistId?: string;
  artistName?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useContext(CartContext)!;
  const auth = useContext(AuthContext);
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
    <div className={`card h-full flex flex-col group transition-all duration-300 hover:shadow-2xl border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-900 ${(product.stockQuantity ?? 0) <= 0 ? 'opacity-75' : ''}`}>
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden m-4 rounded-[2rem]">
        <img
          src={getOptimizedImageUrl(product.imageUrl)}
          alt={product.title}
          className={`w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110 ${(product.stockQuantity ?? 0) <= 0 ? 'grayscale' : ''}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
            wishlistIds.has(product._id) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} className={wishlistIds.has(product._id) ? 'fill-white' : ''} />
        </button>
        {product.type === 'original-artwork' && (
          <div className="absolute top-4 left-4 bg-logo-purple text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
            Original
          </div>
        )}
        {(product.stockQuantity ?? 0) <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm shadow-xl">Sold Out</span>
          </div>
        )}
      </Link>

      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-6">
          <Link to={`/product/${product._id}`}>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-logo-purple transition-colors">
              {product.title}
            </h3>
          </Link>
          {product.artistName && (
            <Link 
              to={`/artist/${product.artistId}`}
              className="text-base text-gray-500 hover:text-logo-purple transition-colors mb-3 block font-medium"
            >
              by {product.artistName}
            </Link>
          )}
          <div className="flex justify-between items-end">
            <p className="text-3xl font-black text-logo-purple">${product.price}</p>
            {(product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) < 5 && (
              <p className="text-xs font-bold text-red-500 mb-1">Only {product.stockQuantity ?? 0} left!</p>
            )}
          </div>
        </div>

        <div className="mt-auto flex gap-4 items-center">
          <Link
            to={`/product/${product._id}`}
            className="flex-1 text-center py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white font-black text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Details
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={(product.stockQuantity ?? 0) <= 0}
            className={`flex-[1.5] py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${
              (product.stockQuantity ?? 0) > 0 
                ? 'bg-logo-purple text-white hover:opacity-90 active:scale-95 shadow-logo-purple/30' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
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
