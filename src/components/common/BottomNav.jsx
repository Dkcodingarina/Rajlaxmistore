import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Grid, PartyPopper, ShoppingCart, User, ShieldCheck } from 'lucide-react';

export default function BottomNav() {
  const { currentView, navigateTo, cart, activeFestival, user } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isHomeActive = currentView === 'home';
  const isExploreActive = currentView === 'products' || currentView === 'category';
  const isFestivalActive = currentView === 'festival';
  const isCartActive = currentView === 'cart' || currentView === 'checkout';
  const isAccountActive = currentView === 'my-orders' || currentView === 'auth' || currentView === 'admin';

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/90 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none"
    >
      <div className="grid grid-cols-5 text-center items-center">
        
        {/* 1. Home */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] ${
            isHomeActive
              ? 'text-rose-700 font-black'
              : 'text-neutral-500 hover:text-neutral-900 active:scale-95'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 transition-transform ${isHomeActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
          {isHomeActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5"></span>}
        </button>

        {/* 2. Explore Catalog */}
        <button
          onClick={() => navigateTo('products')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] ${
            isExploreActive
              ? 'text-rose-700 font-black'
              : 'text-neutral-500 hover:text-neutral-900 active:scale-95'
          }`}
        >
          <Grid className={`w-5 h-5 mb-0.5 transition-transform ${isExploreActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Explore</span>
          {isExploreActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5"></span>}
        </button>

        {/* 3. Festival Offers */}
        <button
          onClick={() => {
            if (activeFestival) {
              navigateTo('festival', { festivalSlug: activeFestival.slug });
            } else {
              navigateTo('products', { tag: 'festive' });
            }
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] relative ${
            isFestivalActive
              ? 'text-rose-700 font-black'
              : 'text-rose-600 hover:text-rose-800 active:scale-95'
          }`}
        >
          <div className="relative">
            <PartyPopper className={`w-5 h-5 mb-0.5 transition-transform ${isFestivalActive ? 'scale-110' : 'animate-bounce'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <span className="text-[10px] font-bold truncate max-w-[58px] tracking-tight">
            {activeFestival ? activeFestival.name.split(' ')[0] : 'Festive'}
          </span>
          {isFestivalActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5"></span>}
        </button>

        {/* 4. Cart with Badge */}
        <button
          onClick={() => navigateTo('cart')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] relative ${
            isCartActive
              ? 'text-rose-700 font-black'
              : 'text-neutral-500 hover:text-neutral-900 active:scale-95'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 mb-0.5 transition-transform ${isCartActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
          {isCartActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5"></span>}
        </button>

        {/* 5. Account / Orders / Admin */}
        <button
          onClick={() => {
            if (user) {
              if (user.role === 'super_admin' || user.role === 'admin') navigateTo('admin');
              else navigateTo('my-orders');
            } else {
              navigateTo('auth');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[48px] ${
            isAccountActive
              ? 'text-rose-700 font-black'
              : 'text-neutral-500 hover:text-neutral-900 active:scale-95'
          }`}
        >
          {user && (user.role === 'super_admin' || user.role === 'admin') ? (
            <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-600" />
          ) : (
            <User className={`w-5 h-5 mb-0.5 transition-transform ${isAccountActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
          )}
          <span className="text-[10px] tracking-tight">
            {user ? ((user.role === 'super_admin' || user.role === 'admin') ? 'Admin' : 'Account') : 'Login'}
          </span>
          {isAccountActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5"></span>}
        </button>

      </div>
    </nav>
  );
}
