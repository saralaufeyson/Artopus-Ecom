import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Truck, Award, Sparkles } from 'lucide-react';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-logo-purple dark:hover:text-logo-purple mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Page Title */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">About Us</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Discover the story behind Artopus India and our commitment to handcrafted fine arts.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-150 dark:border-gray-850 p-8 md:p-12 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Business Identity</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              <strong>Artopus India</strong> is the customer-facing brand owned and operated by <strong>Sasirekha Creations (Proprietorship)</strong>. Based in Bengaluru, Karnataka, we serve as a dedicated bridge connecting fine artists with art collectors, providing original masterpieces and custom commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex gap-4">
              <Sparkles className="text-logo-purple shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Fine Art Curation</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We specialize in original handcrafted artworks and custom commissions created by talented independent artists.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex gap-4">
              <Award className="text-logo-purple shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Certificate of Authenticity</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Every single original painting is accompanied by a signed Certificate of Authenticity ensuring its genuine hand-painted nature.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex gap-4">
              <ShieldCheck className="text-logo-purple shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Print on Demand</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We offer premium framed canvas prints manufactured locally in A5, A4, and A3 sizes, produced only after an order is placed.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex gap-4">
              <Truck className="text-logo-purple shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Global Shipping</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We pack every piece securely and ship verified packages across India and to international destinations worldwide.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-sm text-gray-500">
            Artopus India is registered under Sasirekha Creations, Yelahanka, Bengaluru, Karnataka, India.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
