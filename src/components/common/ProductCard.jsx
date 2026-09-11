import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Star, Heart, ShoppingBag, Check, Sparkles, AlertTriangle } from 'lucide-react';

export default function ProductCard({ product, onSelect }) {
  const { addToCart, wishlist, toggleWishlist, activeFestival } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const isFestivalProduct = activeFestival && product.festivals && product.festivals.includes(activeFestival.id);

  const handleCardClick = (e) => {
    // Don't trigger modal if user clicked directly on Add to Cart or Wishlist button
    if (e.target.closest('button')) return;
    if (onSelect) onSelect(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Container */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
          {/* Active Festival Special Badge */}
          {isFestivalProduct && (
            <span className="bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{activeFestival.name.split(' ')[0]}</span>
            </span>
          )}

          {/* Discount Badge */}
          {product.discount > 0 && (
            <span className="bg-amber-500 text-neutral-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
              {product.discount}% OFF
            </span>
          )}

          {/* Bestseller Badge */}
          {product.bestseller && !isFestivalProduct && (
            <span className="bg-neutral-900 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all z-10 ${
            isWishlisted
              ? 'bg-rose-600 text-white scale-105'
              : 'bg-white/90 text-neutral-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium mb-1">
            <span className="truncate max-w-[110px] font-semibold text-rose-700">{product.brand}</span>
            {/* Rating */}
            <div className="flex items-center space-x-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="font-bold text-neutral-800">{product.rating || 4.8}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-medium text-xs sm:text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:text-rose-700 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Stock status indicator if low */}
        {product.stock > 0 && product.stock <= 8 && (
          <div className="flex items-center space-x-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-max">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>Only {product.stock} left in stock</span>
          </div>
        )}

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-extrabold text-sm sm:text-base text-neutral-900">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-neutral-400 line-through">
                  ₹{product.mrp}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            disabled={product.stock <= 0}
            className={`px-3 py-2 sm:py-1.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer touch-manipulation min-h-[36px] min-w-[36px] ${
              product.stock > 0
                ? 'bg-neutral-900 hover:bg-rose-600 active:bg-rose-700 text-white shadow-xs active:scale-95'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
            title="Add 1 to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="inline sm:inline text-[11px] sm:text-xs">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
