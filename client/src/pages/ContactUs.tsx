import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Building2 } from 'lucide-react';

const ContactUs: React.FC = () => {
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
          <h1 className="text-4xl md:text-5xl font-black mb-4">Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Get in touch with us. We are here to help you with your art collection inquiries or order queries.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-150 dark:border-gray-850 p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Info Side */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Business Contact</h2>
            
            <div className="flex gap-4 items-start">
              <Building2 className="text-logo-purple shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Business Entity Name</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Sasirekha Creations (Proprietorship)</p>
                <p className="text-sm text-gray-500">Brand: Artopus India</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <MapPin className="text-logo-purple shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Registered Address</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  No. 18, 12th Main,<br />
                  Veera Sagara Main Road,<br />
                  Attur Layout,<br />
                  Yelahanka, Bengaluru - 560064,<br />
                  Karnataka, India
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Mail className="text-logo-purple shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                <a href="mailto:contact@artopusindia.com" className="text-sm text-logo-purple font-semibold hover:underline">
                  contact@artopusindia.com
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Phone className="text-logo-purple shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phone / WhatsApp</p>
                <a href="tel:+918073424401" className="text-sm text-logo-purple font-semibold hover:underline">
                  +91 8073424401
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Clock className="text-logo-purple shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Business Hours</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monday – Saturday<br />
                  10:00 AM – 6:00 PM IST
                </p>
              </div>
            </div>
          </div>

          {/* Map/Note Side */}
          <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Customer Assistance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Have a question regarding shipping timelines, returns, or order tracking? You can review our Policy sections below or write directly to our helpdesk.
              </p>
              <p className="text-xs text-gray-500">
                We generally acknowledge receipt of inquiries within 24 to 48 business hours.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700/60 pt-4 mt-6">
              <p className="text-[10px] text-gray-400">
                For custom commissioning requests, please attach reference imagery and size dimensions in your email to contact@artopusindia.com.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
