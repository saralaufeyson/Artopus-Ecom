import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import ThemeToggle from './ThemeToggle';

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
    <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
            <img src="/logo.png" alt="Artopus India Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white group-hover:text-logo-purple transition-colors">
            ARTOPUS <span className="text-logo-purple">INDIA</span>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer group"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-gray-900 dark:bg-white group-hover:bg-logo-purple transition-all"></span>
          <span className="w-6 h-0.5 bg-gray-900 dark:bg-white group-hover:bg-logo-purple transition-all"></span>
          <span className="w-6 h-0.5 bg-gray-900 dark:bg-white group-hover:bg-logo-purple transition-all"></span>
        </button>

        {/* Desktop menu */}
        <ul className="hidden lg:flex gap-8 list-none items-center">
          {user?.role !== 'admin' && (
            <>
              <li><Link to="/" className="nav-link">Home</Link></li>
              <li><Link to="/shop" className="nav-link">Shop</Link></li>
            </>
          )}

          {/* Admin link - only visible if logged-in user is an admin */}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin" className="text-logo-purple font-semibold hover:text-gray-900 dark:hover:text-white transition-colors py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-logo-purple animate-pulse"></span>
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className="hidden lg:flex items-center gap-6">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              {user.role !== 'admin' && <Link to="/profile" className="nav-link">Profile</Link>}
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-medium py-2 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}

          {user?.role !== 'admin' && (
            <Link to="/cart" className="relative group p-2 text-gray-700 dark:text-gray-300 hover:text-logo-purple transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform">
                <path d="M9 2L7 4M15 2l2 2M7 4h10l1 9H6l1-9z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="19" r="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="19" r="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-logo-purple text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-logo-purple/30 animate-pulse">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 lg:hidden" onClick={closeMenu}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-xl text-gray-900 dark:text-white">Menu</span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button className="text-2xl text-gray-400 hover:text-logo-purple p-2 transition-colors" onClick={closeMenu}>×</button>
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto py-4">
              {user?.role !== 'admin' && (
                <>
                  <li><Link to="/" className="flex items-center px-6 py-4 text-gray-900 dark:text-white hover:bg-logo-purple/5 hover:text-logo-purple font-medium" onClick={closeMenu}>Home</Link></li>
                  <li><Link to="/shop" className="flex items-center px-6 py-4 text-gray-900 dark:text-white hover:bg-logo-purple/5 hover:text-logo-purple font-medium" onClick={closeMenu}>Shop</Link></li>
                </>
              )}

              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin" className="flex items-center px-6 py-4 text-logo-purple font-bold hover:bg-logo-purple/5" onClick={closeMenu}>
                    Admin Panel
                  </Link>
                </li>
              )}

              <li className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                {user ? (
                  <div className="space-y-4">
                    {user.role !== 'admin' && <Link to="/profile" className="block text-gray-900 dark:text-white font-medium" onClick={closeMenu}>Profile</Link>}
                    <button onClick={handleLogout} className="w-full text-left text-red-600 font-medium">Logout</button>
                  </div>
                ) : (
                  <Link to="/login" className="block btn-primary" onClick={closeMenu}>Login</Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;