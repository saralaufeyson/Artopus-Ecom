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

interface ApiProduct {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  imageUrl?: string;
  image?: string;
  type: string;
}

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch products from your database
        const res = await axios.get('/api/products');

        // Transform the data to ensure 'id' and 'image' match the component's expectations
        const formattedProducts = res.data.map((p: ApiProduct) => ({
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
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 dark:opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">Exceptional</span> Indian Art
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed font-medium">
              Explore our curated collection of contemporary and traditional artworks from talented Indian artists.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto">
                Explore Collection
              </Link>
              <Link to="/register" className="px-10 py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white font-semibold rounded-xl border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800 transition-all w-full sm:w-auto shadow-sm">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border-y border-white/10 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Featured Artworks</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover our handpicked selection of exceptional pieces from emerging and established artists
              </p>
            </div>
            <Link to="/shop" className="text-logo-purple font-bold flex items-center gap-2 group">
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-2xl mb-4"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-6 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Art Categories</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">Explore different styles and mediums</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { emoji: '🎨', title: 'Paintings', desc: 'Oil, acrylic, and watercolor masterpieces', cat: 'painting' },
              { emoji: '🖼️', title: 'Prints', desc: 'Limited edition prints and reproductions', cat: 'print' },
              { emoji: '🏺', title: 'Sculptures', desc: 'Contemporary and traditional sculptures', cat: 'sculpture' },
              { emoji: '🖍️', title: 'Drawings', desc: 'Charcoal, pencil, and mixed media drawings', cat: 'drawing' }
            ].map((category) => (
              <div key={category.title} className="group p-8 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:border-logo-purple/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-sm">
                <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{category.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{category.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">{category.desc}</p>
                <Link 
                  to={`/shop?category=${category.cat}`} 
                  className="inline-flex items-center gap-2 font-bold text-logo-purple group/btn"
                >
                  Explore <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;