import React, { useState } from 'react';
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Truck,
  Globe,
  Save,
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import settingsService from '../../services/settingsService';
import ConfirmModal from '../common/ConfirmModal';

export default function StoreSettingsModule({
  storeSettings,
  setStoreSettings,
  showToast,
  auditLog
}) {
  const [form, setForm] = useState(() => {
    return storeSettings || settingsService.getSettings() || {
      storeName: 'Rajlaxmi Store',
      tagline: 'Premium Cosmetics, School Stationery & General Store Essentials',
      phone: '+91 98765 43210',
      whatsappNumber: '919876543210',
      email: 'support@rajlaxmistore.com',
      address: 'Station Road, Near Tower Chowk, Botad, Gujarat - 364710',
      currency: 'INR',
      freeDeliveryThreshold: 499,
      standardDeliveryCharge: 49,
      instagramUrl: 'https://instagram.com/rajlaxmistore',
      facebookUrl: 'https://facebook.com/rajlaxmistore',
      enableCod: true,
      enableOnlineUpi: true
    };
  });
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  React.useEffect(() => {
    if (storeSettings) {
      setForm(storeSettings);
    }
  }, [storeSettings]);

  const handleTriggerSave = (e) => {
    e.preventDefault();
    setShowConfirmSave(true);
  };

  const handleConfirmSave = () => {
    const updated = settingsService.updateSettings ? settingsService.updateSettings(form) : form;
    setStoreSettings(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('store_settings_updated', { detail: updated }));
    }
    showToast(`Store settings updated successfully for "${updated.storeName}"`, 'success');
    if (auditLog) {
      auditLog('UPDATE_STORE_SETTINGS', updated.storeName, `Updated store identity to "${updated.storeName}" & logistics parameters`);
    }
    setShowConfirmSave(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-800" />
            <span>Storefront Settings & Brand Configuration</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Configure boutique branding, WhatsApp concierge routing, delivery freight fees, and payment channels
          </p>
        </div>
      </div>

      <form onSubmit={handleTriggerSave} className="space-y-6 text-xs">
        {/* Section 1: Brand Identity */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-serif font-black text-base text-neutral-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-rose-600" />
            <span>Brand Identity & Tagline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Store / Boutique Name *</label>
              <input
                type="text"
                required
                value={form.storeName || ''}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Official Support Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Boutique Tagline / Hero Statement</label>
            <input
              type="text"
              value={form.tagline || ''}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Store Contact Phone</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">WhatsApp Concierge Ordering Phone</label>
              <input
                type="text"
                value={form.whatsappNumber || ''}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Store Physical / Flagship Address</label>
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Delivery & Shipping Freight Rules */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-serif font-black text-base text-neutral-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Shipping & Logistics Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Free Delivery Min Spend (₹)</label>
              <input
                type="number"
                min="0"
                value={form.freeDeliveryThreshold !== undefined && form.freeDeliveryThreshold !== null ? form.freeDeliveryThreshold : ''}
                onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono font-bold focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1">Carts above this value receive free courier delivery</p>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={form.standardDeliveryCharge !== undefined && form.standardDeliveryCharge !== null ? form.standardDeliveryCharge : ''}
                onChange={(e) => setForm({ ...form, standardDeliveryCharge: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono font-bold focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1">Charged when order is below free threshold</p>
            </div>
          </div>
        </div>

        {/* Section 3: Social Links */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-serif font-black text-base text-neutral-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Social Handles & Storefront Links</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Instagram URL</label>
              <input
                type="url"
                value={form.instagramUrl || ''}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Facebook URL</label>
              <input
                type="url"
                value={form.facebookUrl || ''}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>

      {/* Safety Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmSave}
        onClose={() => setShowConfirmSave(false)}
        onConfirm={handleConfirmSave}
        title="Update Store Configuration?"
        message={`Are you sure you want to update store brand identity to "${form.storeName}" and apply new logistics & delivery settings?`}
        confirmText="Yes, Save Settings"
        confirmVariant="primary"
      />
    </div>
  );
}
