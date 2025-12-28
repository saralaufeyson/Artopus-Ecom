import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import '../styles.css';

function Navbar() {
  const auth = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();

  const user = auth?.user;
  const cart = cartContext?.cart || [];

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ARTOPUS
        </Link>

        <ul className="navbar-menu">
          <li><Link to="/" className="navbar-link">Home</Link></li>
          <li><Link to="/shop" className="navbar-link">Shop</Link></li>
          
          {/* Admin link - only visible if logged-in user is an admin */}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin" className="navbar-link font-bold text-blue-500">
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="navbar-link">Profile</Link>
              <button 
                onClick={handleLogout} 
                className="navbar-link bg-transparent border-none cursor-pointer text-red-500"
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
            <span className="cart-badge">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;