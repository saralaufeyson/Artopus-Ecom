import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Shop.css';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  type: string;
  category: string;
}

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch real data from your backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Handle live filtering logic
  useEffect(() => {
    let filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (typeFilter) {
      filtered = filtered.filter(product => product.type === typeFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    setFilteredProducts(filtered);
  }, [searchTerm, typeFilter, categoryFilter, products]);

  return (
    <div className="shop-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title text-3xl font-bold mb-2">Shop Artworks</h1>
          <p className="page-description text-gray-600">Browse our entire collection</p>
          <input 
            type="text" 
            placeholder="Search artworks..." 
            className="mt-4 p-2 border rounded w-full max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="shop-content flex mt-8">
          <aside className="filters-sidebar w-1/4 pr-4">
            <h3 className="font-bold mb-4">Filters</h3>
            <div className="filter-group mb-6">
              <h4 className="font-semibold mb-2">Type</h4>
              <select 
                className="w-full p-2 border rounded"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="original-artwork">Original Artwork</option>
                <option value="merchandise">Merchandise</option>
              </select>
            </div>
            {/* You can add Category filters here similarly */}
          </aside>

          <div className="products-section w-3/4">
            {filteredProducts.length > 0 ? (
              <div className="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  // Using the ProductCard component enables navigation and Add to Cart
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No products found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;