import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';


interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  type: string;
  stockQuantity: number;
  artistId?: string;
  artistName?: string;
  medium?: string;
  dimensions?: string;
  year?: string;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useContext(CartContext)!;
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        console.log(`Fetching product details for ${id}...`);
        const res = await axios.get(`/api/products/${id}`);
        console.log('Fetched product details:', res.data);
        setProduct(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Artwork details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!auth?.user) {
      // Store current location for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (product) {
      // Convert _id to id if CartContext expects id
      addToCart({ ...product, id: product._id, image: product.imageUrl });
      toast.success('Added to cart!');
    }
  };

  if (!product) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="product-details-page">
      <div className="page-container">
        <div className="product-layout grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
          <div className="product-image-section">
            <div className="product-main-image rounded-2xl overflow-hidden shadow-2xl">
              <img src={product.imageUrl} alt={product.title} className="w-full h-auto object-cover" />
            </div>
          </div>

          <div className="product-details-section">
            <h1 className="product-name text-4xl font-black text-gray-900 dark:text-white mb-2">{product.title}</h1>
            
            {product.artistName && (
              <Link 
                to={`/artist/${product.artistId}`}
                className="product-artist-name text-lg text-logo-purple font-bold hover:underline mb-4 block"
              >
                by {product.artistName}
              </Link>
            )}

            <p className="product-price-large text-3xl font-black text-logo-purple mb-8">${product.price}</p>

            <div className="product-description mb-4">
              <h3 className="font-semibold">About this artwork</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-details-list mb-4">
              <div className="detail-item">
                <span className="detail-label font-semibold">Medium:</span>
                <span className="detail-value">{product.medium}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label font-semibold">Dimensions:</span>
                <span className="detail-value">{product.dimensions}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label font-semibold">Year:</span>
                <span className="detail-value">{product.year}</span>
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
