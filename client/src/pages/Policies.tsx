import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PolicySection {
  id: 'terms' | 'privacy' | 'refund' | 'shipping';
  number: number;
  title: string;
  content: string[];
}

interface PoliciesProps {
  activeTab: 'terms' | 'privacy' | 'refund' | 'shipping';
}

const Policies: React.FC<PoliciesProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>(activeTab);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
  const sectionRefs = {
    terms: useRef<HTMLDivElement>(null),
    privacy: useRef<HTMLDivElement>(null),
    refund: useRef<HTMLDivElement>(null),
    shipping: useRef<HTMLDivElement>(null),
  };

  const routeMap = {
    terms: '/terms-and-conditions',
    privacy: '/privacy-policy',
    refund: '/return-refund-cancellation-policy',
    shipping: '/shipping-policy',
  };

  const sections: PolicySection[] = [
    {
      id: 'terms',
      number: 1,
      title: 'Terms & Conditions',
      content: [
        'Welcome to Artopus India. These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("Customer," "you," or "your") and Sasirekha Creations, a proprietorship operating under the brand name "Artopus India" ("Company," "we," "us," or "our"), governing your access to and use of our website https://www.artopusindia.com (the "Website") and your purchase of products offered by us.',
        '1. Acceptance of Terms: Your access to and use of the Website is conditioned upon your acceptance of and compliance with these Terms. By browsing our products, creating an account, or placing an order, you acknowledge that you have read, understood, and agree to be bound by these Terms.',
        '2. Eligibility: To use the Website or place an order, you must be at least 18 years of age and capable of entering into a legally binding contract under the Indian Contract Act, 1872. If you are under 18, you may use the Website only under the supervision of a parent or legal guardian.',
        '3. Products: We sell (a) Original Artworks – one-of-a-kind, handmade pieces, each accompanied by a Certificate of Authenticity. (b) Print-on-Demand Framed Canvas Prints – available in A5, A4, and A3 sizes, produced only after an order is placed and confirmed. Minor variations in texture, brushwork, framing, or finish are natural characteristics of handmade pieces and do not constitute defects. Colors may vary slightly due to device monitor settings.',
        '4. Pricing: All prices displayed on the Website are in Indian Rupees (INR / ₹), inclusive of applicable taxes, and are subject to change without prior notice. We reserve the right to refuse or cancel orders due to pricing errors, suspected fraud, or unavailability.',
        '5. Payments: Full payment is required at the time of placing an order. Payments are processed through trusted secure third-party payment gateways (UPI, credit/debit cards, net banking). We do not store complete card information on our servers.',
        '6. User Conduct: You agree not to use the Website for any unlawful purpose, attempt to gain unauthorized access, upload harmful files, or interfere with the proper functioning of the Platform.',
        '7. Intellectual Property: All content on the Website, including artworks, images, logos, and descriptions, is the exclusive property of Sasirekha Creations. Purchase of physical products does not transfer copyright or reproduction rights to the buyer.',
        '8. Limitation of Liability: Products and Website access are provided on an "as is" basis. Sasirekha Creations\' aggregate liability under any order shall not exceed the amount paid by the customer for that specific purchase.',
        '9. Grievance Redressal: In accordance with applicable laws, any concerns may be directed to our Grievance Officer: Kanchi Chithra, Proprietor. Email: contact@artopusindia.com. Phone: +91 8073424401. Working Hours: Mon-Sat, 10:00 AM – 6:00 PM IST. We aim to acknowledge and address grievances within 48 hours.'
      ]
    },
    {
      id: 'privacy',
      number: 2,
      title: 'Privacy Policy',
      content: [
        'Introduction: This Privacy Policy describes how Sasirekha Creations (Proprietorship) and its affiliates collect, use, share, protect or otherwise process your information through our website https://www.artopusindia.com. Your data will primarily be stored and processed in India. By visiting the Platform or providing your information, you agree to be bound by the terms of this Privacy Policy.',
        'Collection: We collect personal information when you sign up, register, or transact on the Platform. This includes name, date of birth, address, email, telephone number, and proof of identity. Sensitive information (such as bank details or facial features for authentication features) is collected with your explicit consent.',
        'Usage: We use your personal data to handle orders, resolve disputes, customize your shopping experience, detect and protect against fraud, and conduct marketing analytics. You have the option to opt-out of marketing communications at any time.',
        'Sharing: We disclose personal data to logistics providers, secure payment gateways, and reward channels to facilitate fulfillment. We may share data with government agencies if required by law or to protect user safety and platform security.',
        'Security Precautions: We adopt industry-standard security procedures to protect your data. While we maintain secure servers, transmission of information over the internet carries inherent risks, and users are responsible for protecting account passwords.',
        'Data Deletion: You have the right to request deletion of your account and related information by contacting us. We may delay or deny deletion in cases of pending shipments, legal claims, or unresolved grievances.'
      ]
    },
    {
      id: 'refund',
      number: 3,
      title: 'Return, Refund & Cancellation Policy',
      content: [
        'This Return, Refund & Cancellation Policy outlines the rules for cancellations, returns, and refund requests for purchases made through Artopus India.',
        '1. Order Cancellation: Orders can be cancelled within three (3) days of the order being placed, provided that production (for print-on-demand items) or shipping has not yet commenced. Please request cancellation by writing to contact@artopusindia.com.',
        '2. Original Artworks Returns: Original artworks are unique and handmade. They can only be returned or exchanged if the wrong item is delivered or the artwork arrives damaged. Return requests must be filed within three (3) working days of delivery, accompanied by clear photographic evidence.',
        '3. Print-on-Demand Returns: Print-on-demand canvas prints are custom manufactured after the order is confirmed. They cannot be returned or exchanged unless the product arrives damaged, defective, or an incorrect item has been delivered.',
        '4. Damage Reporting: Any damage or defect must be reported to our grievance email contact@artopusindia.com within three (3) working days of delivery for verification.',
        '5. Refund Settlement: Once a return is approved, refunds are processed within two to three (2–3) business days to the original method of payment.'
      ]
    },
    {
      id: 'shipping',
      number: 4,
      title: 'Shipping Policy',
      content: [
        'Sasirekha Creations handles domestic and international packaging and logistics grids for Artopus India.',
        '1. Processing Time: Order handling and preparation takes up to seven (7) business days from order confirmation.',
        '2. Transit & Delivery Timelines:',
        '- Deliveries within India: 10 to 14 business days.',
        '- International Shipments: Delivery timelines vary depending on the destination and local customs clearance procedures.',
        '3. Shipping Charges: Applicable shipping fees are calculated dynamically and displayed during checkout prior to payment.',
        '4. International Customs: Customs duties, local entry clearance fees, and import taxes are the sole responsibility of the customer and are collected at delivery.',
        '5. Logistics Disclaimer: We are not liable for transit delays caused by courier service issues, customs hold-ups, or force majeure events.'
      ]
    }
  ];

  // Sync scroll position when activeTab prop changes & update SEO title
  useEffect(() => {
    const metaTitles = {
      terms: 'Terms and Conditions - Artopus India',
      privacy: 'Privacy Policy - Artopus India',
      refund: 'Return, Refund and Cancellation Policy - Artopus India',
      shipping: 'Shipping Policy - Artopus India',
    };
    document.title = metaTitles[activeTab];

    const targetRef = sectionRefs[activeTab];
    if (targetRef && targetRef.current && rightPaneRef.current) {
      const topOffset = targetRef.current.offsetTop - rightPaneRef.current.offsetTop;
      rightPaneRef.current.scrollTo({
        top: topOffset,
        behavior: 'smooth',
      });
    }
    setActiveSection(activeTab);
  }, [activeTab]);

  // Center the horizontal scroll tab for mobile
  useEffect(() => {
    const activeTabButton = tabRefs.current[activeSection];
    if (activeTabButton) {
      activeTabButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeSection]);

  const handleTabClick = (id: 'terms' | 'privacy' | 'refund' | 'shipping') => {
    navigate(routeMap[id]);
  };

  const handleAccept = () => {
    localStorage.setItem('policiesAccepted', 'true');
    localStorage.setItem('policiesAcceptedAt', new Date().toISOString());
    toast.success('Thank you for accepting the Terms of Service & Policies!', {
      position: 'bottom-right',
      autoClose: 3500,
    });
    navigate(-1);
  };

  const handleDecline = () => {
    toast.warning('You declined the terms. Some marketplace services may require agreement.', {
      position: 'bottom-right',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-[#F3F4F6] relative overflow-hidden flex flex-col justify-center py-16 px-4 md:px-8 transition-colors duration-200">
      {/* Decorative Large Background Font */}
      <div className="absolute top-[10%] left-0 w-full text-center pointer-events-none select-none z-0">
        <h1 className="text-[12vw] font-black text-gray-900/[0.02] dark:text-white/[0.03] tracking-widest uppercase">
          Terms of Service
        </h1>
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white mb-6 group transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to marketplace</span>
        </button>

        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-950 dark:text-white mb-2">
            Terms of Service
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto">
            Please read the conditions, return policies, and privacy terms before continuing.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden p-6 md:p-10 transition-colors duration-200">
          
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 pb-6 lg:pb-0 lg:pr-8">
            <div className="flex flex-row overflow-x-auto whitespace-nowrap gap-2 pb-4 lg:pb-0 lg:flex-col lg:space-y-2 scrollbar-thin scrollbar-thumb-logo-purple/35">
              {sections.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    ref={(el) => { tabRefs.current[sec.id] = el; }}
                    onClick={() => handleTabClick(sec.id)}
                    className={`shrink-0 text-left px-5 py-3 lg:py-4 rounded-2xl font-bold transition-all flex items-center justify-between gap-3 group ${
                      isActive
                        ? 'bg-logo-purple/10 text-logo-purple border border-logo-purple/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-logo-purple dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-black ${
                        isActive ? 'bg-logo-purple text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        {sec.number}
                      </span>
                      <span>{sec.title}</span>
                    </span>
                    <span className={`hidden lg:inline text-lg transition-transform ${
                      isActive ? 'translate-x-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                    }`}>
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:block mt-8 p-5 bg-gray-50 dark:bg-white/[0.01] rounded-2xl border border-gray-200 dark:border-gray-800/60">
              <div className="flex gap-3 items-start">
                <ShieldAlert className="text-logo-purple shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-bold text-gray-950 dark:text-white mb-1">Legal Binding</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    By clicking Accept, you consent to the terms governed under the Indian Information Technology Act, 2000.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Scrollable Content Pane */}
          <div className="lg:col-span-8 flex flex-col h-[55vh] lg:h-[60vh] justify-between">
            <div
              ref={rightPaneRef}
              className="flex-1 overflow-y-auto pr-4 space-y-12 custom-scrollbar scroll-smooth"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#8b5cf6 transparent',
              }}
            >
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  ref={sectionRefs[sec.id]}
                  className="space-y-4 pt-4"
                >
                  <h3 className="text-2xl font-black text-logo-purple flex items-center gap-2">
                    <span>{sec.number}.</span>
                    <span>{sec.title}</span>
                  </h3>
                  <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium">
                    {sec.content.map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons Section */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="text-logo-purple" size={16} />
                <span>Last Updated: August 2026</span>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={handleDecline}
                  className="flex-1 sm:flex-initial px-8 py-3.5 border border-logo-purple/40 hover:border-logo-purple text-logo-purple hover:bg-logo-purple/5 font-bold rounded-2xl transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 sm:flex-initial px-10 py-3.5 bg-logo-purple hover:bg-logo-purple/90 text-white font-black rounded-2xl shadow-lg shadow-logo-purple/10 transition-all hover:-translate-y-0.5"
                >
                  Accept
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Policies;
