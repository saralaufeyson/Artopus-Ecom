import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  _id: string;
  title: string;
  price: number;
  image: string;
  imageUrl: string;
  type: string;
  category?: string;
  stockQuantity?: number;
  artistName?: string;
}

interface ApiProduct {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  imageUrl?: string;
  image?: string;
  type: string;
  category?: string;
  stockQuantity?: number;
  artistName?: string;
}

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [freshArrivals, setFreshArrivals] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const [featuredRes, latestRes] = await Promise.all([
          axios.get('/api/products', { params: { featured: 'true', sort: 'price_desc' } }),
          axios.get('/api/products', { params: { sort: 'newest' } }),
        ]);

        const format = (list: ApiProduct[]) => list.map((p) => ({
          ...p,
          id: p._id || p.id,
          image: p.imageUrl || p.image,
        })) as Product[];

        setFeaturedProducts(format(featuredRes.data).slice(0, 4));
        setFreshArrivals(format(latestRes.data).slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch homepage products:', err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 dark:opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-orange-300 to-rose-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
              Collect <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-sky-500">Original</span> Art With Story
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed font-medium">
              Shop curated works, request sketch or colored variations, and discover artists building their own creative business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto">
                Explore Collection
              </Link>
              <Link to="/artist-activate" className="px-10 py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white font-semibold rounded-xl border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800 transition-all w-full sm:w-auto shadow-sm">
                Artist Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Curated Marketplace', desc: 'Admin-reviewed listings keep the catalog more consistent and trustworthy.' },
              { title: 'Custom Artwork Options', desc: 'Buyers can choose original, outline sketch, or colored versions on supported works.' },
              { title: 'Artist Earnings Layer', desc: 'Creators track submissions, orders, commissions, and withdrawals from one dashboard.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-3xl bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border-y border-white/10 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Featured Artworks</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                A premium mix of high-value originals and standout catalog pieces
              </p>
            </div>
            <Link to="/shop" className="text-logo-purple font-bold flex items-center gap-2 group">
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
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

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="lg:w-1/3">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Fresh Arrivals</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Newly approved pieces that just landed in the marketplace.
              </p>
              <Link to="/shop?sort=newest" className="inline-flex mt-6 text-logo-purple font-bold hover:underline">
                See New Listings
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6 flex-1">
              {freshArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Art Categories</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">Explore different styles and mediums</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { emoji: '🎨', title: 'Paintings', desc: 'Originals and custom-painted works', cat: 'Painting' },
              { emoji: '🖼️', title: 'Prints', desc: 'Reproducible works and collectible editions', cat: 'Print' },
              { emoji: '🧵', title: 'Merchandise', desc: 'Art translated into wearable and giftable formats', cat: 'Merchandise' },
              { emoji: '✏️', title: 'Drawings', desc: 'Sketches, linework, and mixed drawing studies', cat: 'Drawing' },
            ].map((category) => (
              <div key={category.title} className="group p-8 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:border-logo-purple/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-sm">
                <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{category.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{category.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">{category.desc}</p>
                <Link
                  to={`/shop?category=${encodeURIComponent(category.cat)}`}
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
