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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        {product.type === 'original-artwork' && (
          <div className="absolute top-3 right-3 bg-indigo-primary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            Original
          </div>
        )}
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-2xl font-bold text-indigo-primary">${product.price}</p>
        </div>

        <div className="mt-auto flex gap-3 items-center">
          <Link
            to={`/product/${product.id}`}
            className="text-indigo-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm transition-colors duration-200"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-indigo-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
