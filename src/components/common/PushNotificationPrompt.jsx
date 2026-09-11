import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import pushService from '../../services/pushService';
import notificationService from '../../services/notificationService';
import { Bell, Sparkles, X, Check, ShieldCheck } from 'lucide-react';

export default function PushNotificationPrompt() {
  const { currentUser, showToast } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Only show for logged in registered users if push is supported
    if (!currentUser || !pushService.isPushSupported()) return;

    // Check if permission is already granted or denied
    const permission = pushService.getPermissionState();
    if (permission === 'granted' || permission === 'denied') {
      return;
    }

    // Check if user already dismissed prompt in this session
    const dismissedKey = `push_prompt_dismissed_${currentUser.id}`;
    if (sessionStorage.getItem(dismissedKey)) {
      return;
    }

    // Show prompt banner after a brief gentle delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentUser]);

  const handleAllow = async () => {
    setIsSubscribing(true);
    try {
      const res = await pushService.subscribeUser(currentUser?.id, {
        email: currentUser?.email,
        name: currentUser?.name
      });
      if (res.success) {
        showToast('🔔 You will now receive exclusive promotional offers and festive sale alerts!', 'success');
        notificationService.addNotification({
          type: 'promo',
          title: '✨ Welcome to Rajlaxmi Store VIP Alerts!',
          message: 'Push notifications are now enabled. You will get instant festival discounts, restock alerts, and exclusive offers.',
          target: 'customer',
          linkType: 'home',
          sound: true
        });
        setIsVisible(false);
      } else {
        showToast(res.error || 'Notification permission was not granted.', 'info');
        setIsVisible(false);
      }
    } catch (err) {
      console.warn('Push notification subscription error:', err);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        showToast('🔔 Promotional notifications are active!', 'success');
        notificationService.addNotification({
          type: 'promo',
          title: '✨ Welcome to Rajlaxmi Store VIP Alerts!',
          message: 'Push notifications are now enabled. You will get instant festival discounts, restock alerts, and exclusive offers.',
          target: 'customer',
          linkType: 'home',
          sound: true
        });
        setIsVisible(false);
      } else {
        showToast('Could not enable promotional notifications. Please allow notifications in your browser settings.', 'error');
        setIsVisible(false);
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    if (currentUser?.id) {
      sessionStorage.setItem(`push_prompt_dismissed_${currentUser.id}`, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-neutral-900 text-white p-5 rounded-3xl shadow-2xl border border-neutral-700/80 space-y-3 font-sans relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-serif font-black text-sm text-white flex items-center space-x-1.5">
                <span>Festive Offers & VIP Alerts</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h4>
              <p className="text-[11px] text-neutral-300 leading-snug mt-0.5">
                Want to receive special discounts, instant festival price-drop alerts & exclusive promo codes?
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition cursor-pointer shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-xs">
          <span className="text-[10px] text-neutral-400 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Separate from order alerts</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition cursor-pointer"
            >
              Not Now
            </button>
            <button
              onClick={handleAllow}
              disabled={isSubscribing}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center space-x-1 disabled:opacity-50"
            >
              {isSubscribing ? (
                <span>Enabling...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Allow Notifications</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
