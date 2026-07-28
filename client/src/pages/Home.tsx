import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { AuthContext } from '../contexts/AuthContext';

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
  variants?: any[];
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
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [freshArrivals, setFreshArrivals] = useState<Product[]>([]);
  const [galleryWorthProducts, setGalleryWorthProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const [featuredRes, latestRes] = await Promise.all([
          axios.get('/api/products', { params: { featured: 'true', sort: 'price_desc' } }),
          axios.get('/api/products', { params: { sort: 'newest' } }),
        ]);

        const format = (list: unknown): Product[] => {
          const items = Array.isArray(list)
            ? list as ApiProduct[]
            : (typeof list === 'object' && list && 'data' in list && Array.isArray((list as { data?: unknown }).data)
              ? (list as { data: ApiProduct[] }).data
              : []);

          return items.map((p) => ({
            ...p,
            id: p._id || p.id,
            image: p.imageUrl || p.image,
          })) as Product[];
        };

        const formattedFeatured = format(featuredRes.data);
        const formattedLatest = format(latestRes.data);
        
        if (formattedFeatured.length > 0) {
          setFeaturedProducts(formattedFeatured.slice(0, 4));
        } else {
          setFeaturedProducts(formattedLatest.slice(0, 4));
        }
        setFreshArrivals(formattedLatest.slice(0, 3));

        const galleryWorth = formattedLatest.filter(p => p.price > 6000);
        setGalleryWorthProducts(galleryWorth.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch homepage products:', err);
      }
    };
    fetchFeatured();
  }, []);

  if (user?.role === 'artist') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-35 dark:opacity-45 pointer-events-none">
          <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[65%] bg-gradient-to-br from-indigo-300 via-purple-300 to-rose-300 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[65%] bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-300 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-logo-purple mb-4 block">Artopus Artist Studio</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-tight">
            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-logo-purple via-indigo-500 to-purple-500">{user.name}</span>!
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            This is your workspace hub. Manage your creations, configure multi-image galleries for variant prints (A5, A4, A3), fulfill orders, and monitor your wallet payouts all in one unified control panel.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto mb-16">
            <Link to="/artist-dashboard" className="py-4 px-8 bg-logo-purple hover:bg-logo-purple/90 text-white font-bold rounded-2xl shadow-xl transition-all w-full sm:w-auto">
              Go to Artist Dashboard
            </Link>
            <Link to="/artist-dashboard" className="py-4 px-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-805 font-bold rounded-2xl transition-all w-full sm:w-auto">
              Manage Listings
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow-sm text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-logo-purple mb-4">🎨</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">Configure Prints</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Offer original artworks alongside A5, A4, and A3 size variants with individual pricing models.</p>
            </div>
            <div className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow-sm text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-650 mb-4">🖼️</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">Multi-Image Previews</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload up to 5 images for each listing with drag-free reordering, deletion, and gallery previews.</p>
            </div>
            <div className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow-sm text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-650 mb-4">💰</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">Direct Payouts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monitor earnings directly from payments and request instant admin withdrawals inside your wallet.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-36">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 dark:opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-orange-300 to-rose-450 rounded-full blur-[130px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-300 to-indigo-400 rounded-full blur-[130px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-logo-purple mb-4 block">Artopus India</span>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[1.05]">
              Handcrafted <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-sky-500">Fine Art</span> & Academy
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed font-medium">
              Discover premium original paintings and art prints, or unlock your creative potential with interactive, live online art classes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto shadow-lg shadow-logo-purple/20">
                Explore Art Gallery
              </Link>
              <a href="#academy" className="px-10 py-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-950 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-all w-full sm:w-auto shadow-sm">
                Creative Art Academy
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-10 border-y border-gray-150 dark:border-gray-850 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Happy Students' },
              { value: '40+', label: 'Original Artworks' },
              { value: '10+', label: 'Expert Mentors' },
              { value: '100%', label: 'Hands-on Learning' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-black text-logo-purple mb-1">{stat.value}</p>
                <p className="text-xs uppercase font-semibold tracking-wider text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Offerings Detail Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-stretch">
            {/* Art Studio Detail */}
            <div className="p-10 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3 block">01 / Fine Art Gallery</span>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Handcrafted Canvas & Prints</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Decorate your living spaces with premium original art. Choose from canvas paintings, custom commissions, or high-quality size prints (A5, A4, A3) to suit your specific format preferences.
                </p>
                <ul className="space-y-3 mb-10 text-sm text-gray-600 dark:text-gray-400 font-medium">
                  <li className="flex items-center gap-2">✓ Hand-painted oils, acrylics, and mixed media</li>
                  <li className="flex items-center gap-2">✓ Custom original commissions based on your story</li>
                  <li className="flex items-center gap-2">✓ Size-specific Print on Demand variants</li>
                </ul>
              </div>
              <Link to="/shop" className="btn-primary text-center py-4 rounded-xl font-bold">
                Shop Original Collection
              </Link>
            </div>

            {/* Creative Academy Detail */}
            <div id="academy" className="p-10 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-3 block">02 / Academy</span>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Interactive Live Art Classes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Join our online art sessions conducted live via Zoom or Google Meet. Specially tailored for students aged 5 to 18 years old, welcoming beginners to advanced creators.
                </p>
                <ul className="space-y-3 mb-10 text-sm text-gray-600 dark:text-gray-400 font-medium">
                  <li className="flex items-center gap-2">✓ Real-time mentor guidance and live feedback</li>
                  <li className="flex items-center gap-2">✓ Age-appropriate curriculums for kids & teens</li>
                  <li className="flex items-center gap-2">✓ Convenient weekly schedules & online formats</li>
                </ul>
              </div>
              <a href="mailto:academy@artopusindia.com?subject=Inquiry about Art Classes" className="w-full text-center py-4 bg-sky-550 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 transition-all">
                Request a Free Demo Class
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks Section */}
      <section className="py-24 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border-y border-gray-150 dark:border-gray-850">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Featured Artworks</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                A premium selection of hand-selected originals and standout prints.
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

      {/* Gallery Worth Paintings Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/10 dark:to-gray-950/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-logo-purple mb-3 block">Premium Collection</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Gallery Worth Paintings</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Museum-grade original canvas masterpieces and certified fine art prints.
              </p>
            </div>
            <Link to="/shop?category=Gallery+worth+paintings" className="text-logo-purple font-bold flex items-center gap-2 group">
              View Premium Art <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {galleryWorthProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {galleryWorthProducts.map((product) => (
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

      {/* Fresh Arrivals Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="lg:w-1/3">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Fresh Arrivals</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Newly approved pieces that just landed in the studio gallery catalog.
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

      {/* Art Categories Section */}
      <section className="py-24 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-t border-gray-150 dark:border-gray-850">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Art Categories</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">Explore different styles and mediums</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { emoji: '🎨', title: 'Paintings', desc: 'Originals and custom-painted works', cat: 'Painting' },
              { emoji: '🖼️', title: 'Prints', desc: 'Reproducible works and collectible editions', cat: 'Print' },
              { emoji: '🧵', title: 'Merchandise', desc: 'Art translated into wearable and giftable formats', cat: 'Merchandise' },
              { emoji: '✏️', title: 'Drawings', desc: 'Sketches, linework, and mixed drawing studies', cat: 'Drawing' },
            ].map((category) => (
              <div key={category.title} className="group p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 hover:border-logo-purple/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-sm">
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
