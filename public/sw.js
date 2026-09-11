// Production Service Worker for Promotional Web Push Notifications
// Rajlaxmi Cosmetic & Stationery Store

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Special Offer from Rajlaxmi Store!',
        body: event.data.text()
      };
    }
  }

  const title = data.title || '🔥 Special Promotion';
  const options = {
    body: data.body || data.message || 'Check out our latest festive offers and discounts!',
    icon: data.icon || '/assets/logo.png',
    badge: data.badge || '/assets/logo.png',
    image: data.image || data.imageUrl || undefined,
    data: {
      url: data.url || data.targetUrl || '/',
      timestamp: Date.now(),
      notificationId: data.notificationId
    },
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open_url',
        title: 'Shop Now 🛍️'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ],
    tag: 'promo-notification-' + (data.notificationId || Date.now()),
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
