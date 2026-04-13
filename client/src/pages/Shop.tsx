import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  type: string;
  category: string;
  stockQuantity?: number;
  artistId: string;
  artistName: string;
}

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = Array.from(
    new Set(
      products
        .map((product) => product.category?.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    )
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (searchTerm.trim()) params.q = searchTerm.trim();
        if (typeFilter) params.type = typeFilter;
        if (categoryFilter) params.category = categoryFilter;
        if (sortBy) params.sort = sortBy;

        const res = await axios.get('/api/products', { params });
        setProducts(res.data);
        setSearchParams(params, { replace: true });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, searchTerm, setSearchParams, sortBy, typeFilter]);

  return (
    <div className="shop-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Shop Artworks</h1>
          <p className="page-description">Curated originals, prints, and custom options from independent artists</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-10">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search artworks, artists, or styles..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="original-artwork">Original Artwork</option>
            <option value="merchandise">Merchandise</option>
          </select>
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title_asc">Title: A-Z</option>
          </select>
        </div>

        <div className="shop-content">
          <aside className="filters-sidebar">
            <h3>Collections</h3>
            <div className="filter-group">
              <h4>Category</h4>
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <h4>Quick Picks</h4>
              <div className="flex flex-col gap-2">
                {['Painting', 'Print', 'Drawing', 'Merchandise'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                      categoryFilter === category ? 'border-logo-purple bg-logo-purple/5 text-logo-purple' : 'border-gray-200 dark:border-gray-800'
                    }`}
                    onClick={() => setCategoryFilter(categoryFilter === category ? '' : category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="products-section">
            {!loading && !error && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{products.length} artwork{products.length === 1 ? '' : 's'} found</p>
                {(searchTerm || typeFilter || categoryFilter) && (
                  <button
                    type="button"
                    className="text-sm font-bold text-logo-purple hover:underline"
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('');
                      setCategoryFilter('');
                      setSortBy('newest');
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-logo-purple/30 border-t-logo-purple rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium tracking-tight">Discovering masterpieces...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-8 rounded-3xl text-center">
                <p className="text-red-600 dark:text-red-400 font-bold mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm font-bold text-red-600 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : products.length > 0 ? (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                No products found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
