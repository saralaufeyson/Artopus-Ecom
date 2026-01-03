import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">ARTOPUS</h3>
            <p className="text-gray-400 leading-relaxed mb-4">
              Discover and collect extraordinary artworks from talented artists around the world.
            </p>
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wide">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors duration-200">All Artworks</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors duration-200">Featured</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors duration-200">New Arrivals</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wide">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">Contact Us</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">Shipping Info</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">Returns</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wide">Follow Us</h4>
            <div className="flex flex-col space-y-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Pinterest</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500 text-sm">&copy; 2024 Artopus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
