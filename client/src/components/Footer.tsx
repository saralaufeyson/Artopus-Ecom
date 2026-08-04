import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">ARTOPUS INDIA</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Artopus India is owned and operated by Sasirekha Creations, a Proprietorship registered in Bengaluru, Karnataka.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Email: <a href="mailto:contact@artopusindia.com" className="hover:text-white">contact@artopusindia.com</a></p>
              <p>Phone: <a href="tel:+918073424401" className="hover:text-white">+91 8073424401</a></p>
            </div>
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about-us" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link to="/contact-us" className="text-gray-400 hover:text-white transition-colors duration-200">Contact Us</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors duration-200">All Artworks</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wide">Legal & Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors duration-200">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/shipping-policy" className="text-gray-400 hover:text-white transition-colors duration-200">Shipping Policy</Link></li>
              <li><Link to="/return-refund-cancellation-policy" className="text-gray-400 hover:text-white transition-colors duration-200">Return & Refund Policy</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wide">Follow Us</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <a href="https://www.instagram.com/artopus_india/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">Instagram</a>
              <a href="https://www.youtube.com/@ArtopusIndia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">Youtube</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">&copy; 2026 Sasirekha Creations (Artopus India). All rights reserved.</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors duration-200">Terms & Conditions</Link>
            <span>&middot;</span>
            <Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

