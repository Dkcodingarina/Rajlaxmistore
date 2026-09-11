import React from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Phone, Mail, Clock, HelpCircle, Truck, ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

export default function CmsView() {
  const { currentParams, storeSettings, navigateTo } = useStore();
  const cmsType = currentParams.cmsType || 'about';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <button
        onClick={() => navigateTo('home')}
        className="inline-flex items-center space-x-1 text-xs font-bold text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </button>

      {/* About Us */}
      {cmsType === 'about' && (
        <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="bg-rose-100 text-rose-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase">
              Our Legacy
            </span>
            <h1 className="font-serif font-black text-3xl text-neutral-900">
              About {storeSettings.storeName}
            </h1>
          </div>

          <div className="prose text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-4">
            <p>
              Welcome to <strong>{storeSettings.storeName}</strong>, your trusted premier local destination for authentic beauty, skincare, haircare, school stationery, executive office supplies, and custom festival gift hampers!
            </p>
            <p>
              Established in Gujarat, {storeSettings.storeName} has proudly served households, students, working professionals, and business owners with 100% genuine products directly sourced from leading authentic brands.
            </p>

            <h3 className="font-serif font-bold text-base text-neutral-900 pt-2">Why Shop With {storeSettings.storeName}?</h3>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li><strong>100% Authentic Guarantee:</strong> Zero counterfeit products — every single lipstick, notebook, or pen comes with guaranteed brand authenticity.</li>
              <li><strong>Direct WhatsApp Ordering:</strong> Place orders via quick WhatsApp chat or our modern storefront for hassle-free local doorstep delivery.</li>
              <li><strong>Festive Special Hampers:</strong> Custom gift packing for Rakshabandhan, Diwali, Navratri, Holi, and Corporate gifting.</li>
              <li><strong>Free Local Delivery:</strong> Free doorstep dispatch on orders above ₹{storeSettings.freeDeliveryThreshold}.</li>
            </ul>
          </div>

          <div className="p-6 bg-neutral-900 text-white rounded-2xl space-y-3">
            <h4 className="font-serif font-bold text-base text-amber-300">Visit Our Store Location</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{storeSettings.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{storeSettings.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{storeSettings.businessHours}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Support Launcher Card */}
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif font-black text-base text-rose-950 flex items-center justify-center sm:justify-start gap-1.5">
                <span>💬</span>
                <span>Have a question or complaint?</span>
              </h4>
              <p className="text-xs text-rose-800 font-medium">
                Create a live support query ticket. Our staff will reply instantly on working hours!
              </p>
            </div>
            <button
              onClick={() => document.getElementById('btn_support_widget')?.click()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold transition-transform hover:scale-[1.02] shadow-md cursor-pointer shrink-0"
            >
              Raise Query Ticket
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      {cmsType === 'faq' && (
        <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="bg-rose-100 text-rose-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase">
              Help Center
            </span>
            <h1 className="font-serif font-black text-3xl text-neutral-900">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does WhatsApp ordering work?",
                a: "Simply browse our catalog, add items to your cart, and click 'Proceed to Checkout'. Select 'Direct WhatsApp' as payment method, and your formatted order summary will automatically open in WhatsApp chat for instant confirmation!"
              },
              {
                q: "Are all cosmetics and stationery products genuine?",
                a: "Yes! We buy 100% directly from authorized brand company distributors. We guarantee genuine quality for Lakme, Maybelline, Classmate, Camel, and all stocked brands."
              },
              {
                q: "What are the local delivery timings?",
                a: "Local doorstep orders placed before 4:00 PM are delivered the very same day across our city zones. Orders placed after 4:00 PM are dispatched next morning."
              },
              {
                q: "Can I customize festival gift hampers?",
                a: "Absolutely! During Rakshabandhan, Diwali, and festive seasons, you can message us on WhatsApp to combine chocolates, premium stationery, dry fruits, and skincare into custom gift boxes."
              }
            ].map((faq, i) => (
              <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                <h3 className="font-bold text-neutral-900 text-xs sm:text-sm">{faq.q}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif font-black text-xs text-neutral-500 uppercase tracking-wider">
                Still have questions or unresolved complaints?
              </h4>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Connect directly with our administrators and raise a support ticket query.
              </p>
            </div>
            <button
              onClick={() => document.getElementById('btn_support_widget')?.click()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold transition-transform hover:scale-[1.02] shadow-md cursor-pointer shrink-0"
            >
              Raise Support Ticket
            </button>
          </div>
        </div>
      )}

      {/* Shipping & Returns */}
      {cmsType === 'returns' && (
        <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <h1 className="font-serif font-black text-3xl text-neutral-900">
            Shipping & Return Policy
          </h1>
          <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-3">
            <p><strong>Shipping Options:</strong> Standard local doorstep dispatch is ₹{storeSettings.standardDeliveryFee}. Orders over ₹{storeSettings.freeDeliveryThreshold} qualify for 100% Free Shipping.</p>
            <p><strong>Return Window:</strong> Unopened, sealed stationery and cosmetics can be exchanged or returned within 7 days of delivery with receipt.</p>
            <p><strong>Opened Cosmetics Exception:</strong> For hygiene reasons, opened liquid cosmetics or unsealed beauty products cannot be returned unless damaged upon arrival.</p>
          </div>
        </div>
      )}

      {/* Terms & Privacy */}
      {(cmsType === 'terms' || cmsType === 'privacy') && (
        <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <h1 className="font-serif font-black text-3xl text-neutral-900">
            {cmsType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {storeSettings.storeName} respects customer privacy. All contact numbers, addresses, and order information provided during checkout or WhatsApp chat are strictly used solely for completing doorstep delivery and sending order status updates. We never share or sell customer information to third parties.
          </p>
        </div>
      )}
    </div>
  );
}
