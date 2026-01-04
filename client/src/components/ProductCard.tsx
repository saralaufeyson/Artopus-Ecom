import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  type: string;
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!auth?.user) {
      // Store current location for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }
    // Convert _id to id if CartContext expects id
    addToCart({ ...product, id: product._id, image: product.imageUrl });
    toast.success('Added to cart!');
  };

  return (
    <div className="card h-full flex flex-col group transition-all duration-300 hover:shadow-2xl border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-900">
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden m-4 rounded-[2rem]">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {product.type === 'original-artwork' && (
          <div className="absolute top-4 left-4 bg-logo-purple text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
            Original
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
          <p className="text-3xl font-black text-logo-purple">${product.price}</p>
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
            className="flex-[1.5] bg-logo-purple text-white py-4 rounded-2xl font-black text-sm hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-logo-purple/30"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
