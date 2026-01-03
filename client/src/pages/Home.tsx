import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; // Import your existing card component

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
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20 text-center min-h-[60vh] flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Discover Exceptional Indian Art
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection of contemporary and traditional artworks from talented Indian artists.
            Each piece tells a unique story of culture, creativity, and craftsmanship.
          </p>
          <Link to="/shop" className="inline-block bg-indigo-primary text-white px-8 py-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Explore Collection
          </Link>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Artworks</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our handpicked selection of exceptional pieces from emerging and established artists
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading featured artworks...</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop" className="inline-block bg-indigo-primary text-white px-8 py-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              View All Artworks
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Art Categories</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Explore different styles and mediums</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Paintings</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Oil, acrylic, and watercolor masterpieces</p>
              <Link to="/shop?category=painting" className="inline-block text-indigo-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium border border-indigo-primary hover:border-indigo-700 dark:border-indigo-400 dark:hover:border-indigo-300 px-4 py-2 rounded-lg transition-colors duration-200">
                Explore Paintings
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Prints</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Limited edition prints and reproductions</p>
              <Link to="/shop?category=print" className="inline-block text-indigo-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium border border-indigo-primary hover:border-indigo-700 dark:border-indigo-400 dark:hover:border-indigo-300 px-4 py-2 rounded-lg transition-colors duration-200">
                Explore Prints
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl mb-4">🏺</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sculptures</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Contemporary and traditional sculptures</p>
              <Link to="/shop?category=sculpture" className="inline-block text-indigo-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium border border-indigo-primary hover:border-indigo-700 dark:border-indigo-400 dark:hover:border-indigo-300 px-4 py-2 rounded-lg transition-colors duration-200">
                Explore Sculptures
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl mb-4">🖍️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Drawings</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Charcoal, pencil, and mixed media drawings</p>
              <Link to="/shop?category=drawing" className="inline-block text-indigo-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium border border-indigo-primary hover:border-indigo-700 dark:border-indigo-400 dark:hover:border-indigo-300 px-4 py-2 rounded-lg transition-colors duration-200">
                Explore Drawings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;