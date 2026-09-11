import storage from '../utils/storage';
import notificationAudio from '../utils/audioNotification';

const CUSTOMER_NOTIFS_KEY = 'customer_notifications';
const ADMIN_NOTIFS_KEY = 'admin_notifications';

const INITIAL_CUSTOMER_NOTIFICATIONS = [
  {
    id: 'notif-c-1',
    type: 'order',
    title: 'Order Confirmed #RLX-2026-00108',
    message: 'Your order for Luxury Velvet Matte Lipstick & Botanical Face Serum has been confirmed and is being packed.',
    linkType: 'order',
    linkData: { orderId: 'RLX-2026-00108' },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() // 25 mins ago
  },
  {
    id: 'notif-c-2',
    type: 'promo',
    title: '15% Off Your Next Purchase!',
    message: 'Use coupon code FESTIVE15 during checkout on cosmetics and gift hampers. Valid for limited time.',
    linkType: 'coupon',
    linkData: { code: 'FESTIVE15' },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 hours ago
  },
  {
    id: 'notif-c-3',
    type: 'support',
    title: 'Support Request Resolved',
    message: 'Your query regarding delivery timeline to Botad has been answered by our care team.',
    linkType: 'support',
    linkData: { ticketId: 'TCK-1029' },
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 'notif-c-4',
    type: 'auth',
    title: 'Welcome to Rajlaxmi Store!',
    message: 'Thank you for creating an account. Enjoy genuine cosmetics, fine stationery, and curated gift hampers.',
    linkType: 'home',
    linkData: {},
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  }
];

const INITIAL_ADMIN_NOTIFICATIONS = [
  {
    id: 'notif-a-1',
    type: 'order',
    title: 'New Order Received #RLX-2026-00108',
    message: 'Rahul Sharma placed order #RLX-2026-00108 worth ₹1,250 via Cash on Delivery.',
    linkTab: 'orders',
    linkType: 'order',
    linkData: { orderId: 'RLX-2026-00108' },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'notif-a-2',
    type: 'stock',
    title: 'Low Stock Alert',
    message: "'Maybelline Fit Me Matte Foundation' stock is down to 2 units in inventory!",
    linkTab: 'inventory',
    linkType: 'stock',
    linkData: { productId: 'prod-102' },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'notif-a-3',
    type: 'support',
    title: 'New Customer Support Message',
    message: 'Priya Verma sent a message: "When will my order deliver in Rajkot?"',
    linkTab: 'support',
    linkType: 'support',
    linkData: { ticketId: 'TCK-1030' },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'notif-a-4',
    type: 'register',
    title: 'New Customer Registered',
    message: 'Anisha Patel registered with email anisha.p@example.com (Botad)',
    linkTab: 'customers',
    linkType: 'customer',
    linkData: {},
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
  }
];

export const notificationService = {
  /**
   * Get notifications list based on target scope ('customer' | 'admin')
   */
  getNotifications: (role = 'customer') => {
    const key = role === 'admin' ? ADMIN_NOTIFS_KEY : CUSTOMER_NOTIFS_KEY;
    const initial = role === 'admin' ? INITIAL_ADMIN_NOTIFICATIONS : INITIAL_CUSTOMER_NOTIFICATIONS;
    const stored = storage.get(key, null);
    if (!stored) {
      storage.set(key, initial);
      return initial;
    }
    return stored;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: (role = 'customer') => {
    const list = notificationService.getNotifications(role);
    return list.filter(n => !n.isRead).length;
  },

  /**
   * Add a new notification and trigger live reactive events & audio chime
   */
  addNotification: ({
    type = 'system', // 'order' | 'promo' | 'support' | 'stock' | 'register' | 'broadcast' | 'auth' | 'system'
    title,
    message,
    target = 'all', // 'customer' | 'admin' | 'all'
    linkType = null,
    linkData = {},
    linkTab = null,
    priority = 'normal',
    sound = true
  }) => {
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      type,
      title: title || 'Notification',
      message: message || '',
      linkType,
      linkData,
      linkTab: linkTab || (roleForTab(type)),
      priority,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Save to customer list if target is 'customer' or 'all'
    if (target === 'customer' || target === 'all') {
      const custList = notificationService.getNotifications('customer');
      custList.unshift(newNotif);
      storage.set(CUSTOMER_NOTIFS_KEY, custList);
    }

    // Save to admin list if target is 'admin' or 'all'
    if (target === 'admin' || target === 'all') {
      const adminList = notificationService.getNotifications('admin');
      adminList.unshift(newNotif);
      storage.set(ADMIN_NOTIFS_KEY, adminList);
    }

    // Play synthesized notification sound chime if requested
    if (sound) {
      notificationAudio.playChime(type === 'order' ? 'order' : 'default');
    }

    // Trigger native browser push notification if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notifInstance = new Notification(title || 'Rajlaxmi Store Notification', {
          body: message || '',
          icon: '/assets/logo.png',
          badge: '/assets/logo.png',
          tag: newNotif.id
        });
        notifInstance.onclick = () => {
          window.focus();
        };
      } catch (nativeErr) {
        // Fallback to serviceWorker registration if direct constructor is restricted
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            if (reg && reg.showNotification) {
              reg.showNotification(title || 'Rajlaxmi Store Notification', {
                body: message || '',
                icon: '/assets/logo.png',
                tag: newNotif.id
              });
            }
          }).catch(() => {});
        }
      }
    }

    // Dispatch global events for UI updates
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('notification_added', { detail: newNotif }));
        window.dispatchEvent(new CustomEvent('notifications_updated', { detail: { target } }));
      } catch (err) {
        console.warn('Notification event dispatch error:', err);
      }
    }

    return newNotif;
  },

  /**
   * Browser Push Notification Permission and Status
   */
  getBrowserPermissionState: () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  },

  requestBrowserPermission: async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, permission: 'unsupported' };
    }
    try {
      const permission = await Notification.requestPermission();
      return {
        success: permission === 'granted',
        permission
      };
    } catch (err) {
      console.warn('Browser notification permission error:', err);
      return { success: false, permission: 'denied', error: err.message };
    }
  },

  sendTestPushNotification: () => {
    return notificationService.addNotification({
      type: 'promo',
      title: '🔔 Rajlaxmi VIP Push Alert Test',
      message: 'Push notifications are working properly on your device! You will receive instant order & festival sale alerts.',
      target: 'all',
      linkType: 'home',
      sound: true
    });
  },

  /**
   * Helper for admin push broadcasts
   */
  broadcastNotification: (broadcastData) => {
    return notificationService.addNotification({
      type: 'broadcast',
      title: broadcastData.title,
      message: broadcastData.message,
      target: 'all',
      linkType: 'promo',
      linkTab: 'notifications',
      sound: true
    });
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: (id, role = 'customer') => {
    const key = role === 'admin' ? ADMIN_NOTIFS_KEY : CUSTOMER_NOTIFS_KEY;
    const list = notificationService.getNotifications(role);
    const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
    storage.set(key, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications_updated', { detail: { role } }));
    }
    return updated;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: (role = 'customer') => {
    const key = role === 'admin' ? ADMIN_NOTIFS_KEY : CUSTOMER_NOTIFS_KEY;
    const list = notificationService.getNotifications(role);
    const updated = list.map(n => ({ ...n, isRead: true }));
    storage.set(key, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications_updated', { detail: { role } }));
    }
    return updated;
  },

  /**
   * Delete a single notification
   */
  deleteNotification: (id, role = 'customer') => {
    const key = role === 'admin' ? ADMIN_NOTIFS_KEY : CUSTOMER_NOTIFS_KEY;
    const list = notificationService.getNotifications(role);
    const updated = list.filter(n => n.id !== id);
    storage.set(key, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications_updated', { detail: { role } }));
    }
    return updated;
  },

  /**
   * Clear all notifications
   */
  clearAll: (role = 'customer') => {
    const key = role === 'admin' ? ADMIN_NOTIFS_KEY : CUSTOMER_NOTIFS_KEY;
    storage.set(key, []);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications_updated', { detail: { role } }));
    }
    return [];
  },

  /**
   * Audio Sound Controls
   */
  isSoundEnabled: () => {
    return notificationAudio.isSoundEnabled();
  },

  setSoundEnabled: (enabled) => {
    return notificationAudio.setSoundEnabled(enabled);
  },

  toggleSound: () => {
    return notificationAudio.toggleSound();
  },

  playSound: (type = 'default') => {
    notificationAudio.playChime(type);
  },

  /**
   * Utility to format relative timestamps
   */
  formatTimeAgo: (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 45) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }
};

function roleForTab(type) {
  switch (type) {
    case 'order': return 'orders';
    case 'stock': return 'inventory';
    case 'support': return 'support';
    case 'register': return 'customers';
    case 'promo': return 'coupons';
    default: return 'dashboard';
  }
}

export default notificationService;
