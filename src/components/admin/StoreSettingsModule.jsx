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
  ShieldAlert,
  Database,
  CheckCircle2,
  XCircle,
  Copy,
  Terminal,
  ExternalLink,
  Zap
} from 'lucide-react';
import settingsService from '../../services/settingsService';
import ConfirmModal from '../common/ConfirmModal';
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  saveSupabaseCredentials,
  testSupabaseConnection,
  isSupabaseConfigured
} from '../../lib/supabase';

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

  // Supabase Form state
  const [supabaseUrl, setSupabaseUrlInput] = useState(() => getSupabaseUrl());
  const [supabaseAnonKey, setSupabaseAnonKeyInput] = useState(() => getSupabaseAnonKey());
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  React.useEffect(() => {
    if (storeSettings) {
      setForm(storeSettings);
    }
  }, [storeSettings]);

  const handleTestConnection = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestStatus(null);
    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setIsTestingSupabase(false);
    setSupabaseTestStatus(res);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSaveSupabaseConfig = () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      showToast('Please enter both Supabase Project URL and Anon Key.', 'error');
      return;
    }

    if (!supabaseAnonKey.trim().startsWith('eyJ')) {
      showToast('Invalid Supabase Anon Key. It should start with "eyJ".', 'error');
      return;
    }

    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    showToast('Supabase Credentials Saved! Reloading store to establish live connection...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const sqlSetupScript = `-- ==========================================
-- RAJLAXMI STORE - COMPLETE SUPABASE SQL SCHEMA
-- Paste & Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================

-- 1. PROFILES / CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  category TEXT,
  brand TEXT,
  price NUMERIC NOT NULL,
  mrp NUMERIC,
  discount NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 10,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  festivals JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  address TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cod',
  status TEXT DEFAULT 'Processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT,
  price NUMERIC,
  quantity INTEGER,
  image_url TEXT
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  image TEXT,
  icon TEXT,
  item_count INTEGER DEFAULT 0
);

-- 6. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expiry_date TEXT
);

-- 7. ENABLE ROW LEVEL SECURITY & PUBLIC POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles policy" ON public.profiles;
CREATE POLICY "Public profiles policy" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public orders policy" ON public.orders;
CREATE POLICY "Public orders policy" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public products policy" ON public.products;
CREATE POLICY "Public products policy" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 8. AUTOMATIC USER REGISTRATION TRIGGER (Auth -> Profiles Sync)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

  const copySqlScript = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    setCopiedSql(true);
    showToast('SQL Setup Script copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2000);
  };

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
            Configure boutique branding, Supabase cloud database keys, logistics, and payment channels
          </p>
        </div>
      </div>

      {/* SUPABASE CLOUD DATABASE CONFIGURATION CARD */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-6 shadow-xl border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 rounded-2xl text-rose-400 border border-rose-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-white flex items-center gap-2">
                <span>Supabase Cloud Database Link</span>
                {isSupabaseConfigured ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-sans font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Live Database Connected</span>
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-amber-400" />
                    <span>Offline / Local Storage Mode</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400">
                Connect your live Supabase project to sync all Users, Orders, Products & Stock instantly across devices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-rose-300 border border-neutral-700 transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-rose-400" />
            <span>Generate Supabase SQL Script</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-300 mb-1">Supabase Project URL *</label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrl}
              onChange={(e) => {
                setSupabaseUrlInput(e.target.value);
                setSupabaseTestStatus(null);
              }}
              className="w-full px-3.5 py-2.5 bg-neutral-800/80 rounded-xl border border-neutral-700 font-mono text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-300 mb-1">Supabase Anon Public API Key *</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiI..."
              value={supabaseAnonKey}
              onChange={(e) => {
                setSupabaseAnonKeyInput(e.target.value);
                setSupabaseTestStatus(null);
              }}
              className="w-full px-3.5 py-2.5 bg-neutral-800/80 rounded-xl border border-neutral-700 font-mono text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {supabaseTestStatus && (
          <div className={`p-3 rounded-2xl border text-xs font-medium flex items-start gap-2 ${
            supabaseTestStatus.success
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
          }`}>
            {supabaseTestStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{supabaseTestStatus.message}</p>
              {!supabaseTestStatus.success && (
                <p className="text-[11px] opacity-80 mt-0.5">
                  Make sure your Supabase project is active, key starts with "eyJ", and SQL tables are created using our SQL generator script.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingSupabase}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition border border-neutral-700 cursor-pointer"
            >
              {isTestingSupabase ? 'Testing Ping...' : 'Test Connection'}
            </button>

            <button
              type="button"
              onClick={handleSaveSupabaseConfig}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg flex items-center space-x-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Save & Connect Supabase</span>
            </button>
          </div>
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

      {/* Supabase SQL Setup Script Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 text-white rounded-3xl max-w-2xl w-full p-6 border border-neutral-800 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-rose-400" />
                <h3 className="font-serif font-black text-lg text-white">Supabase SQL Schema Generator</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Copy this SQL script and paste it in your <strong>Supabase Dashboard → SQL Editor → Run</strong> to create all tables (products, orders, profiles, etc.) automatically:
            </p>

            <div className="relative flex-1 min-h-0 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 font-mono text-[11px] text-emerald-400 overflow-y-auto">
              <pre>{sqlSetupScript}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard/project/_/sql"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Go to Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={copySqlScript}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
