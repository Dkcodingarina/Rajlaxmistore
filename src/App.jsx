import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import BottomNav from './components/common/BottomNav';
import ToastContainer from './components/common/ToastContainer';
import SupportWidget from './components/common/SupportWidget';
import PushNotificationPrompt from './components/common/PushNotificationPrompt';

// Views
import HomeView from './components/store/HomeView';
import ProductsView from './components/store/ProductsView';
import FestivalView from './components/store/FestivalView';
import CartView from './components/store/CartView';
import CheckoutView from './components/store/CheckoutView';
import AuthView from './components/store/AuthView';
import MyOrdersView from './components/store/MyOrdersView';
import CmsView from './components/store/CmsView';
import AdminView from './components/store/AdminView';
import WishlistView from './components/store/WishlistView';

function AppContent() {
  const { currentView } = useStore();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'products':
      case 'category':
        return <ProductsView />;
      case 'festival':
        return <FestivalView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'auth':
        return <AuthView />;
      case 'my-orders':
        return <MyOrdersView />;
      case 'wishlist':
        return <WishlistView />;
      case 'cms':
        return <CmsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-rose-500 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Toast Notification Layer */}
      <ToastContainer />

      {/* Main Header */}
      {currentView !== 'admin' && <Header />}

      {/* View Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-0">
        {renderView()}
      </main>

      {/* Footer */}
      {currentView !== 'admin' && <Footer />}

      {/* Mobile Sticky Navigation Bar */}
      {currentView !== 'admin' && <BottomNav />}

      {/* Floating Customer Support Launcher */}
      {currentView !== 'admin' && <SupportWidget />}

      {/* Promotional Web Push Permission Prompt */}
      {currentView !== 'admin' && <PushNotificationPrompt />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
