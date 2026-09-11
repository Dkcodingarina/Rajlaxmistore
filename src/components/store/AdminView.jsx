import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import productService from '../../services/productService';
import festivalService from '../../services/festivalService';
import orderService from '../../services/orderService';
import couponService from '../../services/couponService';
import bannerService from '../../services/bannerService';
import supportService from '../../services/supportService';
import notificationService from '../../services/notificationService';
import reviewService from '../../services/reviewService';
import categoryService from '../../services/categoryService';
import customerService from '../../services/customerService';
import auditService from '../../services/auditService';
import { ShieldAlert } from 'lucide-react';

// Admin Core Modular Components
import AdminSidebar from '../admin/AdminSidebar';
import AdminHeader from '../admin/AdminHeader';
import DashboardModule from '../admin/DashboardModule';
import CampaignsModule from '../admin/CampaignsModule';
import ProductsModule from '../admin/ProductsModule';
import CategoriesModule from '../admin/CategoriesModule';
import OrdersModule from '../admin/OrdersModule';
import CouponsModule from '../admin/CouponsModule';
import ReviewsModule from '../admin/ReviewsModule';
import SupportModule from '../admin/SupportModule';
import NotificationsModule from '../admin/NotificationsModule';
import UsersModule from '../admin/UsersModule';
import AuditLogsModule from '../admin/AuditLogsModule';
import StoreSettingsModule from '../admin/StoreSettingsModule';
import AdminMobileBottomNav from '../admin/AdminMobileBottomNav';

export default function AdminView() {
  const {
    storeSettings,
    updateStoreSettings,
    activeFestival,
    setActiveFestival,
    refreshStoreMeta,
    showToast,
    navigateTo,
    handleLogout,
    currentUser
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data Collections State
  const [products, setProducts] = useState(() => productService.getProducts({ includeInactive: true }));
  const [categories, setCategories] = useState(() => categoryService.getCategories());
  const [festivals, setFestivals] = useState(() => festivalService.getFestivals());
  const [banners, setBanners] = useState(() => bannerService.getBanners(false));
  const [orders, setOrders] = useState(() => orderService.getAllOrders());
  const [coupons, setCoupons] = useState(() => couponService.getCoupons());
  const [reviews, setReviews] = useState(() => reviewService.getAllReviews());
  const [tickets, setTickets] = useState(() => supportService.getTickets());
  const [notifications, setNotifications] = useState(() => notificationService.getNotifications('admin'));
  const [customers, setCustomers] = useState(() => customerService.getCustomers());
  const [auditLogs, setAuditLogs] = useState(() => auditService.getLogs());

  useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(notificationService.getNotifications('admin'));
    };
    window.addEventListener('notifications_updated', handleNotifUpdate);
    window.addEventListener('notification_added', handleNotifUpdate);
    return () => {
      window.removeEventListener('notifications_updated', handleNotifUpdate);
      window.removeEventListener('notification_added', handleNotifUpdate);
    };
  }, []);

  // Global Quick Action Trigger State (e.g. from Dashboard or Header)
  const [quickProductModalOpen, setQuickProductModalOpen] = useState(false);
  const [inspectingOrder, setInspectingOrder] = useState(null);

  // Audit Logging helper
  const logAdminAction = (action, target, details) => {
    const newLog = auditService.logAction(
      action,
      target,
      details,
      currentUser?.name || 'Administrator'
    );
    setAuditLogs(auditService.getLogs());
    return newLog;
  };

  // Badge Counts for Sidebar
  const badgeCounts = {
    orders: orders.filter(o => o.status === 'placed' || o.status === 'confirmed' || o.status === 'packing').length,
    products: products.filter(p => (Number(p.stock) || 0) <= 5).length,
    support: tickets.filter(t => t.status === 'open' || t.status === 'pending').length,
    reviews: reviews.filter(r => r.status === 'pending').length,
    notifications: notifications.filter(n => !n.isRead).length
  };

  // Quick Restock from Dashboard
  const handleQuickRestock = (productId, amount = 10) => {
    productService.updateStock(productId, amount);
    const updated = productService.getProducts({ includeInactive: true });
    setProducts(updated);
    const prod = updated.find(p => p.id === productId);
    showToast(`Restocked ${prod?.name || 'product'} (+${amount} units)`, 'success');
    logAdminAction('QUICK_RESTOCK', prod?.name || `Product #${productId}`, `Added +${amount} stock units from Dashboard`);
  };

  // Order Details Trigger
  const handleOpenOrderDetails = (order) => {
    setInspectingOrder(order);
    setActiveTab('orders');
  };

  const isAdmin = currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin');

  useEffect(() => {
    if (!isAdmin) {
      showToast('Admin login required. Please sign in with your admin credentials.', 'error');
      navigateTo('auth', { redirectAfter: 'admin' });
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/40 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif text-white">Restricted Administrator Area</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            This console is strictly restricted to store administrators. Please sign in with credentials that have an admin role assigned in Supabase.
          </p>
          <button
            onClick={() => navigateTo('auth', { redirectAfter: 'admin' })}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-rose-950/50"
          >
            Sign In with Admin Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex font-sans text-neutral-900 selection:bg-rose-500 selection:text-white antialiased">
      {/* 1. Left Docked Collapsible Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onViewStorefront={() => navigateTo('home')}
        pendingOrdersCount={badgeCounts.orders}
        unreadTicketsCount={badgeCounts.support}
        lowStockCount={badgeCounts.products}
        storeSettings={storeSettings}
      />

      {/* 2. Main Content Canvas Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        {/* Top Sticky Header */}
        <AdminHeader
          currentUser={currentUser}
          storeSettings={storeSettings}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          setMobileOpen={setMobileSidebarOpen}
          onNavigateStore={() => navigateTo('home')}
          onLogout={handleLogout}
          searchQuery=""
          setSearchQuery={() => {}}
          onNavigateTab={setActiveTab}
          showToast={showToast}
        />

        {/* Dynamic Module Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {/* View 1: Executive Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardModule
              products={products}
              orders={orders}
              festivals={festivals}
              coupons={coupons}
              onNavigateTab={setActiveTab}
              onOpenProductModal={() => {
                setActiveTab('products');
              }}
              onOpenOrderDetails={handleOpenOrderDetails}
              onUpdateOrderStatus={(orderId, status) => {
                orderService.updateOrderStatus(orderId, status);
                setOrders(orderService.getAllOrders());
                showToast(`Order status updated to ${status}`, 'success');
              }}
              onQuickRestock={handleQuickRestock}
              storeSettings={storeSettings}
            />
          )}

          {/* View 2: Campaigns & Seasonal Drops */}
          {activeTab === 'campaigns' && (
            <CampaignsModule
              festivals={festivals}
              setFestivals={setFestivals}
              products={products}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}

          {/* View 4: Product Catalog & SKU Inventory */}
          {(activeTab === 'products' || activeTab === 'inventory') && (
            <ProductsModule
              products={products}
              setProducts={setProducts}
              categories={categories}
              festivals={festivals}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}

          {/* View 5: Categories Hierarchy */}
          {activeTab === 'categories' && (
            <CategoriesModule
              categories={categories}
              setCategories={setCategories}
              products={products}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}

          {/* View 6: Orders & Logistics Fulfillment */}
          {activeTab === 'orders' && (
            <OrdersModule
              orders={orders}
              setOrders={setOrders}
              showToast={showToast}
              auditLog={logAdminAction}
              storeSettings={storeSettings}
            />
          )}

          {/* View 7: Coupons & Discount Engine */}
          {activeTab === 'coupons' && (
            <CouponsModule
              coupons={coupons}
              setCoupons={setCoupons}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}

          {/* View 8: Reviews & Testimonials Moderation */}
          {activeTab === 'reviews' && (
            <ReviewsModule
              reviews={reviews}
              setReviews={setReviews}
              products={products}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}

          {/* View 9: Customer Support Desk */}
          {activeTab === 'support' && (
            <SupportModule
              tickets={tickets}
              setTickets={setTickets}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}

          {/* View 10: Push Notifications Broadcast */}
          {(activeTab === 'notifications' || activeTab === 'push_studio') && (
            <NotificationsModule
              notifications={notifications}
              setNotifications={setNotifications}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}

          {/* View 11: Customer Directory & Staff Permissions */}
          {(activeTab === 'users' || activeTab === 'customers') && (
            <UsersModule
              customers={customers}
              setCustomers={setCustomers}
              orders={orders}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}

          {/* View 12: Audit Activity Trail */}
          {(activeTab === 'audit' || activeTab === 'audit_logs') && (
            <AuditLogsModule
              logs={auditLogs}
              setLogs={setAuditLogs}
              showToast={showToast}
            />
          )}

          {/* View 13: Store Configuration & Branding Settings */}
          {activeTab === 'settings' && (
            <StoreSettingsModule
              storeSettings={storeSettings}
              setStoreSettings={updateStoreSettings}
              showToast={showToast}
              auditLog={logAdminAction}
            />
          )}
        </main>

        {/* Mobile Easy-to-Use Bottom Action Navigation Bar */}
        <AdminMobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          pendingOrdersCount={badgeCounts.orders}
          lowStockCount={badgeCounts.products}
          onViewStorefront={() => navigateTo('home')}
        />
      </div>
    </div>
  );
}
