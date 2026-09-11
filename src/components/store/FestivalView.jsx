import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import festivalService from '../../services/festivalService';
import productService from '../../services/productService';
import ProductCard from '../common/ProductCard';
import ProductQuickViewModal from './ProductQuickViewModal';
import { Sparkles, PartyPopper, Gift, ArrowLeft, Clock, ShoppingBag } from 'lucide-react';

export default function FestivalView() {
  const { currentParams, navigateTo } = useStore();
  const festivalSlug = currentParams.festivalSlug || 'rakshabandhan-special';

  const festival = festivalService.getFestivalBySlug(festivalSlug);
  const festivalProducts = productService.getProducts({ festivalSlug });

  const [selectedProduct, setSelectedProduct] = useState(null);

  if (!festival) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-neutral-200">
        <PartyPopper className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="font-serif font-bold text-xl text-neutral-900">Festival Not Found</h2>
        <p className="text-xs text-neutral-500 my-2">The festival collection you are looking for is currently inactive or completed.</p>
        <button
          onClick={() => navigateTo('home')}
          className="mt-4 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigateTo('home')}
        className="inline-flex items-center space-x-1 text-xs font-bold text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </button>

      {/* Festive Hero Banner */}
      <div
        style={{ backgroundColor: festival.themeColor || '#be123c' }}
        className="rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-white/20"
      >
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-10 translate-y-10">
          <PartyPopper className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Official Festival Campaign</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-white leading-tight">
            {festival.name}
          </h1>

          <p className="text-sm sm:text-base text-white/90 font-light leading-relaxed">
            {festival.description}
          </p>

          <div className="pt-2 flex items-center space-x-4">
            <div className="bg-amber-400 text-neutral-950 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg">
              🎉 {festival.discountText}
            </div>
            {festival.endDate && (
              <div className="text-xs text-white/80 font-medium flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Valid till: {festival.endDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-black text-xl sm:text-2xl text-neutral-900">
            Exclusive {festival.name} Collection ({festivalProducts.length})
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {festivalProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </div>

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
