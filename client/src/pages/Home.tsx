import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; // Import your existing card component
import '../styles.css'; // Changed to centralized CSS

interface Product {
  id: string;
  _id?: string; // Standard MongoDB ID
  title: string;
  price: number;
  image: string;
  type: string;
  imageUrl?: string; // Matches your backend model field name
}

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch products from your database
        const res = await axios.get('/api/products');
        
        // Transform the data to ensure 'id' and 'image' match the component's expectations
        const formattedProducts = res.data.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          image: p.imageUrl || p.image
        }));

        // Limit to the first 4 products for the "Featured" section
        setFeaturedProducts(formattedProducts.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Exceptional Art</h1>
          <p className="hero-subtitle">
            Explore curated collections from talented artists worldwide
          </p>
          <Link to="/shop" className="hero-button">
            Browse Collection
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-container">
          <h2 className="section-title">Featured Artworks</h2>
          {featuredProducts.length > 0 ? (
            <div className="artwork-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="loading-container">
              <p className="loading-text">Loading featured artworks...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;