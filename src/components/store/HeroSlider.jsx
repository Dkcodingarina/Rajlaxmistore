import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import bannerService from '../../services/bannerService';
import { ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';

export default function HeroSlider() {
  const { navigateTo, activeFestival, storeSettings } = useStore();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchBanners = () => {
    const list = bannerService.getBanners(true) || [];

    if (!activeFestival) {
      // Normal Mode: strictly show general banners without festival locks
      const normalBanners = list.filter(b => !b.festivalSlug || b.festivalSlug === '');
      setBanners(normalBanners.length > 0 ? normalBanners : list);
    } else {
      // Active Campaign Mode: show campaign banner first, followed by general banners
      let festBanners = list.filter(b => b.festivalSlug === activeFestival.slug);
      const generalBanners = list.filter(b => !b.festivalSlug || b.festivalSlug === '');

      if (festBanners.length === 0 && activeFestival.banner) {
        festBanners = [{
          id: `banner-${activeFestival.id}`,
          title: activeFestival.name,
          subtitle: activeFestival.discountText || activeFestival.description,
          badge: activeFestival.tag || 'Special Festive Deal',
          image: activeFestival.banner,
          festivalSlug: activeFestival.slug,
          ctaText: `Shop ${activeFestival.name}`,
          cta_text: `Shop ${activeFestival.name}`,
          status: 'active'
        }];
      }

      setBanners([...festBanners, ...generalBanners]);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [activeFestival, storeSettings]);

  // Ensure index stays valid if banners change
  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(0);
    }
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-900 shadow-xl border border-neutral-800">
      <div className="relative min-h-[220px] sm:min-h-[340px] md:min-h-[420px] w-full flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-transparent"></div>
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-8 space-y-3 sm:space-y-4">
          {current.festivalSlug && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-600 text-amber-200 text-xs font-bold uppercase tracking-wider shadow-sm">
              <PartyPopper className="w-3.5 h-3.5" />
              <span>Festive Exclusive</span>
            </span>
          )}

          <h2 className="font-serif font-black text-2xl sm:text-4xl md:text-5xl text-white leading-tight drop-shadow-md">
            {current.title}
          </h2>

          <p className="text-xs sm:text-base text-neutral-200 line-clamp-2 max-w-lg font-light leading-relaxed">
            {current.subtitle}
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (current.festivalSlug) {
                  navigateTo('festival', { festivalSlug: current.festivalSlug });
                } else {
                  navigateTo('products');
                }
              }}
              className="px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-rose-900/40 transition-all transform active:scale-95"
            >
              {current.cta || 'Shop Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? 'w-6 bg-amber-400' : 'w-2 bg-white/50'
                }`}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
