import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import '../styles.css';

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
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.image} alt={product.title} />
      </Link>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">${product.price}</p>
        {product.type === 'original-artwork' && (
          <span className="product-badge">Unique</span>
        )}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            className="add-to-cart-button"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
