import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  PartyPopper,
  Menu,
  Store
} from 'lucide-react';

export default function AdminMobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  pendingOrdersCount = 0,
  lowStockCount = 0,
  onViewStorefront
}) {
  const isOrdersActive = activeTab === 'orders';
  const isProductsActive = activeTab === 'products' || activeTab === 'inventory';
  const isCampaignsActive = activeTab === 'campaigns';
  const isDashboardActive = activeTab === 'dashboard';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 px-1 pt-1 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-5 text-center items-center">
        
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] ${
            isDashboardActive
              ? 'text-rose-400 font-extrabold'
              : 'text-neutral-400 hover:text-white active:scale-95'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 mb-0.5 transition-transform ${isDashboardActive ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Overview</span>
          {isDashboardActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>}
        </button>

        {/* 2. Orders with Badge */}
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] relative ${
            isOrdersActive
              ? 'text-rose-400 font-extrabold'
              : 'text-neutral-400 hover:text-white active:scale-95'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 mb-0.5 transition-transform ${isOrdersActive ? 'scale-110' : ''}`} />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-neutral-950 font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Orders</span>
          {isOrdersActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>}
        </button>

        {/* 3. Products Catalog */}
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] relative ${
            isProductsActive
              ? 'text-rose-400 font-extrabold'
              : 'text-neutral-400 hover:text-white active:scale-95'
          }`}
        >
          <div className="relative">
            <Package className={`w-5 h-5 mb-0.5 transition-transform ${isProductsActive ? 'scale-110' : ''}`} />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Products</span>
          {isProductsActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>}
        </button>

        {/* 4. Campaigns & Festival Drops */}
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] ${
            isCampaignsActive
              ? 'text-rose-400 font-extrabold'
              : 'text-neutral-400 hover:text-white active:scale-95'
          }`}
        >
          <PartyPopper className={`w-5 h-5 mb-0.5 transition-transform ${isCampaignsActive ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Festivals</span>
          {isCampaignsActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>}
        </button>

        {/* 5. Menu / All Modules */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] text-neutral-400 hover:text-white active:scale-95"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">All Menu</span>
        </button>

      </div>
    </div>
  );
}
