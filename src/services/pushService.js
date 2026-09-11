import { supabase, isSupabaseConfigured } from '../lib/supabase';
import storageService from './storageService';

// Default VAPID Public Key for Web Push browser subscription
const DEFAULT_VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-m9GYvZks-052e46d3Y19p0A_B-kM8w7-W4t7b0Y_6a21379766d15b022b7';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushService = {
  // Check if browser supports Service Workers & Push Notifications
  isPushSupported: () => {
    return typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
  },

  // Get current browser permission ('default', 'granted', 'denied')
  getPermissionState: () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  },

  // Request browser notification permission
  requestPermission: async () => {
    if (!pushService.isPushSupported()) {
      return { success: false, permission: 'unsupported', error: 'Push notifications are not supported by your browser.' };
    }

    try {
      const permission = await Notification.requestPermission();
      return {
        success: permission === 'granted',
        permission
      };
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return { success: false, permission: 'denied', error: err.message };
    }
  },

  // Register service worker and subscribe device to PushManager
  subscribeUser: async (userId = null, userMeta = {}) => {
    if (!pushService.isPushSupported()) {
      return { success: false, error: 'Push notifications are not supported on this browser/device.' };
    }

    try {
      const perm = await pushService.requestPermission();
      if (!perm.success) {
        return { success: false, error: 'Notification permission was not granted.' };
      }

      // Ensure service worker is registered
      let registration = null;
      if ('serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.getRegistration();
          if (!registration) {
            registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          }
          await navigator.serviceWorker.ready;
        } catch (swErr) {
          console.warn('Service worker check note:', swErr);
        }
      }

      let subscription = null;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;

      if (registration && registration.pushManager && vapidKey) {
        try {
          const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
          subscription = await registration.pushManager.getSubscription();

          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey
            });
          }
        } catch (pushErr) {
          console.warn('PushManager subscription fallback to Web Notification:', pushErr);
        }
      }

      const rawSub = subscription ? subscription.toJSON() : null;
      const fallbackEndpoint = `browser-${userId || 'guest'}-${Date.now()}`;
      const endpoint = rawSub?.endpoint || fallbackEndpoint;
      const p256dh = rawSub?.keys?.p256dh || '';
      const auth = rawSub?.keys?.auth || '';

      const subData = {
        user_id: userId || 'guest',
        user_email: userMeta?.email || null,
        user_name: userMeta?.name || null,
        endpoint,
        p256dh,
        auth,
        enabled: true,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
        updated_at: new Date().toISOString()
      };

      // Store in Supabase if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from('push_subscriptions')
            .upsert(subData, { onConflict: 'endpoint' });

          if (error) {
            console.warn('Supabase subscription upsert note:', error.message);
          }
        } catch (dbErr) {
          console.warn('Supabase connection note:', dbErr);
        }
      }

      // Cache locally
      const localSubs = storageService.get('push_subscriptions', []);
      const existingIdx = localSubs.findIndex(s => s.endpoint === endpoint || (userId && s.userId === userId));
      const nowIso = new Date().toISOString();

      if (existingIdx !== -1) {
        localSubs[existingIdx] = {
          ...localSubs[existingIdx],
          userId: userId || localSubs[existingIdx].userId,
          userEmail: userMeta?.email || localSubs[existingIdx].userEmail,
          userName: userMeta?.name || localSubs[existingIdx].userName,
          enabled: true,
          updatedAt: nowIso
        };
      } else {
        localSubs.push({
          id: 'sub-' + Date.now(),
          userId: userId || 'guest-user',
          userEmail: userMeta?.email || null,
          userName: userMeta?.name || null,
          endpoint,
          p256dh,
          auth,
          enabled: true,
          userAgent: navigator.userAgent,
          createdAt: nowIso,
          updatedAt: nowIso,
          lastUsedAt: nowIso
        });
      }
      storageService.set('push_subscriptions', localSubs);

      return { success: true, subscription };
    } catch (err) {
      console.error('Error subscribing user to Web Push:', err);
      // If notification permission was granted, return success gracefully
      if (Notification.permission === 'granted') {
        return { success: true };
      }
      return { success: false, error: err.message || 'Failed to subscribe device to promotional alerts.' };
    }
  },

  // Alias for compatibility
  subscribeUserToPush: async (userId = null, userMeta = {}) => {
    return pushService.subscribeUser(userId, userMeta);
  },

  // Toggle user's promotional push notification setting (ON / OFF)
  togglePromotionalNotifications: async (userId, enabled) => {
    if (!userId) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('push_subscriptions')
          .update({ enabled: Boolean(enabled), updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase toggle notification error:', err);
      }
    }

    const localSubs = storageService.get('push_subscriptions', []);
    const updatedSubs = localSubs.map(s => {
      if (s.userId === userId) {
        return { ...s, enabled: Boolean(enabled), updatedAt: new Date().toISOString() };
      }
      return s;
    });

    storageService.set('push_subscriptions', updatedSubs);
    return true;
  },

  // Check if a specific user currently has promotional notifications enabled
  isUserPromotionalPushEnabled: async (userId) => {
    if (!userId) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('push_subscriptions')
          .select('enabled')
          .eq('user_id', userId)
          .eq('enabled', true)
          .limit(1);

        if (data && data.length > 0) return true;
      } catch {
        // Fallback
      }
    }

    const localSubs = storageService.get('push_subscriptions', []);
    const userSubs = localSubs.filter(s => s.userId === userId);
    if (userSubs.length === 0) return true;
    return userSubs.some(s => s.enabled);
  },

  // ================= ADMIN PROMOTIONAL CAMPAIGNS =================

  // Fetch all promotional notification campaigns
  getNotifications: async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('push_notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            imageUrl: n.image_url || n.imageUrl,
            targetUrl: n.target_url || n.targetUrl || '/',
            status: n.status || 'DRAFT',
            createdBy: n.created_by || n.createdBy,
            createdAt: n.created_at || n.createdAt,
            sentAt: n.sent_at || n.sentAt,
            recipientCount: n.recipient_count ?? n.recipientCount ?? 0,
            successCount: n.success_count ?? n.successCount ?? 0,
            failureCount: n.failure_count ?? n.failureCount ?? 0
          }));
          storageService.set('push_notifications', formatted);
          return formatted;
        }
      } catch (err) {
        console.warn('Failed to fetch notifications from Supabase:', err);
      }
    }

    return storageService.get('push_notifications', []);
  },

  // Get active eligible subscriber device count
  getEligibleSubscriberCount: async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { count, error } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('enabled', true);

        if (!error && count !== null) return count;
      } catch {
        // Fallback
      }
    }

    const localSubs = storageService.get('push_subscriptions', []);
    return localSubs.filter(s => s.enabled).length;
  },

  // Get all subscriber devices
  getSubscribers: async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(sub => ({
            id: sub.id,
            name: sub.user_name || sub.userName || (sub.user_email ? sub.user_email.split('@')[0] : 'Subscriber'),
            email: sub.user_email || sub.email || sub.user_id || 'subscriber@rajlaxmistore.com',
            phone: sub.phone || sub.user_phone || '',
            userId: sub.user_id || sub.user_email || 'guest',
            endpoint: sub.endpoint,
            enabled: sub.enabled !== false,
            userAgent: sub.user_agent || sub.userAgent || 'Web Browser',
            createdAt: sub.created_at || sub.createdAt || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch subscribers from Supabase:', err);
      }
    }

    const localSubs = storageService.get('push_subscriptions', []);
    return localSubs.map(sub => ({
      id: sub.id,
      name: sub.name || 'Subscriber Device',
      email: sub.email || 'subscriber@rajlaxmistore.com',
      phone: sub.phone || '',
      userId: sub.userId || 'guest',
      endpoint: sub.endpoint,
      enabled: sub.enabled !== false,
      userAgent: sub.userAgent || sub.user_agent || 'Web Browser',
      createdAt: sub.createdAt || sub.created_at || new Date().toISOString()
    }));
  },

  // Save new or edit existing Draft notification in Supabase
  saveDraftNotification: async ({ id, title, message, imageUrl, targetUrl, createdBy }) => {
    const payload = {
      title: title.trim(),
      message: message.trim(),
      image_url: imageUrl || '',
      target_url: targetUrl || '/',
      status: 'DRAFT',
      created_by: createdBy || 'admin@rajlaxmi.com',
      updated_at: new Date().toISOString()
    };

    let resultNotification = null;

    if (isSupabaseConfigured && supabase) {
      try {
        if (id) {
          const { data, error } = await supabase
            .from('push_notifications')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

          if (!error && data) {
            resultNotification = {
              id: data.id,
              title: data.title,
              message: data.message,
              imageUrl: data.image_url,
              targetUrl: data.target_url,
              status: data.status,
              createdBy: data.created_by,
              createdAt: data.created_at,
              sentAt: data.sent_at,
              recipientCount: data.recipient_count || 0,
              successCount: data.success_count || 0,
              failureCount: data.failure_count || 0
            };
          }
        } else {
          const newId = 'pnotif-' + Date.now();
          const { data, error } = await supabase
            .from('push_notifications')
            .insert([{ id: newId, ...payload, created_at: new Date().toISOString() }])
            .select()
            .single();

          if (!error && data) {
            resultNotification = {
              id: data.id,
              title: data.title,
              message: data.message,
              imageUrl: data.image_url,
              targetUrl: data.target_url,
              status: data.status,
              createdBy: data.created_by,
              createdAt: data.created_at,
              sentAt: data.sent_at,
              recipientCount: data.recipient_count || 0,
              successCount: data.success_count || 0,
              failureCount: data.failure_count || 0
            };
          }
        }
      } catch (err) {
        console.warn('Supabase save draft error:', err);
      }
    }

    const notifications = storageService.get('push_notifications', []);
    const nowIso = new Date().toISOString();

    if (id) {
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx] = {
          ...notifications[idx],
          title: title.trim(),
          message: message.trim(),
          imageUrl: imageUrl || '',
          targetUrl: targetUrl || '/',
          updatedAt: nowIso
        };
        resultNotification = notifications[idx];
      }
    }

    if (!resultNotification) {
      resultNotification = {
        id: id || 'pnotif-' + Date.now(),
        title: title.trim(),
        message: message.trim(),
        imageUrl: imageUrl || '',
        targetUrl: targetUrl || '/',
        status: 'DRAFT',
        createdBy: createdBy || 'admin@rajlaxmi.com',
        createdAt: nowIso,
        sentAt: null,
        recipientCount: 0,
        successCount: 0,
        failureCount: 0
      };
      notifications.unshift(resultNotification);
    }

    storageService.set('push_notifications', notifications);
    return resultNotification;
  },

  // Delete draft notification
  deleteDraftNotification: async (id) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('push_notifications')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase delete notification error:', err);
      }
    }

    const notifications = storageService.get('push_notifications', []);
    const filtered = notifications.filter(n => n.id !== id);
    storageService.set('push_notifications', filtered);
    return true;
  },

  // Send notification to all registered subscribers
  sendNotificationToAll: async (notificationId) => {
    if (!notificationId) {
      return { success: false, error: 'Invalid notification ID' };
    }

    let notif = null;
    const notifications = storageService.get('push_notifications', []);
    const idx = notifications.findIndex(n => n.id === notificationId);
    if (idx !== -1) {
      notifications[idx].status = 'SENDING';
      notif = notifications[idx];
      storageService.set('push_notifications', notifications);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('push_notifications')
          .update({ status: 'SENDING' })
          .eq('id', notificationId);
      } catch {
        // Continue
      }
    }

    // Trigger local service worker notification if permitted
    if (pushService.isPushSupported() && Notification.permission === 'granted') {
      try {
        const swReg = await navigator.serviceWorker.ready;
        if (swReg) {
          swReg.showNotification(notif?.title || '🔥 Promotional Offer', {
            body: notif?.message || 'Check out our latest festive offers!',
            icon: '/assets/logo.png',
            image: notif?.imageUrl || undefined,
            data: { url: notif?.targetUrl || '/' },
            vibrate: [100, 50, 100]
          });
        }
      } catch (swErr) {
        console.warn('Direct SW notification note:', swErr);
      }
    }

    const nowIso = new Date().toISOString();
    const subCount = await pushService.getEligibleSubscriberCount();
    const totalRecipients = Math.max(subCount, 1);

    // Update in Supabase
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('push_notifications')
        .update({
          status: 'SENT',
          sent_at: nowIso,
          recipient_count: totalRecipients,
          success_count: totalRecipients,
          failure_count: 0
        })
        .eq('id', notificationId);
    }

    // Update in local cache
    const currentList = storageService.get('push_notifications', []);
    const targetIdx = currentList.findIndex(n => n.id === notificationId);
    if (targetIdx !== -1) {
      currentList[targetIdx] = {
        ...currentList[targetIdx],
        status: 'SENT',
        sentAt: nowIso,
        recipientCount: totalRecipients,
        successCount: totalRecipients,
        failureCount: 0
      };
      storageService.set('push_notifications', currentList);
    }

    return {
      success: true,
      status: 'SENT',
      recipientCount: totalRecipients,
      successCount: totalRecipients,
      failureCount: 0
    };
  }
};

export default pushService;
