import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

interface Variant {
  category: string;
  size?: string;
  price: number;
  dimensions?: string;
  stockQuantity?: number;
}

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
  variants?: Variant[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, limit: 12, pages: 1 });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseCategories = Array.from(
    new Set(
      products
        .map((product) => product.category?.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    )
  );
  const categories = ['Gallery worth paintings', ...baseCategories];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {};
        if (searchTerm.trim()) params.q = searchTerm.trim();
        if (typeFilter) params.type = typeFilter;
        if (categoryFilter) {
          if (categoryFilter === 'Gallery worth paintings') {
            params.minPrice = 6000;
            params.type = 'original-artwork';
          } else {
            params.category = categoryFilter;
          }
        }
        if (minPrice && categoryFilter !== 'Gallery worth paintings') params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (inStockOnly) params.inStock = 'true';
        if (sortBy) params.sort = sortBy;
        params.page = currentPage;
        params.limit = 12;

        const res = await axios.get('/api/products', { params });
        
        // Handle both old format (array) and new format (with pagination)
        if (Array.isArray(res.data)) {
          setProducts(res.data);
          setPagination({ total: res.data.length, page: 1, limit: 12, pages: 1 });
        } else {
          setProducts(res.data.data || []);
          setPagination(res.data.pagination || { total: 0, page: 1, limit: 12, pages: 1 });
        }

        setSearchParams(params as Record<string, string>, { replace: true });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, searchTerm, setSearchParams, sortBy, typeFilter, minPrice, maxPrice, inStockOnly, currentPage]);

  return (
    <div className="shop-page">
      <div className="page-container px-8 md:px-16 lg:px-24">
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
          <aside className="filters-sidebar bg-white dark:bg-[#1c1c1e] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-850 shadow-sm flex flex-col gap-6 lg:mr-2">
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('');
                  setCategoryFilter('');
                  setMinPrice('');
                  setMaxPrice('');
                  setInStockOnly(false);
                  setSortBy('newest');
                  setCurrentPage(1);
                }}
                className="w-full py-2.5 border border-logo-purple/30 text-logo-purple hover:bg-logo-purple/5 rounded-2xl font-bold transition-all text-sm"
              >
                Clear All Filters
              </button>
            </div>

            {/* COLLECTIONS GROUP */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-3">
                Collections
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                    categoryFilter === ''
                      ? 'bg-logo-purple/10 text-logo-purple'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <span>All Categories</span>
                  {categoryFilter === '' && <span className="w-1.5 h-1.5 rounded-full bg-logo-purple"></span>}
                </button>
                {categories.map((category) => {
                  const isActive = categoryFilter === category;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setCategoryFilter(category);
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-logo-purple/10 text-logo-purple'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      <span className="truncate">{category}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-logo-purple"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRICE FILTER GROUP */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-3">
                Price Range
              </span>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-900 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all"
                />
                <span className="text-gray-400 dark:text-gray-600 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-900 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* STATUS / AVAILABILITY GROUP */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-3">
                Availability
              </span>
              <button
                onClick={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  inStockOnly
                    ? 'bg-logo-purple/10 text-logo-purple'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                }`}
              >
                <span>In Stock Only</span>
                <span className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
                  inStockOnly ? 'bg-logo-purple flex justify-end' : 'bg-gray-250 dark:bg-gray-700 flex justify-start'
                }`}>
                  <span className="w-3 h-3 rounded-full bg-white shadow-sm"></span>
                </span>
              </button>
            </div>

            {/* Quick Picks */}
            <div className="filter-group">
              <h4 className="font-semibold mb-3">Quick Picks</h4>
              <div className="flex flex-col gap-2">
                {['Painting', 'Print', 'Drawing', 'Merchandise'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                      categoryFilter === category ? 'border-logo-purple bg-logo-purple/5 text-logo-purple' : 'border-gray-200 dark:border-gray-800'
                    }`}
                    onClick={() => {
                      setCategoryFilter(categoryFilter === category ? '' : category);
                      setCurrentPage(1);
                    }}
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
                <p className="text-sm text-gray-500">
                  {pagination.total} artwork{pagination.total === 1 ? '' : 's'} found
                </p>
                {(searchTerm || typeFilter || categoryFilter || minPrice || maxPrice || inStockOnly) && (
                  <button
                    type="button"
                    className="text-sm font-bold text-logo-purple hover:underline"
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('');
                      setCategoryFilter('');
                      setMinPrice('');
                      setMaxPrice('');
                      setInStockOnly(false);
                      setSortBy('newest');
                      setCurrentPage(1);
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
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg border ${
                            currentPage === page
                              ? 'bg-logo-purple text-white border-logo-purple'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                      disabled={currentPage === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
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
