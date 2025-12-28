import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import '../global.css';

function Navbar() {
  const auth = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = auth?.user;
  const cart = cartContext?.cart || [];

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          ARTOPUS INDIA
        </Link>

        {/* Mobile menu button */}
        <button
          className="navbar-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Desktop menu */}
        <ul className="navbar-nav">
          <li><Link to="/" className="navbar-link">Home</Link></li>
          <li><Link to="/shop" className="navbar-link">Shop</Link></li>

          {/* Admin link - only visible if logged-in user is an admin */}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin" className="navbar-link admin-link">
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user-menu">
              <Link to="/profile" className="navbar-link">Profile</Link>
              <button
                onClick={handleLogout}
                className="navbar-link logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-link">Login</Link>
          )}

          <Link to="/cart" className="cart-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L7 4M15 2l2 2M7 4h10l1 9H6l1-9z"/>
              <circle cx="9" cy="19" r="2"/>
              <circle cx="17" cy="19" r="2"/>
            </svg>
            {cart.length > 0 && (
              <span className="cart-badge">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button className="mobile-menu-close" onClick={closeMenu}>×</button>
            </div>

            <ul className="mobile-menu-nav">
              <li><Link to="/" className="mobile-menu-link" onClick={closeMenu}>Home</Link></li>
              <li><Link to="/shop" className="mobile-menu-link" onClick={closeMenu}>Shop</Link></li>

              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin" className="mobile-menu-link admin-link" onClick={closeMenu}>
                    Admin Panel
                  </Link>
                </li>
              )}

              <li className="mobile-menu-divider"></li>

              {user ? (
                <>
                  <li><Link to="/profile" className="mobile-menu-link" onClick={closeMenu}>Profile</Link></li>
                  <li><button onClick={handleLogout} className="mobile-menu-link logout-btn">Logout</button></li>
                </>
              ) : (
                <li><Link to="/login" className="mobile-menu-link" onClick={closeMenu}>Login</Link></li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;