import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import orderService from '../../services/orderService';
import supportService from '../../services/supportService';
import productService from '../../services/productService';
import pushService from '../../services/pushService';
import {
  Package,
  MessageCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Edit3,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Heart,
  LogOut,
  Search,
  Filter,
  Clock,
  Lock,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  LifeBuoy,
  Plus,
  Send,
  Building,
  Navigation,
  CheckCircle2,
  Trash2,
  X,
  Bell,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ChevronDown,
  Check,
  Smartphone,
  ShieldAlert
} from 'lucide-react';

export default function MyOrdersView() {
  const {
    currentUser,
    storeSettings,
    navigateTo,
    currentParams,
    viewParams,
    updateUserProfile,
    showToast,
    handleLogout,
    wishlist,
    toggleWishlist,
    addToCart
  } = useStore();

  const initialTab = currentParams?.tab || viewParams?.tab || 'orders';
  // Active Tab state: 'orders' | 'profile' | 'addresses' | 'security' | 'support' | 'wishlist'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync activeTab whenever route parameters change
  useEffect(() => {
    const navTab = currentParams?.tab || viewParams?.tab;
    if (navTab && ['orders', 'profile', 'addresses', 'security', 'support', 'wishlist'].includes(navTab)) {
      setActiveTab(navTab);
    }
  }, [currentParams, viewParams]);

  // Orders State & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    altPhone: currentUser?.altPhone || '',
    email: currentUser?.email || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    pincode: currentUser?.pincode || '',
    state: currentUser?.state || '',
    landmark: currentUser?.landmark || ''
  });

  // Password Update State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Promotional Web Push Notifications State
  const [promoPushEnabled, setPromoPushEnabled] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      pushService.isUserPromotionalPushEnabled(currentUser.id).then((enabled) => {
        setPromoPushEnabled(enabled);
      });
    }
  }, [currentUser]);

  const handleTogglePromoPush = async () => {
    const nextState = !promoPushEnabled;
    setPromoPushEnabled(nextState);

    if (nextState && pushService.getPermissionState() !== 'granted') {
      const subRes = await pushService.subscribeUserToPush(currentUser?.id);
      if (!subRes.success) {
        showToast(subRes.error || 'Browser notification permission required.', 'error');
        setPromoPushEnabled(false);
        return;
      }
    }

    await pushService.togglePromotionalNotifications(currentUser?.id, nextState);
    showToast(
      nextState
        ? '🔔 Promotional push notifications turned ON for your device.'
        : '🔕 Promotional push notifications turned OFF. (Order alerts remain active).',
      nextState ? 'success' : 'info'
    );
  };

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [followupText, setFollowupText] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    category: 'Delivery Update',
    orderNumber: '',
    message: ''
  });

  // Sync profile form when user updates
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        altPhone: currentUser.altPhone || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        pincode: currentUser.pincode || '',
        state: currentUser.state || '',
        landmark: currentUser.landmark || ''
      });
      refreshTickets();
    }
  }, [currentUser]);

  const refreshTickets = () => {
    if (currentUser) {
      const tickets = supportService.getTicketsByCustomer(currentUser.email || currentUser.phone);
      setSupportTickets(tickets);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-8 sm:my-16 px-4 text-center">
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-neutral-200/80 shadow-xl space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
            <User className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-black text-2xl text-neutral-900">Welcome to {storeSettings?.storeName || 'Our Store'}</h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xs mx-auto leading-relaxed">
              Please sign in or register to access your personal profile, track orders in real-time, and manage saved addresses.
            </p>
          </div>
          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => navigateTo('auth', { mode: 'register' })}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Create New Account</span>
            </button>
            <button
              onClick={() => navigateTo('auth', { mode: 'login' })}
              className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              Already Have an Account? Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get User Orders
  const userOrders = orderService.getOrdersByCustomer(currentUser);

  // Filter Orders
  const filteredOrders = userOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();
    const searchLower = orderSearch.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      (order.id || '').toLowerCase().includes(searchLower) ||
      (order.orderNumber || '').toLowerCase().includes(searchLower) ||
      (order.items || []).some(item => (item.name || '').toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  // Calculate Total Spent
  const totalSpent = userOrders.reduce((sum, o) => {
    if (o.status !== 'cancelled') {
      return sum + (Number(o.totalAmount || o.total) || 0);
    }
    return sum;
  }, 0);

  // Wishlist Products
  const allProducts = productService.getProducts({ includeInactive: true });
  const wishlistedProducts = allProducts.filter(p => wishlist.includes(p.id));

  // Handle Save Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.phone.trim()) {
      showToast('Name and Phone number are required.', 'error');
      return;
    }

    const res = updateUserProfile({
      name: profileForm.name,
      phone: profileForm.phone,
      altPhone: profileForm.altPhone,
      address: profileForm.address,
      city: profileForm.city,
      pincode: profileForm.pincode,
      state: profileForm.state,
      landmark: profileForm.landmark
    });

    if (res && res.success) {
      showToast('Profile updated successfully!', 'success');
      setIsEditingProfile(false);
    } else {
      showToast('Failed to update profile.', 'error');
    }
  };

  // Handle Change Password
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    const res = updateUserProfile({
      password: passwordForm.newPassword
    });

    if (res && res.success) {
      showToast('Password changed successfully!', 'success');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast('Failed to update password.', 'error');
    }
  };

  // Handle Re-Order
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    let addedCount = 0;
    order.items.forEach(item => {
      const match = allProducts.find(p => p.id === item.id || p.name === item.name);
      if (match && match.stock > 0) {
        addToCart(match, item.quantity || 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      showToast(`Added ${addedCount} items from Order #${order.id || order.orderNumber} to cart!`, 'success');
      navigateTo('cart');
    } else {
      showToast('Items in this order are currently out of stock.', 'error');
    }
  };

  // Open Support Ticket for specific Order
  const handleRaiseOrderTicket = (order) => {
    setNewTicketForm({
      category: 'Order Status Query',
      orderNumber: order.id || order.orderNumber || '',
      message: `Hi Team, I have a query regarding my order #${order.id || order.orderNumber}. Please update me on the delivery status.`
    });
    setActiveTab('support');
    setShowNewTicketModal(true);
  };

  // Submit New Support Ticket
  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicketForm.message.trim()) {
      showToast('Please type your query message.', 'error');
      return;
    }

    const ticket = supportService.createTicket({
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone,
      category: newTicketForm.category,
      orderNumber: newTicketForm.orderNumber,
      message: newTicketForm.message
    });

    showToast(`Support Ticket #${ticket.ticketNumber} created successfully!`, 'success');
    setShowNewTicketModal(false);
    setNewTicketForm({ category: 'Delivery Update', orderNumber: '', message: '' });
    refreshTickets();
    setActiveTicketId(ticket.id);
  };

  // Send Follow-up Message in Ticket
  const handleSendFollowup = (e) => {
    e.preventDefault();
    if (!followupText.trim() || !activeTicketId) return;

    const updated = supportService.addCustomerFollowup(activeTicketId, followupText);
    if (updated) {
      showToast('Message sent to store support team!', 'success');
      setFollowupText('');
      refreshTickets();
    }
  };

  const activeTicket = supportTickets.find(t => t.id === activeTicketId) || supportTickets[0];

  // Helper for Order Status Progress Steps
  const getStatusStepIndex = (status) => {
    const st = (status || '').toLowerCase();
    if (st.includes('cancel')) return -1;
    if (st.includes('deliver')) return 4;
    if (st.includes('out')) return 3;
    if (st.includes('ship') || st.includes('pack')) return 2;
    if (st.includes('process') || st.includes('confirm')) return 1;
    return 0; // Placed
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-6">
      
      {/* ================= FLAGSHIP LUXURY PROFILE HERO CARD ================= */}
      <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-rose-950 p-4 sm:p-7 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-neutral-800/80">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-60 h-60 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
          
          {/* Avatar & Personal Identity */}
          <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 w-full sm:w-auto">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white font-serif font-black text-2xl sm:text-3xl shadow-lg border-2 border-white/25">
                {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-neutral-900 rounded-full shadow-xs" title="Active Account"></span>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-white truncate max-w-[200px] sm:max-w-md">
                  {currentUser?.name || currentUser?.email?.split('@')[0] || 'Valued Customer'}
                </h1>
                <span className="text-[10px] bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-amber-200 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{currentUser?.role === 'super_admin' ? 'Store Administrator' : 'VIP Valued Member'}</span>
                </span>
              </div>
              
              <div className="text-xs text-neutral-300 flex items-center gap-x-3 gap-y-1 flex-wrap">
                <span className="flex items-center space-x-1 truncate max-w-[220px]">
                  <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{currentUser?.email || ''}</span>
                </span>
                {currentUser?.phone && (
                  <span className="flex items-center space-x-1 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{currentUser.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <button
              onClick={() => { setActiveTab('profile'); setIsEditingProfile(true); }}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-white/15 cursor-pointer touch-manipulation min-h-[38px]"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm cursor-pointer touch-manipulation min-h-[38px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Tiles (Bento Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4 mt-4 border-t border-white/10 relative z-10 text-xs">
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`p-3 sm:p-3.5 rounded-2xl border text-left transition space-y-1 cursor-pointer touch-manipulation ${
              activeTab === 'orders'
                ? 'bg-rose-600/30 border-rose-400/50 shadow-inner'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">My Orders</span>
              <Package className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif font-black text-lg sm:text-xl text-white">{userOrders.length}</span>
              <span className="text-[10px] text-rose-300 font-bold">₹{totalSpent}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`p-3 sm:p-3.5 rounded-2xl border text-left transition space-y-1 cursor-pointer touch-manipulation ${
              activeTab === 'support'
                ? 'bg-amber-600/30 border-amber-400/50 shadow-inner'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">Support</span>
              <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif font-black text-lg sm:text-xl text-white">{supportTickets.length}</span>
              <span className="text-[10px] text-amber-300 font-bold">
                {supportTickets.filter(t => t.status === 'pending' || t.status === 'replied').length} Active
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`p-3 sm:p-3.5 rounded-2xl border text-left transition space-y-1 cursor-pointer touch-manipulation ${
              activeTab === 'wishlist'
                ? 'bg-rose-600/30 border-rose-400/50 shadow-inner'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">Wishlist</span>
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif font-black text-lg sm:text-xl text-white">{wishlist.length}</span>
              <span className="text-[10px] text-rose-300 font-bold">Saved Items</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setIsEditingProfile(true); }}
            className={`p-3 sm:p-3.5 rounded-2xl border text-left transition space-y-1 cursor-pointer touch-manipulation group ${
              activeTab === 'profile'
                ? 'bg-emerald-600/30 border-emerald-400/50 shadow-inner'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">Delivery Address</span>
              <Edit3 className="w-3 h-3 text-neutral-400 group-hover:text-amber-300 transition" />
            </div>
            <span className="font-bold text-white block truncate text-xs">
              {currentUser?.address
                ? `${currentUser.address}${currentUser.city ? `, ${currentUser.city}` : ''}`
                : (currentUser?.city || 'Add delivery address')}
            </span>
          </button>

        </div>
      </div>

      {/* ================= MODERN TAB BAR (100% MOBILE RESPONSIVE CHIPS) ================= */}
      <div className="bg-white p-1.5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-3.5 sm:px-4 rounded-xl font-bold text-xs flex items-center space-x-2 transition shrink-0 cursor-pointer touch-manipulation min-h-[42px] ${
            activeTab === 'orders'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
        >
          <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-rose-400' : 'text-rose-600'}`} />
          <span>My Orders ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2.5 px-3.5 sm:px-4 rounded-xl font-bold text-xs flex items-center space-x-2 transition shrink-0 cursor-pointer touch-manipulation min-h-[42px] ${
            activeTab === 'profile'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
        >
          <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-amber-400' : 'text-amber-600'}`} />
          <span>Personal Details</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`py-2.5 px-3.5 sm:px-4 rounded-xl font-bold text-xs flex items-center space-x-2 transition shrink-0 cursor-pointer touch-manipulation min-h-[42px] relative ${
            activeTab === 'support'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
        >
          <MessageCircle className={`w-4 h-4 ${activeTab === 'support' ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span>Help & Support</span>
          {supportTickets.filter(t => t.status === 'replied').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`py-2.5 px-3.5 sm:px-4 rounded-xl font-bold text-xs flex items-center space-x-2 transition shrink-0 cursor-pointer touch-manipulation min-h-[42px] ${
            activeTab === 'wishlist'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
          <span>Wishlist ({wishlistedProducts.length})</span>
        </button>

      </div>

      {/* ================= TAB 1: ORDER HISTORY & LIVE TRACKING ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Order Search & Filter Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order ID or item..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-0.5">
              {['all', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition shrink-0 cursor-pointer touch-manipulation min-h-[34px] ${
                    statusFilter === st
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center p-8 sm:p-12 bg-white rounded-3xl border border-neutral-200 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-black text-xl text-neutral-800">
                  {userOrders.length === 0 ? 'No Orders Placed Yet' : 'No Matching Orders Found'}
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  {userOrders.length === 0
                    ? 'Explore our cosmetics, festive gift hampers, and premium stationery products.'
                    : 'Try clearing your search query or selecting a different status filter.'}
                </p>
              </div>
              <button
                onClick={() => navigateTo('products')}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer inline-flex items-center space-x-2 touch-manipulation"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Store Catalog</span>
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const waUrl = orderService.generateWhatsAppLink(order, storeSettings.whatsappNumber);
              const stepIndex = getStatusStepIndex(order.status);
              const isCancelled = order.status?.toLowerCase() === 'cancelled';

              return (
                <div key={order.id || order.orderNumber} className="bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200/90 shadow-xs space-y-4 transition hover:border-neutral-300">
                  
                  {/* Order Top Summary Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-neutral-100 gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono font-black text-sm text-neutral-900">
                          #{order.id || order.orderNumber}
                        </span>
                        <span className="text-[10px] bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {order.paymentMethod || 'Cash on Delivery'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-neutral-500">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Placed on: {order.createdAt || new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black capitalize shadow-xs inline-flex items-center space-x-1.5 ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : order.status === 'out_for_delivery'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        <span>Status: {order.status?.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Stepper Tracker */}
                  {!isCancelled ? (
                    <div className="py-2 px-1">
                      <div className="grid grid-cols-4 gap-1 relative">
                        {['Placed', 'Processing', 'Out for Delivery', 'Delivered'].map((stepName, sIdx) => {
                          const isCompleted = stepIndex >= sIdx;
                          const isCurrent = stepIndex === sIdx;
                          return (
                            <div key={sIdx} className="flex flex-col items-center text-center space-y-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                isCompleted
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                              } ${isCurrent ? 'ring-4 ring-rose-100' : ''}`}>
                                {isCompleted ? <Check className="w-3.5 h-3.5" /> : sIdx + 1}
                              </div>
                              <span className={`text-[10px] font-bold leading-tight ${
                                isCurrent ? 'text-rose-700' : isCompleted ? 'text-neutral-800' : 'text-neutral-400'
                              }`}>
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>This order was cancelled. If you have queries or refund requests, please contact store support.</span>
                    </div>
                  )}

                  {/* Order Items Breakdown Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                      Ordered Items ({(order.items || []).length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/70">
                          <img
                            src={item.image || (Array.isArray(item.images) ? item.images[0] : null) || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-neutral-200 shrink-0 border border-neutral-200"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1 text-xs space-y-0.5">
                            <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                            <div className="flex items-center justify-between text-[11px] text-neutral-500">
                              <span>Qty: {item.quantity || 1}</span>
                              <span className="font-extrabold text-neutral-800">₹{(Number(item.price) || 0) * (item.quantity || 1)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & Action Buttons Bar */}
                  <div className="pt-3.5 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                    <div className="space-y-0.5 text-xs text-neutral-600 max-w-md">
                      <div className="flex items-start space-x-1.5">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {order.address || order.customer?.address || 'Delivery Address on Record'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-neutral-400 uppercase font-extrabold block">Grand Total</span>
                        <span className="font-serif font-black text-rose-700 text-lg">
                          ₹{order.totalAmount || order.total}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer touch-manipulation min-h-[38px]"
                          title="Re-order all items to cart"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Re-Order</span>
                        </button>

                        <button
                          onClick={() => handleRaiseOrderTicket(order)}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer touch-manipulation min-h-[38px]"
                        >
                          <LifeBuoy className="w-3.5 h-3.5" />
                          <span>Help</span>
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer touch-manipulation min-h-[38px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= TAB 2: PERSONAL DETAILS & SAVED ADDRESSES ================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          
          {/* Personal Info Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 gap-3">
              <div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-neutral-900">Personal Identity & Contact</h2>
                <p className="text-xs text-neutral-500">Your profile credentials and primary store contact details</p>
              </div>

              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer touch-manipulation min-h-[38px]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Edit Info</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer touch-manipulation"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={profileForm.name || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Primary Mobile Phone *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Email Address (Login ID)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        value={profileForm.email || ''}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-100 rounded-xl border border-neutral-200 text-neutral-500 cursor-not-allowed text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Alternative Phone (Optional)</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="Secondary mobile..."
                        value={profileForm.altPhone || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, altPhone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Street Address / House / Flat No.</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      placeholder="Enter flat/building, street address..."
                      value={profileForm.address || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">City / Town</label>
                    <input
                      type="text"
                      value={profileForm.city || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={profileForm.pincode || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">State</label>
                    <input
                      type="text"
                      value={profileForm.state || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nearby Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Temple, Opposite Bank"
                    value={profileForm.landmark || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, landmark: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer touch-manipulation min-h-[40px]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition cursor-pointer touch-manipulation"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Full Name</span>
                  <p className="font-bold text-sm text-neutral-900">{currentUser.name}</p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Primary Mobile</span>
                  <p className="font-bold text-sm text-neutral-900">{currentUser.phone || 'Not provided'}</p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Email Address</span>
                  <p className="font-bold text-sm text-neutral-900 truncate">{currentUser.email}</p>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Delivery Address</span>
                  <p className="font-medium text-neutral-800 leading-relaxed text-xs">
                    {currentUser.address || 'No address saved. Click "Edit Info" to add your delivery address.'}
                    {currentUser.city ? `, ${currentUser.city}` : ''}
                    {currentUser.pincode ? ` (${currentUser.pincode})` : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Account Security & Password Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base sm:text-lg text-neutral-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Account Security & Password</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Update your account password or credentials to keep your profile secure.
              </p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition cursor-pointer touch-manipulation min-h-[40px] shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Push Notification Preferences Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-rose-600 shrink-0" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-neutral-900">
                  Promotional Web Alerts
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Offers & Discounts
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Receive instant browser notifications for festive sales, discount coupons, and new stock arrivals.
              </p>
            </div>

            <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
              <span className={`text-xs font-black ${promoPushEnabled ? 'text-emerald-700' : 'text-neutral-400'}`}>
                {promoPushEnabled ? 'ALERTS ON' : 'ALERTS OFF'}
              </span>
              <button
                type="button"
                onClick={handleTogglePromoPush}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none touch-manipulation ${
                  promoPushEnabled ? 'bg-emerald-600' : 'bg-neutral-300'
                }`}
                role="switch"
                aria-checked={promoPushEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    promoPushEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 3: HELP & SUPPORT TICKETS ================= */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-neutral-900 flex items-center space-x-2">
                  <span>Customer Support Hub</span>
                  <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-bold">
                    {supportTickets.length} Tickets
                  </span>
                </h2>
                <p className="text-xs text-neutral-500">
                  Track help inquiries or ask store staff about orders and products
                </p>
              </div>

              <button
                onClick={() => setShowNewTicketModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer touch-manipulation min-h-[40px] shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Raise New Query</span>
              </button>
            </div>

            {supportTickets.length === 0 ? (
              <div className="text-center p-8 sm:p-10 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
                <LifeBuoy className="w-10 h-10 text-neutral-400 mx-auto" />
                <h3 className="font-serif font-black text-lg text-neutral-800">No Support Queries Raised</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Need assistance with an order, delivery timing, or product query? Click "Raise New Query" above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Tickets Selector List */}
                <div className="space-y-2 md:col-span-1">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1">
                    Your Support Tickets
                  </span>
                  <div className="space-y-2 max-h-72 md:max-h-96 overflow-y-auto pr-1">
                    {supportTickets.map((t) => {
                      const isSelected = activeTicket?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setActiveTicketId(t.id)}
                          className={`w-full p-3 rounded-2xl text-left border transition cursor-pointer flex flex-col gap-1 touch-manipulation ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                              : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold">#{t.ticketNumber || t.id.slice(0, 8)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              t.status === 'replied' || t.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.status || 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs font-bold truncate">{t.category}</p>
                          <span className="text-[10px] opacity-75">{t.createdAt?.split('T')[0] || 'Recent'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ticket Detail & Live Chat Thread */}
                <div className="md:col-span-2 bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 flex flex-col justify-between min-h-[320px]">
                  {activeTicket ? (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                          <div>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase">
                              Ticket #{activeTicket.ticketNumber || activeTicket.id.slice(0, 8)} • {activeTicket.category}
                            </span>
                            {activeTicket.orderNumber && (
                              <p className="text-xs font-bold text-neutral-700">Order Ref: #{activeTicket.orderNumber}</p>
                            )}
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                            activeTicket.status === 'replied' || activeTicket.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {activeTicket.status}
                          </span>
                        </div>

                        {/* Message Stream */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {/* Original Query */}
                          <div className="bg-white p-3 rounded-2xl border border-neutral-200 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-neutral-400">You ({currentUser.name})</span>
                            <p className="text-neutral-800">{activeTicket.message}</p>
                          </div>

                          {/* Staff Responses / Follow-ups */}
                          {(activeTicket.responses || []).map((resp, rIdx) => (
                            <div
                              key={rIdx}
                              className={`p-3 rounded-2xl text-xs space-y-1 ${
                                resp.sender === 'staff'
                                  ? 'bg-rose-50 border border-rose-200 text-rose-950 ml-4'
                                  : 'bg-white border border-neutral-200 text-neutral-800 mr-4'
                              }`}
                            >
                              <span className="text-[10px] font-bold text-neutral-400">
                                {resp.sender === 'staff' ? '🏪 Store Support Manager' : 'You'}
                              </span>
                              <p>{resp.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reply Input Form */}
                      <form onSubmit={handleSendFollowup} className="pt-3 border-t border-neutral-200 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type follow-up message..."
                          value={followupText}
                          onChange={(e) => setFollowupText(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer touch-manipulation"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-400 text-xs">
                      Select a ticket from the left to view details
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: SAVED WISHLIST ================= */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-neutral-900">Saved Wishlist Items</h2>
                <p className="text-xs text-neutral-500">Your favorite products saved for fast checkout</p>
              </div>
              <span className="text-xs bg-rose-100 text-rose-800 font-bold px-3 py-1 rounded-full">
                {wishlistedProducts.length} Items
              </span>
            </div>

            {wishlistedProducts.length === 0 ? (
              <div className="text-center p-8 sm:p-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-lg text-neutral-800">Your Wishlist is Empty</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Click the heart icon on any product in the store catalog to save it here.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('products')}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer touch-manipulation"
                >
                  Browse Store Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {wishlistedProducts.map((prod) => (
                  <div key={prod.id} className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200 flex flex-col justify-between space-y-2">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-200">
                      <img
                        src={(prod.images && prod.images[0]) || prod.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 rounded-full text-rose-600 shadow-sm cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-900 truncate">{prod.name}</p>
                      <p className="text-xs font-black text-rose-700">₹{prod.salePrice || prod.price}</p>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(prod, 1);
                        showToast(`Added ${prod.name} to cart!`, 'success');
                      }}
                      className="w-full py-2 bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1 cursor-pointer touch-manipulation"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PASSWORD CHANGE MODAL ================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-neutral-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-black text-lg text-neutral-900">Change Account Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">New Password (Min. 6 chars)</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordForm.newPassword || ''}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-3 pr-10 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                    placeholder="Enter new strong password..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword || ''}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-3 pr-10 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                    placeholder="Re-type new password..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer touch-manipulation min-h-[42px]"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= RAISE NEW SUPPORT TICKET MODAL ================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-neutral-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <LifeBuoy className="w-5 h-5 text-rose-600" />
                <h3 className="font-serif font-black text-lg text-neutral-900">Raise Support Query</h3>
              </div>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Query Category</label>
                <select
                  value={newTicketForm.category || 'Delivery Update'}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                >
                  <option value="Delivery Update">Delivery & Dispatch Update</option>
                  <option value="Product Availability">Product Stock & Availability</option>
                  <option value="Payment / Refund">Payment or Refund Query</option>
                  <option value="Bulk / Festive Order">Bulk / Festive Gifting Inquiry</option>
                  <option value="Other">Other Query</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Order Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ORD-1001"
                  value={newTicketForm.orderNumber || ''}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, orderNumber: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Your Query / Message *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your issue or question in detail..."
                  value={newTicketForm.message || ''}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer touch-manipulation min-h-[42px]"
                >
                  Submit Query
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
