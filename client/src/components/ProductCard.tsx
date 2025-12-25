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

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('Added to cart!');
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <img src={product.image} alt={product.title} className="w-full h-48 object-cover cursor-pointer" />
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.title}</h3>
        <p className="text-gray-600">${product.price}</p>
        {product.type === 'original-artwork' && (
          <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold mt-2">
            Unique
          </span>
        )}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
