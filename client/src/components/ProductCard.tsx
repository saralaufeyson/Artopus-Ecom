import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { toast } from 'react-toastify';
import { getOptimizedImageUrl } from '../utils/image';
import { Heart, Share2 } from 'lucide-react';

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
  category?: string;
  stockQuantity?: number;
  artistId?: string;
  artistName?: string;
  variants?: Variant[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const auth = useContext(AuthContext);

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isOriginal = product.type === 'original-artwork';
  const isGalleryWorth = product.category?.toLowerCase() === 'gallery worth paintings' || product.category?.toLowerCase() === 'gallery worth painting';
  const a4Variant = product.variants?.find((v) => v.category === 'Print on Demand' && v.size === 'A4');
  const displayPrice = isOriginal ? (a4Variant?.price || 2806.70) : product.price;
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist } = useCollections();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const prices = [product.price, ...(product.variants || []).map((v) => v.price)].filter(
    (p) => typeof p === 'number' && !isNaN(p) && p > 0
  );
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : displayPrice;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/product/${product._id}`;
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

  const handleShareOption = (option: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/product/${product._id}`;
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
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            type="button"
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-black/35 text-white hover:bg-black/55 backdrop-blur-md flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            aria-label="Share product"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
              wishlistIds.has(product._id) ? 'bg-red-500 text-white' : 'bg-black/35 text-white hover:bg-black/55'
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart size={16} className={wishlistIds.has(product._id) ? 'fill-white' : ''} />
          </button>
        </div>
        {showShareMenu && (
          <div 
            className="absolute top-14 right-3 bg-white dark:bg-gray-900 border border-gray-250 dark:border-border-dark rounded-xl shadow-lg p-2 flex flex-col gap-1 z-20 w-36"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button
              onClick={(e) => handleShareOption('whatsapp', e)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 text-left w-full cursor-pointer"
            >
              WhatsApp
            </button>
            <button
              onClick={(e) => handleShareOption('email', e)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 text-left w-full cursor-pointer"
            >
              Email
            </button>
            <button
              onClick={(e) => handleShareOption('copy', e)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 text-left w-full cursor-pointer"
            >
              Copy Link
            </button>
          </div>
        )}
        {isGalleryWorth ? (
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-amber-500 to-logo-purple text-white px-2.5 py-1 rounded text-[8px] font-bold uppercase tracking-widest shadow-md border border-amber-400/20">
              Gallery Worth Painting
            </span>
          </div>
        ) : (
          product.type === 'original-artwork' && (
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              <span className="bg-logo-purple/95 text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm">
                Original
              </span>
              <span className="bg-emerald-600/95 text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm">
                Prints
              </span>
            </div>
          )
        )}
        {(product.stockQuantity ?? 0) <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold uppercase tracking-wider text-xs shadow-md">Sold Out</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/product/${product._id}`} className="block">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5 line-clamp-1 group-hover:text-logo-purple transition-colors">
              {toTitleCase(product.title)}
            </h3>
          </Link>
          {product.artistName && (
            <Link 
              to={`/artist/${product.artistId}`}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-logo-purple transition-colors mb-3 block font-normal"
            >
              by {toTitleCase(product.artistName)}
            </Link>
          )}

          <div className="mt-3 mb-4">
            {isGalleryWorth ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-logo-purple">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal mt-0.5 block">
                  Original Artwork
                </span>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">From</span>
                  <span className="text-sm font-semibold text-logo-purple">₹{lowestPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal mt-0.5 block">
                  {product.type === 'original-artwork' ? 'Prints · A4 starting price' : 'Standard delivery'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-auto pt-2">
          {(!isOriginal || product.stockQuantity === 0) && (product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) < 5 && (
            <p className="text-[10px] font-bold text-red-500 mb-2">Only {product.stockQuantity ?? 0} left!</p>
          )}
          
          <div className="flex gap-2.5 items-center">
            <Link
              to={`/product/${product._id}`}
              className="flex-1 text-center rounded-xl border border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-all hover:text-logo-purple hover:border-logo-purple/30 cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              View Details
            </Link>
            {(product.stockQuantity ?? 0) > 0 ? (
              <Link
                to={`/product/${product._id}`}
                className="flex-[1.8] text-center rounded-xl font-semibold text-xs bg-logo-purple text-white hover:bg-logo-purple/90 active:scale-95 transition-all shadow-md shadow-logo-purple/10 cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Add to Cart
              </Link>
            ) : (
              <button
                disabled
                className="flex-[1.8] rounded-xl font-semibold text-xs transition-all bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-650 cursor-not-allowed shadow-none min-h-[44px] flex items-center justify-center"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
