import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  PartyPopper,
  Tag,
  Star,
  LifeBuoy,
  Bell,
  Users,
  History,
  Settings,
  ExternalLink,
  Store,
  ChevronRight,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onViewStorefront,
  pendingOrdersCount = 0,
  unreadTicketsCount = 0,
  lowStockCount = 0,
  storeSettings
}) {
  const navItems = [
    {
      group: 'OVERVIEW & ANALYTICS',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: null }
      ]
    },
    {
      group: 'CAMPAIGNS & FESTIVALS',
      items: [
        { id: 'campaigns', label: 'Festival & Seasonal Drops', icon: PartyPopper, badge: null }
      ]
    },
    {
      group: 'CATALOG & INVENTORY',
      items: [
        { id: 'products', label: 'Product Catalog & SKUs', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} Low` : null, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
        { id: 'categories', label: 'Category Hierarchy', icon: Layers, badge: null },
        { id: 'inventory', label: 'Quick Stock Control', icon: Zap, badge: null }
      ]
    },
    {
      group: 'COMMERCE & LOGISTICS',
      items: [
        { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null, badgeColor: 'bg-rose-500 text-white' },
        { id: 'coupons', label: 'Coupons & Promos', icon: Tag, badge: null }
      ]
    },
    {
      group: 'CUSTOMER & BRAND RELATIONS',
      items: [
        { id: 'reviews', label: 'Reviews Moderation', icon: Star, badge: null },
        { id: 'support', label: 'Customer Helpdesk & Support', icon: LifeBuoy, badge: unreadTicketsCount > 0 ? `${unreadTicketsCount}` : null, badgeColor: 'bg-emerald-500 text-white' },
        { id: 'push_studio', label: 'Push Broadcast Studio', icon: Bell, badge: 'New' },
        { id: 'customers', label: 'Customer Directory', icon: Users, badge: null }
      ]
    },
    {
      group: 'SYSTEM & GOVERNANCE',
      items: [
        { id: 'audit_logs', label: 'Audit Activity Logs', icon: History, badge: null },
        { id: 'settings', label: 'Store Settings', icon: Settings, badge: null }
      ]
    }
  ];

  const handleItemClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-neutral-900 border-r border-neutral-800 text-neutral-200 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/50">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600 flex items-center justify-center text-white font-serif font-black shadow-lg shadow-rose-900/30 shrink-0 ring-2 ring-rose-500/20">
              {(storeSettings?.storeName || 'Rajlaxmi').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-black text-sm text-white tracking-wide truncate flex items-center gap-1.5">
                  {storeSettings?.storeName || 'Rajlaxmi Store'}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-sans font-bold border border-amber-500/30">
                    CMS
                  </span>
                </span>
                <span className="text-[11px] text-neutral-400 font-mono truncate">
                  Enterprise Control Hub
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6 custom-scrollbar">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase mb-2">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'justify-between px-3'
                    } py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30 font-semibold shadow-sm'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-rose-400' : 'text-neutral-400 group-hover:text-neutral-200'
                        }`}
                      />
                      {!collapsed && <span className="truncate text-xs">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-tight shrink-0 border ${
                          item.badgeColor || 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/60 space-y-2">
          <button
            onClick={onViewStorefront}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 hover:text-white text-xs font-semibold border border-neutral-700/60 transition cursor-pointer"
            title="Open Live Public Storefront"
          >
            <Store className="w-4 h-4 text-emerald-400 shrink-0" />
            {!collapsed && <span>View Storefront</span>}
            {!collapsed && <ExternalLink className="w-3 h-3 text-neutral-400 ml-auto" />}
          </button>
        </div>
      </aside>
    </>
  );
}
