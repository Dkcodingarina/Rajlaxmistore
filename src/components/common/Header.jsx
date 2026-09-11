import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Sparkles,
  PartyPopper,
  ShieldCheck,
  Menu,
  X,
  PhoneCall,
  ChevronDown,
  LayoutDashboard,
  Package,
  MessageCircle,
  LogOut
} from 'lucide-react';
import categoryService from '../../services/categoryService';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  const {
    storeSettings,
    activeFestival,
    user,
    cart,
    wishlist,
    currentView,
    viewParams,
    navigateTo,
    searchQuery,
    setSearchQuery,
    handleLogout,
    showToast
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rawCategories = categoryService.getCategories();
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('products');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-900 via-neutral-900 to-rose-950 text-amber-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="flex items-center space-x-2 truncate">
            {activeFestival ? (
              <span className="inline-flex items-center space-x-1 text-rose-300 font-semibold uppercase tracking-wider">
                <PartyPopper className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>{activeFestival.name}:</span>
              </span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="truncate">{activeFestival ? activeFestival.discountText : storeSettings.announcementBar}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-4 shrink-0 text-neutral-300">
            <button
              onClick={() => {
                if (user) {
                  navigateTo('my-orders', { tab: 'support' });
                } else {
                  document.getElementById('btn_support_widget')?.click();
                }
              }}
              className="hover:text-amber-300 flex items-center space-x-1 transition-colors text-[11px] font-bold cursor-pointer"
            >
              <span>💬</span>
              <span>Help Desk / Raise Query</span>
            </button>
            <a
              href={`https://wa.me/${storeSettings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 flex items-center space-x-1 transition-colors"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Support: {storeSettings.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 shrink-0 max-w-[200px] sm:max-w-[240px] md:max-w-[280px]">
            <button
              onClick={() => navigateTo('home')}
              className="text-left group flex items-center space-x-2.5 focus:outline-hidden min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600 flex items-center justify-center text-white font-serif font-black text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                {(storeSettings?.storeName || 'Rajlaxmi').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 overflow-hidden">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-neutral-900 leading-tight tracking-tight uppercase truncate">
                  {storeSettings?.storeName || 'Rajlaxmi Store'}
                </h1>
                <p 
                  className="text-[10px] sm:text-xs text-rose-700 font-semibold tracking-wider uppercase truncate"
                  title={storeSettings?.tagline || 'Cosmetic & Stationery'}
                >
                  {storeSettings?.tagline || 'Cosmetic & Stationery'}
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 min-w-[260px] lg:min-w-[340px] max-w-xl relative"
          >
            <input
              type="text"
              placeholder="Search cosmetics, lipstick, notebooks, gel pens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 bg-neutral-100 hover:bg-neutral-50 focus:bg-white text-sm rounded-full border border-neutral-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 transition-all outline-hidden"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-full transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
            {/* Active Festival Quick Link */}
            {activeFestival && (
              <button
                onClick={() => navigateTo('festival', { festivalSlug: activeFestival.slug })}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                <PartyPopper className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>{activeFestival.name}</span>
              </button>
            )}

            {/* Notifications Bell Dropdown */}
            <NotificationDropdown
              role={user && (user.role === 'super_admin' || user.role === 'admin') ? 'admin' : 'customer'}
              onNavigate={(view, params) => navigateTo(view, params)}
              showToast={showToast}
            />

            {/* Wishlist */}
            <button
              onClick={() => navigateTo('wishlist')}
              className="relative p-2 text-neutral-700 hover:text-rose-600 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigateTo('cart')}
              className="relative p-2 text-neutral-700 hover:text-rose-600 rounded-full hover:bg-neutral-100 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer Account / Login */}
            {user ? (
              <div className="relative group">
                <button
                  onClick={() => navigateTo('my-orders')}
                  className="flex items-center space-x-1.5 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center border border-rose-300">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium max-w-[90px] truncate">
                    {user?.name ? user.name.split(' ')[0] : (user?.email?.split('@')[0] || 'User')}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-500 hidden sm:inline" />
                </button>

                {/* Professional Account Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200/80 py-2 hidden group-hover:block z-50 transition-all">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-rose-50 to-amber-50/50 border-b border-neutral-100">
                    <p className="text-xs font-black text-neutral-900 truncate">{user?.name || user?.email || 'Valued Customer'}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{user?.email || user?.phone || ''}</p>
                  </div>

                  <div className="py-1">
                    {user.role === 'super_admin' || user.role === 'admin' ? (
                      <button
                        onClick={() => navigateTo('admin')}
                        className="w-full text-left px-4 py-2 text-xs text-amber-800 font-extrabold hover:bg-amber-50 flex items-center space-x-2.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Admin Control Panel</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => navigateTo('my-orders', { tab: 'profile' })}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-rose-50 hover:text-rose-700 font-bold flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-neutral-400" />
                      <span>My Profile & Account</span>
                    </button>

                    <button
                      onClick={() => navigateTo('my-orders', { tab: 'orders' })}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-rose-50 hover:text-rose-700 font-bold flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-neutral-400" />
                      <span>My Orders & Tracking</span>
                    </button>

                    <button
                      onClick={() => navigateTo('my-orders', { tab: 'support' })}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-rose-50 hover:text-rose-700 font-bold flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      <span>Help & Support Hub</span>
                    </button>

                    <button
                      onClick={() => navigateTo('my-orders', { tab: 'wishlist' })}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-rose-50 hover:text-rose-700 font-bold flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span>Saved Wishlist ({wishlist?.length || 0})</span>
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigateTo('auth')}
                className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-2 md:hidden relative"
        >
          <input
            type="text"
            placeholder="Search cosmetics, stationery, gift hampers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-16 py-2 bg-neutral-100 text-xs rounded-full border border-neutral-300 focus:border-rose-600 focus:bg-white outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-rose-600 text-white font-medium text-[11px] rounded-full"
          >
            Find
          </button>
        </form>
      </div>

      {/* Category Navigation Bar - Desktop */}
      <nav className="hidden md:block bg-neutral-900 text-neutral-200 text-xs font-medium border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center space-x-6 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => navigateTo('home')}
            className={`shrink-0 hover:text-amber-300 transition-colors ${currentView === 'home' ? 'text-amber-400 font-bold' : ''}`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigateTo('category', { categorySlug: cat.slug })}
              className={`shrink-0 hover:text-amber-300 transition-colors ${
                currentView === 'category' && viewParams?.categorySlug === cat.slug ? 'text-amber-400 font-bold' : ''
              }`}
            >
              {cat.name}
            </button>
          ))}
          {activeFestival && (
            <button
              onClick={() => navigateTo('festival', { festivalSlug: activeFestival.slug })}
              className="shrink-0 text-rose-400 font-bold flex items-center space-x-1 hover:text-rose-300 ml-auto"
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeFestival.name} Collection</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 py-3 space-y-3 shadow-xl">
          <div className="font-semibold text-xs text-neutral-400 uppercase tracking-wider">Browse Categories</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}
              className="text-left py-1.5 px-2 rounded bg-neutral-50 hover:bg-rose-50 hover:text-rose-700 font-medium"
            >
              🏠 All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  navigateTo('category', { categorySlug: cat.slug });
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 px-2 rounded bg-neutral-50 hover:bg-rose-50 hover:text-rose-700 font-medium truncate"
              >
                {cat.name}
              </button>
            ))}
          </div>

          {activeFestival && (
            <div className="pt-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  navigateTo('festival', { festivalSlug: activeFestival.slug });
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
              >
                <PartyPopper className="w-4 h-4" />
                <span>{activeFestival.name} Special Store</span>
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-neutral-100">
            <button
              onClick={() => {
                document.getElementById('btn_support_widget')?.click();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <span>💬</span>
              <span>Need Help? Raise Support Ticket</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
