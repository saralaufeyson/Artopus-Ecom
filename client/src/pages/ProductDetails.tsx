import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  type: string;
  stockQuantity: number;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useContext(CartContext)!;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success('Added to cart!');
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-details-page">
      <div className="page-container">
        <div className="product-layout">
          <div className="product-image-section">
            <div className="product-main-image">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded-lg" />
            </div>
          </div>

          <div className="product-details-section">
            <h1 className="product-name text-3xl font-bold mb-4">{product.title}</h1>
            <p className="product-artist-name text-gray-700 mb-4">by Artist Name</p>
            <p className="product-price-large text-2xl font-semibold mb-6">${product.price}</p>

            <div className="product-description mb-4">
              <h3 className="font-semibold">About this artwork</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-details-list mb-4">
              <div className="detail-item">
                <span className="detail-label font-semibold">Medium:</span>
                <span className="detail-value">Oil on Canvas</span>
              </div>
              <div className="detail-item">
                <span className="detail-label font-semibold">Dimensions:</span>
                <span className="detail-value">24" x 36"</span>
              </div>
              <div className="detail-item">
                <span className="detail-label font-semibold">Year:</span>
                <span className="detail-value">2024</span>
              </div>
            </div>

            {product.stockQuantity > 0 ? (
              <button
                onClick={handleAddToCart}
                className="add-to-cart-button bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Add to Cart
              </button>
            ) : (
              <button className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed" disabled>
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
