import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">ARTOPUS</h3>
          <p className="footer-description">
            Discover and collect extraordinary artworks from talented artists around the world.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Shop</h4>
          <ul className="footer-links">
            <li><Link to="/shop">All Artworks</Link></li>
            <li><Link to="/shop">Featured</Link></li>
            <li><Link to="/shop">New Arrivals</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li><Link to="/">Contact Us</Link></li>
            <li><Link to="/">Shipping Info</Link></li>
            <li><Link to="/">Returns</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Follow Us</h4>
          <div className="social-links">
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">Pinterest</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Artopus. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
