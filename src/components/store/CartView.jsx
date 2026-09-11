import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import couponService from '../../services/couponService';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function CartView() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    storeSettings,
    currentUser,
    navigateTo,
    showToast
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const handleCheckoutClick = () => {
    if (!currentUser) {
      showToast('Please register or sign in to complete your purchase!', 'info');
      navigateTo('auth', {
        redirectAfter: 'checkout',
        mode: 'register',
        message: 'Please create an account or sign in to proceed to checkout and track your delivery.'
      });
      return;
    }
    navigateTo('checkout');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = appliedCoupon.value;
    }
  }

  const deliveryCharge = subtotal >= storeSettings.freeDeliveryThreshold || cart.length === 0 ? 0 : storeSettings.standardDeliveryFee;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const freeDeliveryNeeded = Math.max(0, storeSettings.freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / storeSettings.freeDeliveryThreshold) * 100);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = couponService.validateCoupon(couponInput, subtotal);
    if (!res.valid) {
      showToast(res.message, 'error');
      return;
    }

    applyCoupon(res.coupon);
    showToast(`Coupon "${res.coupon.code}" applied successfully!`, 'success');
    setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif font-black text-2xl text-neutral-900">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added any cosmetics, stationery, or festive gift sets to your bag yet.
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigateTo('products')}
            className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition"
          >
            Explore Catalog Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateTo('products')}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-neutral-900">
              Your Shopping Bag ({cart.length})
            </h1>
            <p className="text-xs text-neutral-500">Review items before placing your order</p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Delivery Threshold Bar */}
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
          <span className="flex items-center space-x-1.5">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>
              {freeDeliveryNeeded > 0
                ? `Add ₹${freeDeliveryNeeded} more to get FREE Local Delivery!`
                : '🎉 Congratulations! You qualify for FREE Delivery!'}
            </span>
          </span>
          <span className="text-amber-800">{Math.round(freeDeliveryProgress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-amber-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${freeDeliveryProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-4"
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80'}
                alt={item.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">{item.brand}</span>
                <h3 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">{item.name}</h3>
                <div className="flex items-baseline space-x-2 text-xs">
                  <span className="font-black text-neutral-900">₹{item.price}</span>
                  {item.mrp > item.price && (
                    <span className="text-neutral-400 line-through text-[11px]">₹{item.mrp}</span>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2 border border-neutral-300 rounded-xl bg-neutral-50 p-1 shrink-0">
                <button
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-700 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-xs px-2 min-w-[20px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-neutral-400 hover:text-rose-600 transition"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Order Summary & Coupon Code */}
        <div className="space-y-6">
          {/* Coupon Code Section */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-neutral-900 flex items-center space-x-1.5">
              <Tag className="w-4 h-4 text-rose-600" />
              <span>Have a Promo / Coupon Code?</span>
            </label>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-900 block">Code: {appliedCoupon.code}</span>
                  <span className="text-emerald-700 text-[11px]">Savings: ₹{discountAmount}</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FESTIVE10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 p-2 bg-neutral-50 rounded-xl border border-neutral-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Apply
                </button>
              </form>
            )}

            <div className="text-[11px] text-neutral-500 pt-1">
              Try codes: <span className="font-bold text-rose-700">FESTIVE10</span> (10% off) or <span className="font-bold text-rose-700">RAJLAXMI100</span> (₹100 off above ₹999)
            </div>
          </div>

          {/* Bill Breakdown Box */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-serif font-black text-lg text-neutral-900 pb-2 border-b border-neutral-200">
              Bill Summary
            </h3>

            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-neutral-900">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Local Delivery Fee</span>
                <span className="font-bold text-neutral-900">
                  {deliveryCharge === 0 ? <span className="text-emerald-700 uppercase">Free</span> : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-between text-base font-black text-neutral-900">
                <span>Grand Total</span>
                <span className="text-rose-700">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg transition transform active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-neutral-500 flex items-center justify-center space-x-1.5 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct WhatsApp & Doorstep Cash on Delivery Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Quick Checkout Bar (Positioned right above BottomNav for thumb ease) */}
      <div className="md:hidden fixed bottom-[56px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-500 block">Total Amount</span>
          <span className="text-base font-black text-rose-700">₹{finalTotal}</span>
        </div>
        <button
          type="button"
          onClick={handleCheckoutClick}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 active:from-rose-700 active:to-amber-700 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
