-- =========================================================================
-- RAJLAXMI STORE - COMPLETE ONE-CLICK SUPABASE DATABASE RESET & SEED
-- Copy ALL of this text and paste into Supabase SQL Editor, then click "RUN"!
-- =========================================================================

-- STEP 1: CLEAN / WIPE EVERYTHING IN PUBLIC SCHEMA
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- STEP 2: ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- STEP 3: CREATE TABLES

-- Profiles Table (Users & Admins)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer', -- 'customer' | 'admin' | 'super_admin'
  status TEXT DEFAULT 'active', -- 'active' | 'blocked' | 'suspended'
  address TEXT,
  city TEXT DEFAULT 'Botad',
  state TEXT DEFAULT 'Gujarat',
  pincode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Settings Table
CREATE TABLE public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  store_name TEXT DEFAULT 'Rajlaxmi Cosmetics & Stationery Store',
  phone TEXT DEFAULT '+91 98765 43210',
  whatsapp_number TEXT DEFAULT '919876543210',
  contact_email TEXT DEFAULT 'support@rajlaxmistore.com',
  store_address TEXT DEFAULT 'Station Road, Near Bus Stand, Botad, Gujarat - 364710',
  currency TEXT DEFAULT 'INR',
  free_delivery_threshold NUMERIC DEFAULT 499.00,
  standard_delivery_fee NUMERIC DEFAULT 40.00,
  announcement_text TEXT DEFAULT '🎉 Welcome to Rajlaxmi Store! Free Doorstep Express Delivery on orders above ₹499 in Botad.',
  instagram_url TEXT DEFAULT 'https://instagram.com/rajlaxmistore',
  facebook_url TEXT DEFAULT 'https://facebook.com/rajlaxmistore',
  enable_cod BOOLEAN DEFAULT true,
  enable_online_upi BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  price NUMERIC NOT NULL,
  mrp NUMERIC,
  stock INT DEFAULT 50,
  description TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  rating NUMERIC DEFAULT 4.8,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners Table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '#catalog',
  position TEXT DEFAULT 'hero',
  status TEXT DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Festivals Table
CREATE TABLE public.festivals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_text TEXT,
  theme_color TEXT DEFAULT '#be123c',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons Table
CREATE TABLE public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'percentage', -- 'percentage' | 'fixed'
  value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_discount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'COD', -- 'COD' | 'UPI'
  payment_status TEXT DEFAULT 'Pending', -- 'Pending' | 'Paid' | 'Failed'
  status TEXT DEFAULT 'Processing', -- 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  tracking_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets Table
CREATE TABLE public.support_tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Open', -- 'Open' | 'In Progress' | 'Resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Notifications Table
CREATE TABLE public.push_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT DEFAULT 'all',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  target TEXT,
  details TEXT,
  admin_email TEXT DEFAULT 'admin@rajlaxmistore.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public READ/WRITE for Storefront & Admin Operations
CREATE POLICY "Public Read Settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public Manage Settings" ON public.store_settings FOR ALL USING (true);

CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Manage Categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Manage Products" ON public.products FOR ALL USING (true);

CREATE POLICY "Public Read Banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Public Manage Banners" ON public.banners FOR ALL USING (true);

CREATE POLICY "Public Read Festivals" ON public.festivals FOR SELECT USING (true);
CREATE POLICY "Public Manage Festivals" ON public.festivals FOR ALL USING (true);

CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Public Manage Coupons" ON public.coupons FOR ALL USING (true);

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Manage Profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Manage Orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Manage Reviews" ON public.reviews FOR ALL USING (true);

CREATE POLICY "Public Read Support" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Public Manage Support" ON public.support_tickets FOR ALL USING (true);

CREATE POLICY "Public Read Notifications" ON public.push_notifications FOR SELECT USING (true);
CREATE POLICY "Public Manage Notifications" ON public.push_notifications FOR ALL USING (true);

CREATE POLICY "Public Read Audit" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Manage Audit" ON public.audit_logs FOR ALL USING (true);


-- STEP 5: INSERT SEED DATA FOR FRESH DATABASE

-- 1. Store Settings
INSERT INTO public.store_settings (id, store_name, whatsapp_number, free_delivery_threshold, standard_delivery_fee, announcement_text, store_address, contact_email)
VALUES (
  'main',
  'Rajlaxmi Cosmetics & Stationery Store',
  '919876543210',
  499.00,
  40.00,
  '🎉 Welcome to Rajlaxmi Store! Free Doorstep Express Delivery on orders above ₹499 in Botad & Keshod.',
  'Station Road, Near Bus Stand, Botad, Gujarat 364710',
  'support@rajlaxmistore.com'
);

-- 2. Categories
INSERT INTO public.categories (id, name, slug, description, image_url, status, sort_order)
VALUES
  ('cat-1', 'Cosmetics & Makeup', 'cosmetics-makeup', 'Premium lipsticks, foundations, eyeliners & nail polishes', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80', 'active', 1),
  ('cat-2', 'Stationery & Office', 'stationery-office', 'High quality notebooks, premium pens, files & desk items', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80', 'active', 2),
  ('cat-3', 'Skincare & Bodycare', 'skincare-bodycare', 'Herbal face washes, moisturizing creams & sunscreens', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80', 'active', 3),
  ('cat-4', 'Gift Hampers & Combos', 'gift-hampers-combos', 'Curated luxury hampers for festivals, birthdays & weddings', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80', 'active', 4),
  ('cat-5', 'School & Art Supplies', 'school-art-supplies', 'Acrylic paints, drawing pads, geometry boxes & craft sets', 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80', 'active', 5),
  ('cat-6', 'Perfumes & Deodorants', 'perfumes-deodorants', 'Long-lasting fragrances, body mists & luxury perfumes', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80', 'active', 6);

-- 3. Products
INSERT INTO public.products (id, sku, name, category, brand, price, mrp, stock, description, image_url, featured, bestseller, status, rating, reviews_count)
VALUES
  (
    'prod-1', 'SKU-LIP-01', 'Matte Velvet Liquid Lipstick Set (Pack of 4)',
    'Cosmetics & Makeup', 'Lakme', 599.00, 899.00, 45,
    'Non-transfer long-lasting matte finish liquid lipsticks enriched with Vitamin E. Water-resistant formula.',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
    true, true, 'active', 4.9, 84
  ),
  (
    'prod-2', 'SKU-NOT-02', 'Premium Hardbound Leatherette A5 Journal Notebook',
    'Stationery & Office', 'Classmate', 299.00, 450.00, 120,
    '80 GSM bleed-proof ivory paper, bookmark ribbon, pen holder loop, and elastic closure band.',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    true, false, 'active', 4.8, 56
  ),
  (
    'prod-3', 'SKU-FAC-03', 'Organic Neem & Aloe Vera Deep Cleansing Face Wash (150ml)',
    'Skincare & Bodycare', 'Himalaya', 199.00, 275.00, 80,
    'Sulfate-free gentle gel cleanser preventing acne, pimples, and oil accumulation. Suitable for all skin types.',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    false, true, 'active', 4.7, 112
  ),
  (
    'prod-4', 'SKU-PEN-04', 'Luxury Executive Metallic Rollerball Gel Pen',
    'Stationery & Office', 'Parker', 349.00, 499.00, 60,
    'Ergonomic brass body with 0.5mm Swiss tungsten carbide tip for ultra-smooth fluid writing.',
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
    true, false, 'active', 4.9, 42
  ),
  (
    'prod-5', 'SKU-FND-05', 'HD Radiant Full Coverage Liquid Foundation (30ml)',
    'Cosmetics & Makeup', 'Maybelline', 449.00, 699.00, 35,
    'Oil-free lightweight liquid foundation with SPF 20 protection giving flawless 24-hour coverage.',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    false, true, 'active', 4.8, 98
  ),
  (
    'prod-6', 'SKU-ART-06', 'Professional Artist Acrylic Color Paint Set (24 Shades)',
    'School & Art Supplies', 'Faber-Castell', 499.00, 750.00, 40,
    'High pigment density fast-drying acrylic tubes suitable for canvas, wood, paper, and ceramic painting.',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
    true, false, 'active', 4.9, 64
  ),
  (
    'prod-7', 'SKU-HAM-07', 'Royal Festival Celebration Beauty & Wellness Hamper',
    'Gift Hampers & Combos', 'Rajlaxmi Special', 1299.00, 1999.00, 25,
    'Exquisite handcrafted gift basket containing luxury body mist, lip butter, herbal soap, and scented candle.',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    true, true, 'active', 5.0, 38
  ),
  (
    'prod-8', 'SKU-PRF-08', 'French Lavender Eau de Parfum Spray (100ml)',
    'Perfumes & Deodorants', 'Fogg', 799.00, 1299.00, 50,
    'Long-lasting soothing floral aroma crafted with organic French lavender oil extracts.',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    false, true, 'active', 4.8, 77
  );

-- 4. Banners
INSERT INTO public.banners (title, subtitle, image_url, link_url, position, status, sort_order)
VALUES
  ('Festive Glamour & Elegance Collection', 'Get up to 40% OFF on Premium Cosmetic Sets & International Makeup Brands', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&auto=format&fit=crop&q=80', '#catalog', 'hero', 'active', 1),
  ('Premium Stationery & Office Essentials', 'Classmate, Parker & Faber-Castell Supplies at Wholesale Rates', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=1600&auto=format&fit=crop&q=80', '#catalog', 'hero', 'active', 2),
  ('Exclusive Festive Gift Hampers', 'Beautifully Packaged Beauty & Stationery Combo Hampers for Every Occasion', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&auto=format&fit=crop&q=80', '#catalog', 'hero', 'active', 3);

-- 5. Festivals
INSERT INTO public.festivals (id, name, slug, description, discount_text, theme_color, status)
VALUES
  ('fest-diwali', 'Diwali Dhamaka Sale', 'diwali-dhamaka', 'Special Festive Offers & Gift Boxes for Diwali Celebrations!', 'FLAT 25% OFF', '#be123c', 'active'),
  ('fest-navratri', 'Navratri Special Glam', 'navratri-glam', 'Waterproof long-lasting makeup & bright festive accessories!', 'UP TO 40% OFF', '#d97706', 'active'),
  ('fest-wedding', 'Wedding Season Gift Combos', 'wedding-gifts', 'Handcrafted royal cosmetics & fragrance gift hampers!', 'SPECIAL BUNDLE DISCOUNTS', '#7c3aed', 'active');

-- 6. Coupons
INSERT INTO public.coupons (id, code, type, value, min_order, max_discount, status, description)
VALUES
  ('coup-1', 'WELCOME10', 'percentage', 10.00, 299.00, 100.00, 'active', '10% Instant Discount on your first order'),
  ('coup-2', 'FESTIVE15', 'percentage', 15.00, 999.00, 250.00, 'active', '15% Discount on Festive Gift Hampers & Cosmetics'),
  ('coup-3', 'RAJLAXMI50', 'fixed', 50.00, 499.00, 50.00, 'active', 'Flat ₹50 OFF on orders above ₹499');
