import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  type: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useContext(CartContext)!;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Added to cart!');
  };

  return (
    <div className="card h-full flex flex-col group">
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden">
        <img
          src={product.image}
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

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-logo-purple transition-colors">
            {product.title}
          </h3>
          <p className="text-2xl font-black text-logo-purple">${product.price}</p>
        </div>

        <div className="mt-auto flex gap-3 items-center">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 text-center py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Details
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex-[1.5] bg-logo-purple text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-logo-purple/20"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
