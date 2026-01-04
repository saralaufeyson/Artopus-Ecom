import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
 
 

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  type: string;
  category: string;
  artistId: string;
  artistName: string;
}

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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
    setFilteredProducts(filtered);
  }, [searchTerm, typeFilter, products]);

  return (
    <div className="shop-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Shop Artworks</h1>
          <p className="page-description">Browse our entire collection</p>
          <input 
            type="text" 
            placeholder="Search artworks..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="shop-content">
          <aside className="filters-sidebar">
            <h3>Filters</h3>
            <div className="filter-group">
              <h4>Type</h4>
              <select 
                className="filter-select"
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

          <div className="products-section">
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  // Using the ProductCard component enables navigation and Add to Cart
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
}

export default Shop;