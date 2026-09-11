import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Lock,
  LogIn,
  UserCheck
} from 'lucide-react';
import reviewService from '../../services/reviewService';

export default function ProductQuickViewModal({ product, onClose }) {
  const { addToCart, wishlist, toggleWishlist, activeFestival, showToast, user, currentUser, setCurrentView } = useStore();
  const activeCustomer = currentUser || user;

  const [selectedImage, setSelectedImage] = useState(
    product?.images && product.images.length > 0 ? product.images[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'

  // Review Form state
  const [reviews, setReviews] = useState(() => reviewService.getReviews(product?.id, true));
  const [newReview, setNewReview] = useState({
    name: activeCustomer?.name || '',
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const isFestivalProduct = activeFestival && product.festivals && product.festivals.includes(activeFestival.id);

  const handleAddReview = (e) => {
    e.preventDefault();

    if (!activeCustomer) {
      showToast('Please register or sign in to write a review.', 'error');
      onClose();
      setCurrentView('auth');
      return;
    }

    if (!newReview.comment.trim()) {
      showToast('Please write a review comment.', 'error');
      return;
    }

    const reviewerName = activeCustomer.name || newReview.name || activeCustomer.email.split('@')[0] || 'Verified Customer';

    reviewService.addReview({
      productId: product.id,
      productName: product.name,
      customerName: reviewerName,
      customerEmail: activeCustomer.email || '',
      customerId: activeCustomer.id || '',
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      isVerifiedBuyer: true
    });

    setReviews(reviewService.getReviews(product.id, true));
    setNewReview({ name: activeCustomer.name || '', rating: 5, comment: '' });
    setShowReviewForm(false);
    showToast('Thank you! Your verified review has been submitted.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-neutral-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-neutral-100 hover:bg-rose-100 text-neutral-600 hover:text-rose-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content Scrollable Area */}
        <div className="overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl bg-neutral-100 overflow-hidden relative border border-neutral-200">
                <img
                  src={selectedImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {isFestivalProduct && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{activeFestival.name.split(' ')[0]} Special</span>
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-neutral-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                        selectedImage === img ? 'border-rose-600 scale-95' : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Meta & Add to Cart */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                    {product.brand}
                  </span>
                  <span className="text-xs font-semibold text-neutral-500">
                    SKU: {product.sku}
                  </span>
                </div>

                <h2 className="font-serif font-bold text-xl md:text-2xl text-neutral-900 leading-snug">
                  {product.name}
                </h2>

                {/* Rating & Review trigger */}
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold text-neutral-900">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{product.rating || 4.8}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-neutral-500 hover:text-rose-700 underline font-medium"
                  >
                    ({reviews.length} customer reviews)
                  </button>
                </div>

                {/* Price Display */}
                <div className="pt-2 flex items-baseline space-x-3">
                  <span className="font-black text-2xl md:text-3xl text-neutral-900">
                    ₹{product.price}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-neutral-400 line-through">
                      MRP: ₹{product.mrp}
                    </span>
                  )}
                  {product.mrp > product.price && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      You save ₹{product.mrp - product.price}
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-xs text-neutral-600 leading-relaxed pt-1">
                  {product.description}
                </p>

                {/* Key Highlights Bullets */}
                {product.highlights && product.highlights.length > 0 && (
                  <div className="pt-2 space-y-1">
                    <div className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Key Features:</div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-700">
                      {product.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Selector & Add to Cart Action */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                {product.stock <= 0 ? (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl font-bold text-xs flex items-center space-x-2 border border-red-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Currently out of stock. Check back soon or contact support.</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-2">
                      {/* Quantity Picker */}
                      <div className="flex items-center border border-neutral-300 rounded-xl bg-neutral-50 overflow-hidden shrink-0 h-11">
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          className="px-3.5 py-2 text-sm font-bold hover:bg-neutral-200 active:bg-neutral-300 transition cursor-pointer touch-manipulation h-full"
                        >
                          -
                        </button>
                        <span className="px-3 py-2 font-bold text-sm min-w-[36px] text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                          className="px-3.5 py-2 text-sm font-bold hover:bg-neutral-200 active:bg-neutral-300 transition cursor-pointer touch-manipulation h-full"
                        >
                          +
                        </button>
                      </div>

                      {/* Wishlist Button on Mobile */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className={`sm:hidden p-2.5 rounded-xl border transition-colors flex items-center justify-center shrink-0 h-11 w-11 cursor-pointer touch-manipulation ${
                          isWishlisted
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'border-neutral-300 hover:border-rose-600 text-neutral-700'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, quantity);
                        onClose();
                      }}
                      className="flex-1 py-3 px-4 sm:px-6 rounded-xl bg-neutral-900 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer touch-manipulation min-h-[44px]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add To Cart (₹{product.price * quantity})</span>
                    </button>

                    {/* Wishlist Button on Desktop */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`hidden sm:flex p-3 rounded-xl border transition-colors items-center justify-center cursor-pointer touch-manipulation h-11 w-11 ${
                        isWishlisted
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-neutral-300 hover:border-rose-600 text-neutral-700'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )}

                {/* Delivery Guarantee Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-neutral-500">
                  <div className="flex items-center space-x-1.5">
                    <Truck className="w-3.5 h-3.5 text-rose-600" />
                    <span>Fast Doorstep Delivery</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                    <span>100% Genuine Branded Product</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs: Details vs Customer Reviews */}
          <div className="pt-6 border-t border-neutral-200 space-y-4">
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                  activeTab === 'details' ? 'border-rose-600 text-rose-700' : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                  activeTab === 'reviews' ? 'border-rose-600 text-rose-700' : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Customer Reviews ({reviews.length})
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="text-xs text-neutral-700 space-y-2 leading-relaxed">
                <p>{product.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <span className="font-bold text-neutral-900 block">Category:</span>
                    <span>{product.category}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <span className="font-bold text-neutral-900 block">Brand:</span>
                    <span>{product.brand}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Reviews Header */}
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 flex items-center space-x-1.5">
                    <span>Verified Customer Feedback</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-mono">
                      {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </span>
                  </h4>
                  {activeCustomer ? (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        setCurrentView('auth');
                      }}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition flex items-center space-x-1.5 cursor-pointer text-xs"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Login to Review</span>
                    </button>
                  )}
                </div>

                {/* Registration Notice for Guests */}
                {!activeCustomer && (
                  <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-2.5">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-900 text-xs">Customer Registration Required</p>
                        <p className="text-[11px] text-amber-700">
                          Please log in or create an account to write a review. Only genuine verified customers can submit product ratings.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        setCurrentView('auth');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Register / Sign In</span>
                    </button>
                  </div>
                )}

                {/* Review Form for Registered Users */}
                {showReviewForm && activeCustomer && (
                  <form onSubmit={handleAddReview} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
                      <h5 className="font-bold text-neutral-900 text-xs">Write Your Product Review</h5>
                      <span className="flex items-center space-x-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <UserCheck className="w-3 h-3" />
                        <span>Verified Account</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">Your Name</label>
                        <input
                          type="text"
                          readOnly
                          value={activeCustomer.name || activeCustomer.email.split('@')[0] || ''}
                          className="w-full p-2 bg-neutral-100 rounded-lg border border-neutral-300 text-xs text-neutral-700 font-medium cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">Rating</label>
                        <select
                          value={newReview.rating || 5}
                          onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                          className="w-full p-2 bg-white rounded-lg border border-neutral-300 text-xs font-bold text-amber-700"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                          <option value={4}>⭐⭐⭐⭐ 4 Stars (Good)</option>
                          <option value={3}>⭐⭐⭐ 3 Stars (Average)</option>
                          <option value={2}>⭐⭐ 2 Stars (Poor)</option>
                          <option value={1}>⭐ 1 Star (Very Bad)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">Your Review Comment</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Share your experience with this product..."
                        value={newReview.comment || ''}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full p-2 bg-white rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer flex items-center space-x-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Submit Verified Review</span>
                    </button>
                  </form>
                )}

                {/* Review List */}
                {reviews.length === 0 ? (
                  <p className="text-neutral-500 italic py-2">No reviews yet for this product. Be the first to leave a review!</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-neutral-900">{rev.customerName || rev.userName || 'Verified Buyer'}</span>
                            {rev.isVerifiedBuyer !== false && (
                              <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Verified
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-neutral-700 leading-snug">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
