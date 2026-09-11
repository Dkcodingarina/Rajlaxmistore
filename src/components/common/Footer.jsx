import React from 'react';
import { useStore } from '../../context/StoreContext';
import categoryService from '../../services/categoryService';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Headphones,
  CheckCircle2
} from 'lucide-react';

export default function Footer() {
  const { storeSettings, navigateTo, user } = useStore();

  const categories = (categoryService.getCategories() || []).slice(0, 5);
  const freeThreshold = storeSettings?.freeDeliveryThreshold || 499;
  const storeName = storeSettings?.storeName || 'Rajlaxmi Store';
  const whatsappNum = storeSettings?.whatsappNumber || '918851409693';
  const phoneNum = storeSettings?.phone || '+91 8851409693';
  const emailAddr = storeSettings?.email || 'pawardeepanshu@gmail.com';
  const addressText = storeSettings?.address || 'Near Tower Chowk, Botad, Gujarat - 364710';
  const timingText = storeSettings?.businessHours?.trim() || 'Mon - Sun: 9:00 AM - 9:00 PM';

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800/80 pt-10 pb-28 md:pb-12 text-sm selection:bg-rose-900 selection:text-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* 1. Sleek Trust & Benefits Strip (Clean, modern, no bulky cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-10 border-b border-neutral-800/90">
          
          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Free Delivery</h4>
              <p className="text-[11px] text-neutral-400">On orders above ₹{freeThreshold}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">100% Genuine</h4>
              <p className="text-[11px] text-neutral-400">Authentic branded items</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">WhatsApp Ordering</h4>
              <p className="text-[11px] text-neutral-400">Direct instant assistance</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Easy Support</h4>
              <p className="text-[11px] text-neutral-400">Fast doorstep resolution</p>
            </div>
          </div>

        </div>

        {/* 2. Main Footer Navigation & Store Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 py-10">
          
          {/* Brand & About Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center font-serif font-black text-white text-lg shadow-md shadow-rose-950/40">
                {storeName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-serif font-black text-lg text-white tracking-wide uppercase block leading-none">
                  {storeName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 block mt-0.5">
                  Stationery & Cosmetics
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {storeSettings?.tagline || 'Your trusted destination for premium stationery, cosmetics & festive essentials.'}
            </p>

            {/* Direct WhatsApp Quick Chat Pill */}
            <div className="pt-1">
              <a
                href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Shop Links (3 Cols) */}
          <div className="lg:col-span-3">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Shop Categories</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              {categories.map((cat) => (
                <li key={cat.id || cat.slug}>
                  <button
                    type="button"
                    onClick={() => navigateTo('category', { categorySlug: cat.slug })}
                    className="text-neutral-400 hover:text-amber-400 hover:translate-x-1 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('products')}
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1 pt-1 cursor-pointer"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support (2 Cols) */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Help & Care</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      navigateTo('my-orders', { tab: 'support' });
                    } else {
                      document.getElementById('btn_support_widget')?.click();
                    }
                  }}
                  className="text-white hover:text-amber-400 font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-rose-400" />
                  <span>Support Helpdesk</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo(user ? 'my-orders' : 'auth')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Track Orders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('cms', { cmsType: 'faq' })}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('cms', { cmsType: 'returns' })}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('cms', { cmsType: 'privacy' })}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Location (3 Cols) */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Contact Store</span>
            </h3>
            
            <div className="flex items-start space-x-2.5 text-neutral-400">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{addressText}</span>
            </div>

            <div className="flex items-center space-x-2.5 text-neutral-400">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href={`tel:${phoneNum}`} className="hover:text-white transition-colors">
                {phoneNum}
              </a>
            </div>

            <div className="flex items-center space-x-2.5 text-neutral-400">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a href={`mailto:${emailAddr}`} className="hover:text-white transition-colors break-all">
                {emailAddr}
              </a>
            </div>

            <div className="flex items-center space-x-2.5 text-neutral-400 pt-1">
              <Clock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{timingText}</span>
            </div>
          </div>

        </div>

        {/* 3. Indian Retail Trust & Payment Methods Bar */}
        <div className="pt-6 pb-6 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-neutral-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-neutral-300">100% Safe & Secure Checkout</span>
          </div>

          {/* Clean Payment Pill Badges */}
          <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold text-neutral-400">
            <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
              UPI / QR
            </span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
              GPay / PhonePe
            </span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
              RuPay / Cards
            </span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
              Cash on Delivery (COD)
            </span>
          </div>
        </div>

        {/* 4. Bottom Copyright & Credits */}
        <div className="pt-4 border-t border-neutral-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center space-x-3 text-[11px]">
            <button
              type="button"
              onClick={() => navigateTo('cms', { cmsType: 'terms' })}
              className="hover:text-neutral-400 transition-colors"
            >
              Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigateTo('cms', { cmsType: 'privacy' })}
              className="hover:text-neutral-400 transition-colors"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigateTo('cms', { cmsType: 'returns' })}
              className="hover:text-neutral-400 transition-colors"
            >
              Returns
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
