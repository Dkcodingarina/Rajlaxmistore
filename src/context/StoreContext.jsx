import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import storageService from '../services/storageService';
import settingsService from '../services/settingsService';
import festivalService from '../services/festivalService';
import authService from '../services/authService';
import couponService from '../services/couponService';
import wishlistService from '../services/wishlistService';
import dataProvider from '../providers/dataProvider';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Ensure storage is seeded on initial boot and sync with Supabase
  useEffect(() => {
    storageService.initStorage();
    if (dataProvider?.syncAllFromSupabase) {
      dataProvider.syncAllFromSupabase().then(() => {
        setStoreSettings(settingsService.getSettings());
        setActiveFestival(festivalService.getActiveFestival());
      });
    }
  }, []);

  // App State
  const [storeSettings, setStoreSettings] = useState(() => settingsService.getSettings());
  const [activeFestival, setActiveFestival] = useState(() => festivalService.getActiveFestival());
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    const handleSettingsUpdate = (e) => {
      if (e.detail) {
        setStoreSettings(e.detail);
      } else {
        setStoreSettings(settingsService.getSettings());
      }
    };

    const handleFestivalUpdate = (e) => {
      const fest = e.detail !== undefined ? e.detail : festivalService.getActiveFestival();
      setActiveFestival(fest);
      setCatalogVersion(v => v + 1);
    };

    const handleCatalogUpdate = () => {
      setCatalogVersion(v => v + 1);
      setActiveFestival(festivalService.getActiveFestival());
      setStoreSettings(settingsService.getSettings());
    };

    window.addEventListener('store_settings_updated', handleSettingsUpdate);
    window.addEventListener('store_festival_updated', handleFestivalUpdate);
    window.addEventListener('store_catalog_updated', handleCatalogUpdate);

    return () => {
      window.removeEventListener('store_settings_updated', handleSettingsUpdate);
      window.removeEventListener('store_festival_updated', handleFestivalUpdate);
      window.removeEventListener('store_catalog_updated', handleCatalogUpdate);
    };
  }, []);

  useEffect(() => {
    if (storeSettings?.storeName) {
      document.title = `${storeSettings.storeName} | ${storeSettings.tagline || 'Cosmetic & Stationery'}`;
    }
  }, [storeSettings]);

  // Routing / View State
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('mode=reset-password')) {
        return 'auth';
      }
      if (hash.includes('type=signup') || hash.includes('type=email') || search.includes('mode=verified-success')) {
        return 'auth';
      }
    }
    // Always default to customer website on load
    return 'home';
  }); // 'home', 'products', 'category', 'festival', 'product', 'cart', 'checkout', 'my-orders', 'cms', 'admin', 'auth'
  const [viewParams, setViewParams] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('mode=reset-password')) {
        return { mode: 'reset-password' };
      }
      if (hash.includes('type=signup') || hash.includes('type=email') || search.includes('mode=verified-success')) {
        return { mode: 'verified-success' };
      }
    }
    return {};
  });

  const getCartKey = (u) => u ? `cart_${u.id || u.email}` : 'cart_guest';

  // Shopping Cart State - user scoped
  const [cart, setCart] = useState(() => {
    const activeUser = authService.getCurrentUser();
    return storage.get(getCartKey(activeUser), []);
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Wishlist State - user scoped
  const [wishlist, setWishlist] = useState(() => {
    const activeUser = authService.getCurrentUser();
    const userId = activeUser ? (activeUser.id || activeUser.email) : 'guest';
    return wishlistService.getWishlist(userId) || [];
  });

  // Re-sync cart & wishlist whenever active user changes (e.g. login/logout)
  useEffect(() => {
    const cartKey = getCartKey(user);
    setCart(storage.get(cartKey, []));
    setAppliedCoupon(null);
    setCouponDiscount(0);

    const userId = user ? (user.id || user.email) : 'guest';
    setWishlist(wishlistService.getWishlist(userId) || []);
  }, [user]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Toast Feedback State
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Sync settings & active festival whenever view changes or on command
  const refreshStoreMeta = () => {
    setStoreSettings(settingsService.getSettings());
    setActiveFestival(festivalService.getActiveFestival());
  };

  // Sync cart to storage for current user key
  useEffect(() => {
    const key = getCartKey(user);
    storage.set(key, cart);
  }, [cart, user]);

  // Sync wishlist to storage (user-scoped)
  useEffect(() => {
    const key = user ? `wishlist_${user.id || user.email}` : 'wishlist_guest';
    storage.set(key, wishlist);
  }, [wishlist, user]);

  // Calculate cart pricing metrics
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = (cartSubtotal >= storeSettings.freeDeliveryThreshold || cartSubtotal === 0) ? 0 : storeSettings.deliveryCharge;
  const freeDeliveryShortfall = storeSettings.freeDeliveryThreshold > cartSubtotal ? (storeSettings.freeDeliveryThreshold - cartSubtotal) : 0;
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast('Sorry, this product is currently out of stock.', 'error');
      return false;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id);
      if (existingIdx !== -1) {
        const currentQty = prev[existingIdx].quantity;
        const newQty = Math.min(currentQty + quantity, product.stock);
        if (newQty === currentQty && currentQty >= product.stock) {
          showToast(`Maximum stock limit (${product.stock}) reached for this product.`, 'error');
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        const initialQty = Math.min(quantity, product.stock);
        return [...prev, {
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          price: product.price,
          mrp: product.mrp,
          stock: product.stock,
          images: product.images,
          category: product.category,
          brand: product.brand,
          quantity: initialQty
        }];
      }
    });

    showToast(`Added "${product.name.slice(0, 28)}..." to cart!`, 'success');
    return true;
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Item removed from cart.', 'info');
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const cappedQty = Math.min(newQty, item.stock);
        if (cappedQty < newQty) {
          showToast(`Stock limit is ${item.stock} units.`, 'error');
        }
        return { ...item, quantity: cappedQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const applyCouponCode = (code) => {
    const res = couponService.validateCoupon(code, cartSubtotal, activeFestival ? activeFestival.slug : '');
    if (res.valid) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      showToast(res.message, 'success');
      return true;
    } else {
      showToast(res.message, 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon code removed.', 'info');
  };

  // Wishlist operations
  const toggleWishlist = (productId) => {
    const userId = user ? (user.id || user.email) : 'guest';
    const res = wishlistService.toggleWishlist(productId, userId);
    setWishlist(res.wishlist || []);
    if (res.isAdded) {
      showToast('Saved item to your wishlist!', 'success');
    } else {
      showToast('Removed from wishlist.', 'info');
    }
  };

  // Auth Operations
  const handleLogin = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      if (res.user.role === 'super_admin' || res.user.role === 'admin') {
        navigateTo('admin');
      } else {
        navigateTo('home');
      }
      return res;
    } else {
      showToast(res.message, 'error');
      return res;
    }
  };

  const handleRegister = async (name, email, phone, password, address) => {
    const res = await authService.register(name, email, phone, password, address);
    if (res.success) {
      showToast('Verification link sent to your email address!', 'info');
      return res;
    } else {
      showToast(res.message, 'error');
      return res;
    }
  };

  const handleVerifyEmail = async (tokenOrEmail) => {
    const res = await authService.verifyEmailToken(tokenOrEmail);
    if (res.success) {
      showToast('Email verified successfully! You can now sign in with your password.', 'success');
      return res;
    } else {
      showToast(res.message, 'error');
      return res;
    }
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const executeLogout = () => {
    authService.logout();
    setUser(null);
    setCart(storage.get('cart_guest', []));
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setWishlist([]);
    showToast('Logged out successfully.', 'info');
    navigateTo('home');
  };

  // Navigation Helper
  const navigateTo = (view, params = {}) => {
    if (view === 'admin') {
      const activeUser = user || authService.getCurrentUser();
      if (!activeUser || (activeUser.role !== 'super_admin' && activeUser.role !== 'admin')) {
        showToast('Admin login required. Please sign in with an admin account.', 'error');
        setCurrentView('auth');
        setViewParams({ mode: 'login', redirectAfter: 'admin' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshStoreMeta();
  };

  // Settings updater
  const updateStoreSettings = (newSettings) => {
    const updated = settingsService.updateSettings(newSettings);
    setStoreSettings(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('store_settings_updated', { detail: updated }));
    }
    return updated;
  };

  // Profile updater
  const updateUserProfile = (updatedData) => {
    if (!user) return { success: false, message: 'No user logged in' };
    const res = authService.updateProfile(user.id || user.email, updatedData);
    if (res.success) {
      setUser(res.user);
      storage.set('current_user', res.user);
      storage.set('session', res.user);
    }
    return res;
  };

  return (
    <StoreContext.Provider
      value={{
        storeSettings: {
          ...storeSettings,
          standardDeliveryFee: storeSettings.standardDeliveryFee || storeSettings.deliveryCharge || 40,
          deliveryCharge: storeSettings.deliveryCharge || storeSettings.standardDeliveryFee || 40,
        },
        updateStoreSettings,
        activeFestival,
        setActiveFestival,
        refreshStoreMeta,
        user,
        currentUser: user,
        updateUserProfile,
        login: (userData) => {
          setUser(userData);
          storage.set('current_user', userData);
        },
        handleLogin,
        handleRegister,
        handleVerifyEmail,
        handleLogout,
        currentView,
        viewParams,
        currentParams: viewParams,
        navigateTo,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartQuantity: updateQuantity,
        clearCart,
        cartSubtotal,
        deliveryCharge,
        freeDeliveryShortfall,
        grandTotal,
        appliedCoupon,
        couponDiscount,
        applyCoupon: (coupon) => {
          if (coupon && typeof coupon === 'object') {
            setAppliedCoupon(coupon);
            if (coupon.type === 'percentage') {
              const disc = Math.round((cartSubtotal * coupon.value) / 100);
              setCouponDiscount(coupon.maxDiscount ? Math.min(disc, coupon.maxDiscount) : disc);
            } else {
              setCouponDiscount(coupon.value || 0);
            }
          }
        },
        applyCouponCode,
        removeCoupon,
        wishlist,
        toggleWishlist,
        searchQuery,
        setSearchQuery,
        filterDrawerOpen,
        setFilterDrawerOpen,
        catalogVersion,
        refreshCatalog: () => setCatalogVersion(v => v + 1),
        toasts,
        showToast
      }}
    >
      {children}

      {/* Modern, safe confirmation modal replacing browser's blocked window.confirm */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 border border-neutral-200/80 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100/50 shadow-sm text-2xl font-sans">
              🚪
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-black text-xl text-neutral-900 leading-tight">
                Sign Out?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans px-2">
                Are you sure you want to end your session? You can sign back in at any time.
              </p>
            </div>
            <div className="flex gap-3 pt-2 font-sans">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  executeLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;