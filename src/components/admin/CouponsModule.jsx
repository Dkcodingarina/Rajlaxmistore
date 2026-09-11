import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Percent,
  Calendar,
  IndianRupee,
  CheckCircle,
  Copy,
  Clock,
  Sparkles,
  Save
} from 'lucide-react';
import couponService from '../../services/couponService';
import ConfirmModal from '../common/ConfirmModal';

export default function CouponsModule({
  coupons = [],
  setCoupons,
  showToast,
  auditLog
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, couponId: null, couponCode: '' });
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: 15,
    minOrderValue: 500,
    maxDiscount: 300,
    usageLimit: 100,
    usedCount: 0,
    expiryDate: '',
    description: '',
    status: 'active'
  });

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code || '',
        discountType: coupon.discountType || (coupon.type === 'fixed' ? 'fixed' : 'percentage'),
        discountValue: coupon.discountValue || coupon.discount || 15,
        minOrderValue: coupon.minOrderValue || coupon.minSpend || 500,
        maxDiscount: coupon.maxDiscount || 300,
        usageLimit: coupon.usageLimit || 100,
        usedCount: coupon.usedCount || 0,
        expiryDate: coupon.expiryDate || '',
        description: coupon.description || '',
        status: coupon.status || 'active'
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: `FESTIVE${Math.floor(10 + Math.random() * 90)}`,
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 799,
        maxDiscount: 500,
        usageLimit: 250,
        usedCount: 0,
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
        description: 'Special seasonal promotional discount',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      showToast('Coupon code is required', 'error');
      return;
    }

    const payload = {
      ...couponForm,
      code: couponForm.code.toUpperCase().trim(),
      discountValue: Number(couponForm.discountValue) || 0,
      minOrderValue: Number(couponForm.minOrderValue) || 0,
      maxDiscount: Number(couponForm.maxDiscount) || 0,
      usageLimit: Number(couponForm.usageLimit) || 0
    };

    if (editingCoupon) {
      couponService.updateCoupon(editingCoupon.id, payload);
      setCoupons(couponService.getCoupons());
      showToast(`Coupon ${payload.code} updated`, 'success');
      if (auditLog) {
        auditLog('UPDATE_COUPON', payload.code, `Updated coupon terms: ${payload.discountValue}${payload.discountType === 'percentage' ? '%' : '₹'} off`);
      }
    } else {
      couponService.createCoupon(payload);
      setCoupons(couponService.getCoupons());
      showToast(`Coupon ${payload.code} created & activated`, 'success');
      if (auditLog) {
        auditLog('CREATE_COUPON', payload.code, `Created promotional coupon code offering ${payload.discountValue}${payload.discountType === 'percentage' ? '%' : '₹'} discount`);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id, code) => {
    setDeleteConfirm({ isOpen: true, couponId: id, couponCode: code });
  };

  const confirmDeleteCouponAction = () => {
    const { couponId, couponCode } = deleteConfirm;
    if (!couponId) return;
    couponService.deleteCoupon(couponId);
    setCoupons(couponService.getCoupons());
    showToast(`Coupon code "${couponCode}" deleted`, 'info');
    if (auditLog) {
      auditLog('DELETE_COUPON', couponCode, 'Removed promotional coupon code');
    }
    setDeleteConfirm({ isOpen: false, couponId: null, couponCode: '' });
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Code "${code}" copied to clipboard`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <span>Discount Engine & Promotional Coupons</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Configure custom voucher codes, percentage discounts, minimum cart spend limits and redemptions
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => {
          const isPercentage = coupon.discountType === 'percentage' || coupon.type === 'percentage';
          const val = coupon.discountValue || coupon.discount || 10;

          return (
            <div
              key={coupon.id}
              className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition p-5 relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-base px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                      title="Copy Code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                    coupon.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}>
                    {coupon.status || 'Active'}
                  </span>
                </div>

                <div>
                  <div className="text-xl font-black text-neutral-900 font-serif">
                    {isPercentage ? `${val}% OFF` : `₹${val} FLAT OFF`}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{coupon.description || 'Promotional seasonal voucher'}</p>
                </div>

                {/* Terms Box */}
                <div className="p-3 bg-neutral-50 rounded-xl space-y-1 text-xs border border-neutral-200/60 font-mono">
                  <div className="flex justify-between text-neutral-600">
                    <span>Min Cart Spend:</span>
                    <span className="font-bold text-neutral-900">₹{coupon.minOrderValue || coupon.minSpend || 0}</span>
                  </div>
                  {isPercentage && coupon.maxDiscount && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Max Discount Cap:</span>
                      <span className="font-bold text-neutral-900">₹{coupon.maxDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Redemptions:</span>
                    <span className="font-bold text-neutral-900">{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</span>
                  </div>
                </div>
              </div>

              {/* Expiry & Footer */}
              <div className="flex items-center justify-between text-xs pt-3 mt-4 border-t border-neutral-100">
                <span className="text-neutral-400 flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Exp: {coupon.expiryDate || 'No Expiry'}</span>
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenModal(coupon)}
                    className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id, coupon.code)}
                    className="p-1.5 rounded-lg bg-neutral-100 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <h3 className="font-serif font-black text-lg text-neutral-900">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Promotional Coupon'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., FESTIVE20"
                  value={couponForm.code || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono font-bold tracking-wider uppercase focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType || 'percentage'}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Value ({couponForm.discountType === 'percentage' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={couponForm.discountValue !== undefined && couponForm.discountValue !== null ? couponForm.discountValue : ''}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minOrderValue !== undefined && couponForm.minOrderValue !== null ? couponForm.minOrderValue : ''}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.maxDiscount !== undefined && couponForm.maxDiscount !== null ? couponForm.maxDiscount : ''}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.usageLimit !== undefined && couponForm.usageLimit !== null ? couponForm.usageLimit : ''}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate || ''}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Description / Campaign Note</label>
                <input
                  type="text"
                  placeholder="e.g., Diwali festive 20% discount on orders above ₹799"
                  value={couponForm.description || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Coupon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Coupon Code?"
        message={`Are you sure you want to delete coupon code "${deleteConfirm.couponCode}"? Customers will no longer be able to redeem this discount code at checkout.`}
        confirmText="Yes, Delete Coupon"
        cancelText="Keep Coupon"
        confirmVariant="danger"
        onConfirm={confirmDeleteCouponAction}
        onClose={() => setDeleteConfirm({ isOpen: false, couponId: null, couponCode: '' })}
      />
    </div>
  );
}
