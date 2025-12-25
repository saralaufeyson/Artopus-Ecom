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
          <h1 className="page-title">Shop Artworks</h1>
          <p className="page-description">Browse our entire collection</p>
        </div>

        <div className="shop-content">
          <aside className="filters-sidebar">
            <h3>Filters</h3>
            <div className="filter-group">
              <h4>Category</h4>
              <label><input type="checkbox" /> Paintings</label>
              <label><input type="checkbox" /> Photography</label>
              <label><input type="checkbox" /> Digital Art</label>
              <label><input type="checkbox" /> Sculpture</label>
            </div>
            <div className="filter-group">
              <h4>Price Range</h4>
              <label><input type="checkbox" /> Under $500</label>
              <label><input type="checkbox" /> $500 - $1000</label>
              <label><input type="checkbox" /> $1000 - $2000</label>
              <label><input type="checkbox" /> Over $2000</label>
            </div>
          </aside>

          <div className="products-section">
            <div className="products-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="product-card">
                  <div className="product-image-placeholder">
                    <span>Art {item}</span>
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">Artwork Title {item}</h3>
                    <p className="product-artist">Artist Name</p>
                    <p className="product-price">${(item * 350).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;
