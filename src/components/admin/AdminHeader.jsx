import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Store,
  ExternalLink,
  User,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  LifeBuoy,
  X
} from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';

export default function AdminHeader({
  currentUser,
  onLogout,
  onNavigateStore,
  collapsed,
  setCollapsed,
  setMobileOpen,
  searchQuery,
  setSearchQuery,
  onSelectSearchItem,
  storeSettings,
  onNavigateTab,
  showToast
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left items */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
        {/* Toggle mobile sidebar */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Toggle desktop sidebar collapse */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Admin Quick Search */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, products, customers, SKUs, campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-xs text-neutral-900 rounded-xl border border-neutral-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Switch to Storefront Button */}
        <button
          type="button"
          onClick={onNavigateStore}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-semibold border border-neutral-200 transition cursor-pointer"
        >
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Store</span>
          <ExternalLink className="w-3 h-3 text-neutral-400" />
        </button>

        {/* Fully functional Notification Bell Dropdown */}
        <NotificationDropdown
          role="admin"
          onNavigate={onNavigateTab}
          showToast={showToast}
        />

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-amber-400 font-bold text-xs flex items-center justify-center ring-2 ring-neutral-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-neutral-900 leading-tight truncate max-w-[120px]">
                {currentUser?.name || 'Store Owner'}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Super Admin
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-neutral-100">
                <p className="text-xs font-bold text-neutral-900">{currentUser?.name || 'Store Owner'}</p>
                <p className="text-[11px] text-neutral-500 font-mono truncate">{currentUser?.email || 'admin@rajlaxmistore.com'}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={onNavigateStore}
                  className="w-full px-4 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-neutral-400" />
                  <span>View Customer Store</span>
                </button>
              </div>

              <div className="pt-1 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out of Suite</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
