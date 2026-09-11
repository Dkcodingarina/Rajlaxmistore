import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  ShoppingBag,
  Tag,
  LifeBuoy,
  Sparkles,
  AlertTriangle,
  User,
  Info,
  ExternalLink,
  ChevronRight,
  Clock,
  X
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import ConfirmModal from './ConfirmModal';

export const NotificationDropdown = ({
  role = 'customer', // 'customer' | 'admin'
  onNavigate = null, // (viewName, params) => void
  showToast = null // (msg, type) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'orders' | 'promos'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const dropdownRef = useRef(null);

  // Load notifications and sound settings
  const refreshData = () => {
    const list = notificationService.getNotifications(role);
    setNotifications([...list]);
    setSoundEnabled(notificationService.isSoundEnabled());
  };

  useEffect(() => {
    refreshData();

    // Listen to global notification updates
    const handleUpdate = () => {
      refreshData();
    };

    const handleNewNotif = (e) => {
      refreshData();
      if (showToast && e.detail) {
        showToast(`🔔 ${e.detail.title}`, 'info');
      }
    };

    const handleSoundToggle = (e) => {
      if (e.detail) {
        setSoundEnabled(e.detail.enabled);
      }
    };

    window.addEventListener('notifications_updated', handleUpdate);
    window.addEventListener('notification_added', handleNewNotif);
    window.addEventListener('notification_sound_toggled', handleSoundToggle);

    return () => {
      window.removeEventListener('notifications_updated', handleUpdate);
      window.removeEventListener('notification_added', handleNewNotif);
      window.removeEventListener('notification_sound_toggled', handleSoundToggle);
    };
  }, [role]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeFilter === 'unread') return !n.isRead;
      if (activeFilter === 'orders') return n.type === 'order';
      if (activeFilter === 'promos') return n.type === 'promo' || n.type === 'broadcast';
      return true;
    });
  }, [notifications, activeFilter]);

  // Handle sound toggle
  const handleToggleSound = (e) => {
    e.stopPropagation();
    const newState = notificationService.toggleSound();
    setSoundEnabled(newState);
    if (newState) {
      notificationService.playSound('default');
      if (showToast) showToast('🔊 Notification sound enabled', 'success');
    } else {
      if (showToast) showToast('🔇 Notification sound muted', 'info');
    }
  };

  // Handle Mark Single Read
  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    notificationService.markAsRead(id, role);
    refreshData();
  };

  // Handle Mark All as Read
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    notificationService.markAllAsRead(role);
    refreshData();
    if (showToast) showToast('All notifications marked as read', 'success');
  };

  // Handle Delete Single
  const handleDeleteNotification = (e, id) => {
    e.stopPropagation();
    notificationService.deleteNotification(id, role);
    refreshData();
    if (showToast) showToast('Notification removed', 'info');
  };

  // Handle Clear All
  const handleClearAll = (e) => {
    e.stopPropagation();
    if (notifications.length === 0) return;
    setShowClearConfirm(true);
  };

  const confirmClearAllAction = () => {
    notificationService.clearAll(role);
    refreshData();
    if (showToast) showToast('Cleared all notifications', 'info');
    setShowClearConfirm(false);
  };

  // Handle Notification Item Click
  const handleNotificationClick = (item) => {
    // 1. Mark as read
    if (!item.isRead) {
      notificationService.markAsRead(item.id, role);
      refreshData();
    }

    // 2. Navigate if handler provided
    if (onNavigate) {
      if (role === 'admin') {
        if (item.linkTab) {
          onNavigate(item.linkTab, item.linkData);
        } else if (item.type === 'order') {
          onNavigate('orders', item.linkData);
        } else if (item.type === 'support') {
          onNavigate('support', item.linkData);
        } else if (item.type === 'stock') {
          onNavigate('inventory', item.linkData);
        }
      } else {
        // Customer store navigation
        if (item.linkType === 'order') {
          onNavigate('my-orders', item.linkData);
        } else if (item.linkType === 'coupon') {
          onNavigate('offers', item.linkData);
        } else if (item.linkType === 'support') {
          onNavigate('support', item.linkData);
        } else if (item.linkType === 'home') {
          onNavigate('home', {});
        } else if (item.type === 'order') {
          onNavigate('my-orders', item.linkData);
        } else {
          onNavigate('home', {});
        }
      }
    }

    setIsOpen(false);
  };

  // Get icon by notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'promo':
      case 'broadcast':
        return <Tag className="w-4 h-4 text-rose-600" />;
      case 'support':
        return <LifeBuoy className="w-4 h-4 text-purple-600" />;
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'register':
      case 'auth':
        return <User className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'order': return 'bg-emerald-50 border-emerald-200';
      case 'promo':
      case 'broadcast': return 'bg-rose-50 border-rose-200';
      case 'support': return 'bg-purple-50 border-purple-200';
      case 'stock': return 'bg-amber-50 border-amber-200';
      case 'register':
      case 'auth': return 'bg-blue-50 border-blue-200';
      default: return 'bg-indigo-50 border-indigo-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-700 hover:text-rose-600 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-neutral-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-neutral-100 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-black text-sm text-neutral-900 flex items-center gap-1.5">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center space-x-1">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  soundEnabled
                    ? 'text-neutral-700 hover:bg-neutral-100'
                    : 'text-neutral-400 hover:bg-neutral-100'
                }`}
                title={soundEnabled ? 'Sound alert is ON (Click to mute)' : 'Sound alert is MUTED (Click to enable)'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
              </button>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4 text-blue-600" />
                </button>
              )}

              {/* Clear All */}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Close Dropdown */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 border-b border-neutral-100 flex items-center space-x-1 text-[11px] overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('orders')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'orders'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveFilter('promos')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'promos'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
              }`}
            >
              Offers
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50 px-2 py-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-neutral-400 text-xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="font-bold text-neutral-700">No notifications here</p>
                <p className="text-[11px] text-neutral-400">
                  {activeFilter === 'unread' ? "You're all caught up!" : "New events and orders will appear here"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative p-3 rounded-xl transition cursor-pointer flex items-start space-x-3 text-xs ${
                    item.isRead
                      ? 'hover:bg-neutral-50/80 bg-white opacity-90'
                      : 'bg-rose-50/40 hover:bg-rose-50/70 border border-rose-100/60 shadow-xs'
                  }`}
                >
                  {/* Category Avatar */}
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(item.type)}`}>
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${item.isRead ? 'font-semibold text-neutral-900' : 'font-black text-rose-950'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{notificationService.formatTimeAgo(item.createdAt)}</span>
                      </span>

                      {/* Action Callout */}
                      {(item.linkType || item.linkTab) && (
                        <span className="text-rose-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                          <span>View</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover Individual Action Buttons */}
                  <div className="absolute right-2 top-2 hidden group-hover:flex items-center space-x-1 bg-white/95 p-1 rounded-lg border border-neutral-200 shadow-xs">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, item.id)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotification(e, item.id)}
                      className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1 text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full ${soundEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
              <span>Sound {soundEnabled ? 'Active' : 'Off'}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                notificationService.addNotification({
                  type: 'order',
                  title: 'New Store Order Received!',
                  message: 'Customer purchase order #DEE-' + Math.floor(1000 + Math.random() * 9000) + ' for ₹1,499 confirmed.',
                  target: role,
                  sound: true
                });
                if (showToast) showToast('⚡ Notification alert dispatched', 'success');
              }}
              className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
            >
              Test Notification Alert
            </button>
          </div>
        </div>
      )}

      {/* Safe Clear Notifications Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All Notifications?"
        message="Are you sure you want to dismiss and clear all notifications from this inbox?"
        confirmText="Yes, Clear All"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmClearAllAction}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default NotificationDropdown;
