import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

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
    <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-700 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-primary hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200" onClick={closeMenu}>
          ARTOPUS INDIA
        </Link>

        {/* Mobile menu button */}
        <button
          className="lg:hidden flex flex-col gap-1 p-2 bg-transparent border-none cursor-pointer"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-gray-700 transition-all duration-300"></span>
          <span className="w-6 h-0.5 bg-gray-700 transition-all duration-300"></span>
          <span className="w-6 h-0.5 bg-gray-700 transition-all duration-300"></span>
        </button>

        {/* Desktop menu */}
        <ul className="hidden lg:flex gap-8 list-none items-center">
          <li><Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200 py-2">Home</Link></li>
          <li><Link to="/shop" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200 py-2">Shop</Link></li>

          {/* Admin link - only visible if logged-in user is an admin */}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin" className="text-indigo-primary font-semibold hover:text-gray-900 dark:hover:text-white transition-colors duration-200 py-2">
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200 py-2">Profile</Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium py-2 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200 py-2">Login</Link>
          )}

          <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L7 4M15 2l2 2M7 4h10l1 9H6l1-9z"/>
              <circle cx="9" cy="19" r="2"/>
              <circle cx="17" cy="19" r="2"/>
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-primary text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 dark:bg-black/70 z-50 flex items-start justify-end pt-16" onClick={closeMenu}>
          <div className="bg-white dark:bg-gray-800 w-80 h-full border-l border-gray-200 dark:border-gray-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
              <button className="text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors duration-200" onClick={closeMenu}>×</button>
            </div>

            <ul className="list-none p-0 m-0">
              <li><Link to="/" className="block py-4 px-6 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-600" onClick={closeMenu}>Home</Link></li>
              <li><Link to="/shop" className="block py-4 px-6 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-600" onClick={closeMenu}>Shop</Link></li>

              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin" className="block py-4 px-6 text-indigo-primary font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-600" onClick={closeMenu}>
                    Admin Panel
                  </Link>
                </li>
              )}

              <li className="h-px bg-gray-100 dark:bg-gray-600 my-2"></li>

              {user ? (
                <>
                  <li><Link to="/profile" className="block py-4 px-6 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-600" onClick={closeMenu}>Profile</Link></li>
                  <li><button onClick={handleLogout} className="w-full text-left py-4 px-6 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200">Logout</button></li>
                </>
              ) : (
                <li><Link to="/login" className="block py-4 px-6 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200" onClick={closeMenu}>Login</Link></li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;