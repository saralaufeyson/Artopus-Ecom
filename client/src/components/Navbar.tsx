import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ARTOPUS
        </Link>

        <ul className="navbar-menu">
          <li><Link to="/" className="navbar-link">Home</Link></li>
          <li><Link to="/shop" className="navbar-link">Shop</Link></li>
        </ul>

        <div className="navbar-actions">
          <Link to="/login" className="navbar-link">Login</Link>
          <Link to="/cart" className="cart-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L7 4M15 2l2 2M7 4h10l1 9H6l1-9z"/>
              <circle cx="9" cy="19" r="2"/>
              <circle cx="17" cy="19" r="2"/>
            </svg>
            <span className="cart-badge">0</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
