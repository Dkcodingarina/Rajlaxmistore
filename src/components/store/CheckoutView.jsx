import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import orderService from '../../services/orderService';
import {
  MessageCircle,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  ArrowLeft,
  CreditCard,
  QrCode,
  Package
} from 'lucide-react';

const INDIAN_STATES = [
  'Gujarat',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCR)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export default function CheckoutView() {
  const {
    cart,
    clearCart,
    currentUser,
    storeSettings,
    appliedCoupon,
    removeCoupon,
    navigateTo,
    showToast
  } = useStore();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    whatsapp: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: 'Botad',
    state: 'Gujarat',
    pincode: '364710',
    landmark: '',
    paymentMethod: 'whatsapp', // 'whatsapp' | 'cod' | 'upi'
    notes: ''
  });

  const [completedOrder, setCompletedOrder] = useState(null);

  // Bill calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

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

  const deliveryFee = subtotal >= storeSettings.freeDeliveryThreshold ? 0 : storeSettings.standardDeliveryFee;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('Please create an account or sign in to complete your purchase!', 'info');
      navigateTo('auth', {
        redirectAfter: 'checkout',
        mode: 'register',
        message: 'Account creation is required to place your doorstep order and track delivery status.'
      });
      return;
    }

    if (!formData.name.trim()) {
      showToast('Please enter your Full Name for delivery.', 'error');
      return;
    }

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit Mobile Phone Number.', 'error');
      return;
    }

    if (!formData.address.trim()) {
      showToast('Please enter your House / Flat / Street Address.', 'error');
      return;
    }

    if (!formData.city.trim()) {
      showToast('Please enter your Delivery City.', 'error');
      return;
    }

    if (!formData.state) {
      showToast('Please select your State.', 'error');
      return;
    }

    const cleanPincode = (formData.pincode || '').replace(/\D/g, '');
    if (!cleanPincode || cleanPincode.length < 6) {
      showToast('Please enter a valid 6-digit Postal Pincode.', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      navigateTo('cart');
      return;
    }

    // Prepare Order object
    const orderData = {
      customerId: currentUser?.id || 'guest',
      customerName: formData.name || currentUser?.name || 'Customer',
      customerEmail: currentUser?.email || '',
      customerPhone: formData.phone || currentUser?.phone || '',
      whatsapp: formData.whatsapp || formData.phone || currentUser?.phone || '',
      address: `${formData.address}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`,
      items: cart,
      subtotal,
      discount: discountAmount,
      couponCode: appliedCoupon?.code || null,
      deliveryFee,
      totalAmount: finalTotal,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    };

    // Save order
    const createdOrder = orderService.createOrder(orderData);
    setCompletedOrder(createdOrder);

    // Clear Cart and Coupons
    clearCart();
    removeCoupon();
    showToast(`Order #${createdOrder.id} created successfully!`, 'success');

    // Generate WhatsApp Message if chosen or for direct confirmation
    if (formData.paymentMethod === 'whatsapp' || formData.paymentMethod === 'cod') {
      const waUrl = orderService.generateWhatsAppLink(createdOrder, storeSettings.whatsappNumber);
      window.open(waUrl, '_blank');
    }
  };

  if (completedOrder) {
    const waUrl = orderService.generateWhatsAppLink(completedOrder, storeSettings.whatsappNumber);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed!
          </span>
          <h1 className="font-serif font-black text-3xl text-neutral-900">
            Thank You, {completedOrder.customerName}!
          </h1>
          <p className="text-xs text-neutral-600">
            Order ID: <span className="font-mono font-bold text-rose-700">{completedOrder.id}</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs text-left space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 pb-2 border-b border-neutral-200 flex items-center justify-between">
            <span>Order Highlights</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full capitalize">
              Status: {completedOrder.status}
            </span>
          </h3>

          <div className="space-y-2 text-xs text-neutral-700">
            <div className="flex justify-between">
              <span>Delivery Address:</span>
              <span className="font-bold text-right max-w-xs">{completedOrder.address}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-black text-rose-700 text-sm">₹{completedOrder.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase text-neutral-900">{completedOrder.paymentMethod}</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[11px] font-bold text-neutral-500 uppercase mb-2">Items Ordered ({completedOrder.items.length}):</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1 border-b border-neutral-100">
                  <span className="truncate max-w-[200px]">{item.name} x {item.quantity}</span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Open WhatsApp Confirmation</span>
          </a>

          <button
            onClick={() => navigateTo('my-orders')}
            className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders History</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-neutral-200">
        <button
          onClick={() => navigateTo('cart')}
          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-neutral-900">
            Checkout & Order
          </h1>
          <p className="text-xs text-neutral-500">Provide doorstep delivery details and payment preference</p>
        </div>
      </div>

      {!currentUser && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-2.5 text-xs text-rose-900 font-bold">
            <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Registration required to finalize purchase and save your order history.</span>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('auth', { redirectAfter: 'checkout', mode: 'register' })}
            className="px-4 py-2 bg-neutral-900 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 hover:bg-rose-600 transition"
          >
            Create Free Account Now
          </button>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Customer & Delivery Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details Box */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center space-x-2 pb-2 border-b border-neutral-200">
              <User className="w-5 h-5 text-rose-600" />
              <span>1. Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sonal Sharma"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">WhatsApp Number (For Order Updates)</label>
                <input
                  type="tel"
                  placeholder="Same as phone number"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Box */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center space-x-2 pb-2 border-b border-neutral-200">
              <MapPin className="w-5 h-5 text-rose-600" />
              <span>2. Delivery Address</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Flat / House No., Street, Area *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. B-202, Gokul Housing Society, MG Road"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Swaminarayan Temple"
                    value={formData.landmark || ''}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Botad / Ahmedabad"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">State *</label>
                  <select
                    required
                    value={formData.state || 'Gujarat'}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="">-- Select State --</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Pincode * (6 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 364710"
                    value={formData.pincode || ''}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection Box */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center space-x-2 pb-2 border-b border-neutral-200">
              <CreditCard className="w-5 h-5 text-rose-600" />
              <span>3. Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: WhatsApp Direct Order */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  formData.paymentMethod === 'whatsapp'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="whatsapp"
                    checked={formData.paymentMethod === 'whatsapp'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="accent-emerald-600"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">Direct WhatsApp</h4>
                  <p className="text-[11px] text-neutral-500">Send order to store on WhatsApp for fast dispatch</p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  formData.paymentMethod === 'cod'
                    ? 'border-rose-600 bg-rose-50/50'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Truck className="w-6 h-6 text-rose-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="accent-rose-600"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">Cash on Delivery</h4>
                  <p className="text-[11px] text-neutral-500">Pay cash directly when order reaches doorstep</p>
                </div>
              </label>

              {/* Option 3: UPI / QR Code */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  formData.paymentMethod === 'upi'
                    ? 'border-amber-600 bg-amber-50/50'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <QrCode className="w-6 h-6 text-amber-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="accent-amber-600"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">Pay via UPI QR</h4>
                  <p className="text-[11px] text-neutral-500">GPay, PhonePe, Paytm QR code payment</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Items & Place Button */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-black text-lg text-neutral-900 pb-2 border-b border-neutral-200">
              Order Items ({cart.length})
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Savings</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Payable</span>
                <span className="text-rose-700">₹{finalTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg transition transform active:scale-95"
            >
              <span>Place Order Now</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sticky Quick Place Order Bar */}
        <div className="md:hidden fixed bottom-[56px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-500 block">Total Due</span>
            <span className="text-base font-black text-rose-700">₹{finalTotal}</span>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 active:from-rose-700 active:to-amber-700 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            <span>Place Order</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
