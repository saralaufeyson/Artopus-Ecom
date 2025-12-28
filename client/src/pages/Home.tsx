import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; // Import your existing card component
import '../global.css'; // Centralized global styles

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
        setFeaturedProducts(formattedProducts.slice(-4));
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <h1>Discover Exceptional Indian Art</h1>
          <p>
            Explore our curated collection of contemporary and traditional artworks from talented Indian artists.
            Each piece tells a unique story of culture, creativity, and craftsmanship.
          </p>
          <Link to="/shop" className="button-primary">
            Explore Collection
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="text-center mb-4">
            <h2>Featured Artworks</h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Discover our handpicked selection of exceptional pieces from emerging and established artists
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="artwork-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4 mx-auto mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="mt-4 text-secondary">Loading featured artworks...</p>
            </div>
          )}

          <div className="text-center mt-4">
            <Link to="/shop" className="button-primary">
              View All Artworks
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="text-center mb-4">
            <h2>Art Categories</h2>
            <p className="text-lg text-secondary">Explore different styles and mediums</p>
          </div>

          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">🎨</div>
              <h3>Paintings</h3>
              <p>Oil, acrylic, and watercolor masterpieces</p>
              <Link to="/shop?category=painting" className="category-link">Explore Paintings</Link>
            </div>

            <div className="category-card">
              <div className="category-icon">🖼️</div>
              <h3>Prints</h3>
              <p>Limited edition prints and reproductions</p>
              <Link to="/shop?category=print" className="category-link">Explore Prints</Link>
            </div>

            <div className="category-card">
              <div className="category-icon">🏺</div>
              <h3>Sculptures</h3>
              <p>Contemporary and traditional sculptures</p>
              <Link to="/shop?category=sculpture" className="category-link">Explore Sculptures</Link>
            </div>

            <div className="category-card">
              <div className="category-icon">🖍️</div>
              <h3>Drawings</h3>
              <p>Charcoal, pencil, and mixed media drawings</p>
              <Link to="/shop?category=drawing" className="category-link">Explore Drawings</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;