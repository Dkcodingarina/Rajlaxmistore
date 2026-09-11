import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import HeroSlider from './HeroSlider';
import ProductCard from '../common/ProductCard';
import ProductQuickViewModal from './ProductQuickViewModal';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { Sparkles, ArrowRight, Heart, Flame, Gift, Truck, ShieldCheck, PhoneCall, PartyPopper } from 'lucide-react';

export default function HomeView() {
  const { navigateTo, storeSettings, activeFestival, catalogVersion } = useStore();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'cosmetics' | 'stationery' | 'hampers'

  const rawCategories = categoryService.getCategories();
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  // Fetch products (re-evaluated on catalogVersion change)
  const featuredProducts = Array.isArray(productService.getFeaturedProducts()) ? productService.getFeaturedProducts() : [];
  const bestsellers = Array.isArray(productService.getBestsellers()) ? productService.getBestsellers() : [];
  const newArrivals = Array.isArray(productService.getNewArrivals()) ? productService.getNewArrivals() : [];

  // Tab filtered products
  let tabProducts = featuredProducts;
  if (activeTab === 'cosmetics') {
    tabProducts = tabProducts.filter(p => (p.category || '').toLowerCase().includes('cosmetics') || (p.category || '').toLowerCase().includes('skin'));
  } else if (activeTab === 'stationery') {
    tabProducts = tabProducts.filter(p => (p.category || '').toLowerCase().includes('stationery') || (p.category || '').toLowerCase().includes('office'));
  } else if (activeTab === 'hampers') {
    tabProducts = tabProducts.filter(p => (p.category || '').toLowerCase().includes('gift') || (p.category || '').toLowerCase().includes('festival'));
  }

  return (
    <div key={`home-ver-${catalogVersion}`} className="space-y-10 sm:space-y-14 pb-12">
      {/* 1. Hero Banner Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <HeroSlider />
      </section>

      {/* 2. Active Festival Featured Products Section */}
      {activeFestival && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-rose-500/30"
            style={{
              background: activeFestival.themeColor
                ? `linear-gradient(135deg, ${activeFestival.themeColor} 0%, #111827 100%)`
                : 'linear-gradient(135deg, #881337 0%, #111827 100%)'
            }}
          >
            {/* Festive Background Watermark */}
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
              <PartyPopper className="w-80 h-80 text-amber-300" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/20">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-neutral-950 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wide shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                  <span>LIVE FESTIVAL CAMPAIGN</span>
                </div>
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-white pt-1">
                  {activeFestival.name} Special Offers
                </h2>
                <p className="text-xs sm:text-sm text-rose-100 max-w-2xl font-light">
                  {activeFestival.discountText || activeFestival.description}
                </p>
              </div>

              <button
                onClick={() => navigateTo('festival', { festivalSlug: activeFestival.slug })}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-xs rounded-xl transition shadow-md flex items-center space-x-1.5 shrink-0 self-start md:self-auto cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Explore All {activeFestival.name} Deals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Active Festival Assigned Products Grid */}
            <div className="relative z-10">
              {(() => {
                let festProds = productService.getProducts({ festivalSlug: activeFestival.slug });
                if (festProds.length === 0) {
                  festProds = featuredProducts.slice(0, 8);
                }

                if (festProds.length === 0) {
                  return (
                    <div className="py-6 text-center bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-rose-200">No festival products available at this moment.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {festProds.slice(0, 8).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={(p) => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* 3. Shop By Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-neutral-900 tracking-tight">
              Browse Categories
            </h2>
            <p className="text-xs text-neutral-500">Explore cosmetics, school & office stationery, and festival gift hampers</p>
          </div>
          <button
            onClick={() => navigateTo('products')}
            className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo('category', { categorySlug: cat.slug })}
              className="group bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer text-center flex flex-col items-center justify-between space-y-2"
            >
              <div className="w-full aspect-4/3 rounded-xl bg-neutral-100 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-bold text-xs text-neutral-900 group-hover:text-rose-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Bestselling Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-neutral-900 tracking-tight">
                Store Bestsellers
              </h2>
              <p className="text-xs text-neutral-500">Most loved products by our local customers</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('products', { sortBy: 'bestseller' })}
            className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center space-x-1"
          >
            <span>See All Bestsellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestsellers.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. Featured Collection with Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 bg-neutral-100/70 py-10 rounded-3xl border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Curated Collections</span>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-neutral-900 tracking-tight">
              Featured Products
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-neutral-200 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Featured' },
              { id: 'cosmetics', label: '💄 Cosmetics' },
              { id: 'stationery', label: '✏️ Stationery' },
              { id: 'hampers', label: '🎁 Gift Hampers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {tabProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
