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
      'These Terms & Conditions govern your access to and use of https://artopusindia.com and the products and services offered by Sasirekha Creations. By accessing or using the Website, you agree to be bound by these Terms.',

      '1. Business Information',
      'Business Name: Sasirekha Creations',
      'Address:\nSecond Floor, BBMP 18/1/18, 12th Main Veerasagara Main Road, Back Side of Akkayamma Temple, Akshaya Sree Magnus Layout, Attur, Yelahanka, Bengaluru, Karnataka – 560064, India',
      'Email: contact@artopusindia.com\nPhone: +91 8073424401\nWebsite: https://artopusindia.com/',

      '2. Website Usage',
      'The Website is provided for browsing, purchasing products, and accessing information about Sasirekha Creations.',
      'By using the Website, you agree that you will:',
      '- Provide accurate information when placing an order or creating an account.',
      '- Use the Website only for lawful purposes.',
      '- Not attempt to gain unauthorized access to the Website or its systems.',
      '- Not interfere with the security or operation of the Website.',
      '- Not use the Website for fraudulent or abusive activities.',

      '3. Products and Product Information',
      'We make reasonable efforts to ensure that product descriptions, images, specifications, prices, and availability displayed on the Website are accurate.',
      'However, minor variations in colour, appearance, size, texture, or finish may occur due to screen settings, photography, manufacturing processes, or the nature of the product.',
      'We reserve the right to modify product information, pricing, availability, or specifications without prior notice.',

      '4. Orders and Acceptance',
      'When you place an order through the Website, you are making an offer to purchase the selected product.',
      'An order is considered accepted only after payment verification and confirmation by Sasirekha Creations.',
      'We reserve the right to accept, reject, or cancel an order for reasons including:',
      '- Product unavailability.',
      '- Incorrect pricing or product information.',
      '- Payment failure.',
      '- Incorrect customer information.',
      '- Suspected fraudulent or unauthorized transactions.',
      '- Any other legitimate operational reason.',
      'If an order is cancelled after payment has been received, an eligible refund will be processed according to our Refund Policy.',

      '5. Pricing and Payment',
      'All prices are displayed in Indian Rupees (INR), unless otherwise stated.',
      'Customers are responsible for providing accurate billing and payment information.',
      'Payments may be processed through authorized third-party payment gateways. Sasirekha Creations does not intentionally store complete card details, CVV, UPI PIN, or internet banking credentials.',

      '6. Shipping and Delivery',
      'Please refer to the shipping policy.',

      '7. Returns, Refunds and Cancellations',
      'Please refer to the Return and Refund policy.',
      'Customers are advised to review the applicable policy before placing an order.',

      '8. Customer Account',
      'If account registration is available, customers are responsible for maintaining the confidentiality of their login credentials and for all activities carried out through their account.',
      'Customers must immediately notify us if they suspect unauthorized access to their account.',

      '9. Intellectual Property',
      'All content available on the Website, including text, product images, photographs, graphics, logos, designs, trademarks, videos, and other materials, is owned by or licensed to Sasirekha Creations unless otherwise stated.',
      'You may not copy, reproduce, modify, distribute, publish, or commercially exploit Website content without prior written permission.',

      '10. Third-Party Services',
      'The Website may use third-party services, including payment gateways, logistics providers, hosting providers, analytics services, and other technology providers.',
      'Sasirekha Creations is not responsible for the availability, policies, or actions of independent third-party service providers.',

      '11. Limitation of Liability',
      'To the extent permitted by applicable law, Sasirekha Creations shall not be liable for indirect, incidental, special, or consequential losses arising from the use of the Website or purchase of products.',
      'Our liability relating to a particular order shall not exceed the amount paid by the customer for that order, except where otherwise required by applicable law.',

      '12. Website Availability',
      'We make reasonable efforts to keep the Website available and functioning properly. However, temporary interruptions may occur due to maintenance, technical issues, network failures, or circumstances beyond our control.',

      '13. Changes to These Terms',
      'Sasirekha Creations reserves the right to modify or update these Terms & Conditions at any time.',
      'Updated Terms will become effective when published on the Website. Customers are encouraged to review this page periodically.',

      '14. Governing Law and Jurisdiction',
      'These Terms & Conditions shall be governed by the laws of India.',
      'Any dispute arising from or relating to these Terms or the use of the Website shall be subject to the applicable courts having jurisdiction in Bengaluru, Karnataka.',

      '15. Contact Us',
      'Sasirekha Creations',
      'Second Floor, BBMP 18/1/18, 12th Main Veerasagara Main Road, Back Side of Akkayamma Temple, Akshaya Sree Magnus Layout, Attur, Yelahanka, Bengaluru, Karnataka – 560064, India',
      'Email: contact@artopusindia.com\nPhone: +91 8073424401\nWebsite: https://artopusindia.com/'
    ]
  },

  {
    id: 'privacy',
    number: 2,
    title: 'Privacy Policy',
    content: [
      'Sasirekha Creations respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect information when you visit or make a purchase through https://artopusindia.com',

      '1. Business Information',
      'Business Name: Sasirekha Creations',
      'Address:\nSecond Floor, BBMP 18/1/18, 12th Main Veerasagara Main Road, Back Side of Akkayamma Temple, Akshaya Sree Magnus Layout, Attur, Yelahanka, Bengaluru, Karnataka – 560064, India',
      'Email: contact@artopusindia.com\nPhone: +91 8073424401\nWebsite: https://artopusindia.com/',

      '2. Information We Collect',
      'When you use our Website or place an order, we may collect:',
      '- Full name',
      '- Mobile number',
      '- Email address',
      '- Billing and shipping address',
      '- Order details',
      '- Payment and transaction information',
      '- Customer support communications',
      '- IP address',
      '- Browser and device information',
      '- Website usage and cookie information',
      'We collect only information that is reasonably necessary to provide our services and operate the Website.',

      '3. How We Use Your Information',
      'We may use your information to:',
      '- Process and fulfill orders.',
      '- Deliver purchased products.',
      '- Confirm payments and transactions.',
      '- Provide customer support.',
      '- Send order confirmations, invoices, and delivery updates.',
      '- Process returns, refunds, cancellations, or other service requests.',
      '- Improve our Website, products, and services.',
      '- Prevent fraud, unauthorized transactions, and misuse.',
      '- Comply with applicable legal, tax, accounting, and regulatory requirements.',

      '4. Payment Information',
      'Payments may be processed through authorized third-party payment gateways.',
      'We do not intentionally store your complete debit card or credit card number, CVV, UPI PIN, internet banking password, or other sensitive payment credentials.',
      'Payment information is handled according to the applicable security and privacy practices of the payment service provider.',

      '5. Sharing of Personal Information',
      'We do not sell or rent your personal information.',
      'We may share necessary information with trusted third parties when required to provide our services, including:',
      '- Payment gateway and payment processing providers.',
      '- Courier and logistics partners.',
      '- Website hosting and technology providers.',
      '- Customer support and communication service providers.',
      '- Government authorities, regulators, or law-enforcement agencies when legally required.',
      'These parties may access only the information reasonably necessary to perform their services.',

      '6. Cookies and Similar Technologies',
      'Our Website may use cookies and similar technologies to:',
      '- Maintain Website functionality.',
      '- Remember user preferences.',
      '- Improve browsing experience.',
      '- Understand Website traffic and usage.',
      '- Improve our services.',
      'You may disable or manage cookies through your browser settings. However, disabling certain cookies may affect some Website functionality.',

      '7. Data Security',
      'We take reasonable technical, administrative, and organizational measures to protect personal information against unauthorized access, disclosure, alteration, misuse, or destruction.',
      'However, no method of transmission or electronic storage can be guaranteed to be completely secure.',

      '8. Data Retention',
      'We retain personal information only for as long as reasonably necessary to:',
      '- Fulfill orders and provide services.',
      '- Maintain business and transaction records.',
      '- Meet legal, tax, accounting, and regulatory requirements.',
      '- Resolve disputes and enforce our agreements.',
      'When information is no longer required, it may be deleted or securely disposed of, subject to applicable legal requirements.',

      '9. Your Privacy Rights',
      'Subject to applicable law, you may contact us to request:',
      '- Access to personal information held by us.',
      '- Correction of inaccurate information.',
      '- Updating of your contact information.',
      '- Deletion of information where legally permissible.',
      '- Information regarding how your personal data is being used.',
      'Requests can be made using the contact details provided below.',

      '10. Children’s Privacy',
      'Our Website is not intended to knowingly collect personal information directly from children without appropriate parental or legal guardian involvement.',
      'If you believe that a child has provided personal information to us without appropriate consent, please contact us so that we can take appropriate action.',

      '11. Third-Party Websites',
      'Our Website may contain links to third-party websites or services. We are not responsible for the privacy practices, content, or security of third-party websites.',
      'We recommend reviewing the privacy policies of third-party websites before providing them with personal information.',

      '12. Changes to This Privacy Policy',
      'We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or business practices.',
      'Any updated version will be published on this page with the revised effective or update date.',

      '13. Contact Us',
      'If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:',
      'Sasirekha Creations',
      'Second Floor, BBMP 18/1/18, 12th Main Veerasagara Main Road, Back Side of Akkayamma Temple, Akshaya Sree Magnus Layout, Attur, Yelahanka, Bengaluru, Karnataka – 560064, India',
      'Email: contact@artopusindia.com\nPhone: +91 8073424401\nWebsite: https://artopusindia.com/'
    ]
  },

  {
    id: 'shipping',
    number: 3,
    title: 'Shipping Policy',
    content: [
      'Last Updated: August 2026',

      'At Sasirekha Creations, we aim to process and deliver your orders safely and within the estimated delivery timeframe. This Shipping Policy explains how orders placed through https://artopusindia.com/ are processed and delivered.',

      '1. Order Processing',
      'Orders are generally processed within 1–2 business days after successful payment confirmation.',
      'Orders placed on Sundays or public holidays will be processed on the next business day.',

      '2. Shipping Coverage',
      'We deliver orders to serviceable locations across India, subject to the availability of courier services at the customer’s delivery address.',

      '3. Delivery Timeframe',
      'Orders are generally delivered within 5–7 business days from the date of dispatch.',
      'Delivery timelines may vary depending on the destination, courier partner, weather conditions, public holidays, logistical conditions, or other circumstances beyond our reasonable control.',

      '4. Shipping Charges',
      'Applicable shipping charges, if any, will be displayed during checkout before the customer completes payment.',
      'Shipping charges may vary depending on the delivery location, order size, weight, or applicable promotional offers.',

      '5. Order Tracking',
      'Once your order has been dispatched, tracking information may be provided through email, SMS, WhatsApp, or other available communication channels.',
      'Customers can use the tracking information to monitor the status of their shipment.',

      '6. Delivery Attempts',
      'Our courier partners will make reasonable attempts to deliver the order to the address provided by the customer.',
      'Delivery may be delayed or unsuccessful due to:',
      '- Incorrect or incomplete address.',
      '- Customer unavailability.',
      '- Incorrect contact information.',
      '- Refusal to accept the shipment.',
      '- Restricted delivery locations.',
      '- Courier service limitations.',
      'Additional delivery or re-shipping charges may apply where the delivery failure is caused by incorrect information or customer-related reasons.',

      '7. Delayed Deliveries',
      'We make reasonable efforts to meet the estimated delivery timeframe. However, delays may occur due to courier operations, weather conditions, natural disasters, public holidays, strikes, technical issues, or other circumstances beyond our control.',
      'Such delays do not automatically qualify for cancellation or refund.',

      '8. Incorrect Shipping Information',
      'Customers are responsible for providing accurate and complete delivery information at the time of placing an order.',
      'Sasirekha Creations shall not be responsible for delivery failures resulting from incorrect or incomplete information provided by the customer.',

      '9. Damaged Packages',
      'Customers are advised to inspect the package at the time of delivery. If the package appears visibly damaged or tampered with, customers should document the issue with photographs or videos and contact us as soon as possible.',
      'Any claim relating to damaged or incorrect products will be handled according to our applicable Return & Refund Policy.',

      '10. Contact Us',
      'For shipping-related questions or assistance, please contact:',
      'Sasirekha Creations',
      'Second Floor, BBMP 18/1/18, 12th Main Veerasagara Main Road, Back Side of Akkayamma Temple, Akshaya Sree Magnus Layout, Attur, Yelahanka, Bengaluru, Karnataka – 560064, India',
      'Email: contact@artopusindia.com\nPhone: +91 8073424401\nWebsite: https://artopusindia.com/'
    ]
  },

  {
    id: 'refund',
    number: 4,
    title: 'Return & Refund Policy',
    content: [
      'At Sasirekha Creations, we aim to provide customers with quality products and a smooth ordering experience. Please read this policy carefully before placing an order through https://artopusindia.com/.',

      '1. No Return Policy',
      'We do not accept returns for products purchased through our Website.',
      'Once an order has been delivered, the product cannot be returned for a refund, exchange, or replacement, except where specifically required under applicable law.',

      '2. No Exchange',
      'Sasirekha Creations does not offer product exchanges.',
      'Customers cannot request a different product, size, colour, design, or variant after delivery.',

      '3. No Replacement',
      'We do not provide product replacements for delivered orders.',

      '4. Duplicate Transaction Refund',
      'A refund will be considered only in the event of a duplicate transaction, where the customer’s account has been charged more than once for the same order or transaction.',
      'The duplicate transaction will be verified against our payment and order records before a refund is approved.',

      '5. Refund Processing',
      'Once a duplicate transaction is successfully verified, the eligible refund will be processed and credited within 5–7 business days.',
      'The refund will generally be processed to the original payment method used for the transaction.',
      'The time taken for the refunded amount to reflect in the customer’s account may vary depending on the bank, card issuer, UPI provider, or payment gateway.',

      '6. Refund Request',
      'To report a suspected duplicate transaction, customers should contact us with:',
      '- Order ID',
      '- Customer name',
      '- Registered mobile number or email address',
      '- Transaction details',
      '- Proof of duplicate payment, if available',
      'Requests can be submitted to:',
      'Email: contact@artopusindia.com\nPhone: +91 8073424401',

      '7. Non-Refundable Situations',
      'Refunds will not be provided for:',
      '- Change of mind.',
      '- Products that the customer does not like.',
      '- Incorrect product selection by the customer.',
      '- Product dissatisfaction.',
      '- Normal product variations.',
      '- Requests for exchange or replacement.',
      '- Orders delivered successfully.',
      '- Any transaction that does not qualify as a verified duplicate transaction.',

      '8. Order Cancellation',
      'Order cancellation, if permitted, will be subject to the status of the order and our applicable Terms & Conditions. Once an order is placed, it cannot be cancelled.',

      '9. Contact Us',
      'Sasirekha Creations',
      'Second Floor, BBMP 18/1/18, 12th Main Veerasagara Main Road, Back Side of Akkayamma Temple, Akshaya Sree Magnus Layout, Attur, Yelahanka, Bengaluru, Karnataka – 560064, India',
      'Email: contact@artopusindia.com\nPhone: +91 8073424401\nWebsite: https://artopusindia.com/'
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
