import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import '../global.css';

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
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-link">
        <img
          src={product.image}
          alt={product.title}
          className="product-image"
          loading="lazy"
        />
        {product.type === 'original-artwork' && (
          <div className="product-badge">Original</div>
        )}
      </Link>

      <div className="product-info">
        <div className="product-header">
          <h3 className="product-title">{product.title}</h3>
          <p className="product-price">${product.price}</p>
        </div>

        <div className="product-actions">
          <Link
            to={`/product/${product.id}`}
            className="product-link"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            className="button-primary product-cart-btn"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
