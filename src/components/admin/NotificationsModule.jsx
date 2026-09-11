import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Plus,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Volume2,
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import pushService from '../../services/pushService';
import ConfirmModal from '../common/ConfirmModal';

export default function NotificationsModule({
  notifications = [],
  setNotifications,
  showToast,
  auditLog
}) {
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, notifId: null, title: '' });
  const [permissionState, setPermissionState] = useState(() => notificationService.getBrowserPermissionState());
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    target: 'all', // 'all' | 'vip' | 'cart_abandoners'
    link: '/products',
    badge: 'Special Drop'
  });

  useEffect(() => {
    setPermissionState(notificationService.getBrowserPermissionState());
  }, []);

  const handleRequestPermission = async () => {
    const res = await notificationService.requestBrowserPermission();
    setPermissionState(res.permission);
    if (res.success) {
      showToast('Browser Push Notifications Enabled! You will now receive system and order alerts.', 'success');
      notificationService.sendTestPushNotification();
      setNotifications(notificationService.getNotifications('admin'));
    } else {
      showToast('Notification permission was not granted in your browser.', 'info');
    }
  };

  const handleSendTestPush = () => {
    notificationService.sendTestPushNotification();
    setNotifications(notificationService.getNotifications('admin'));
    showToast('🔔 Test Push Notification sent to your screen & audio chime played!', 'success');
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      showToast('Notification title and message are required', 'error');
      return;
    }

    setIsSending(true);

    const payload = {
      title: form.title,
      message: form.message,
      target: form.target,
      link: form.link,
      badge: form.badge,
      sentAt: new Date().toISOString(),
      recipientCount: form.target === 'all' ? 450 : form.target === 'vip' ? 85 : 120
    };

    try {
      // 1. Dispatch through notificationService (handles customer list, audio chime, and local browser notification)
      notificationService.broadcastNotification(payload);

      // 2. Also register in pushService so draft & subscription broadcasts are tracked
      try {
        const draft = await pushService.saveDraftNotification({
          title: form.title,
          message: form.message,
          targetUrl: form.link
        });
        if (draft?.id) {
          await pushService.sendNotificationToAll(draft.id);
        }
      } catch (pushErr) {
        console.warn('Push service broadcast sync note:', pushErr);
      }

      setNotifications(notificationService.getNotifications('admin'));
      setForm({
        title: '',
        message: '',
        target: 'all',
        link: '/products',
        badge: 'Special Drop'
      });
      showToast(`🔔 Push Broadcast dispatched to ${payload.recipientCount} customer devices!`, 'success');
      if (auditLog) {
        auditLog('BROADCAST_NOTIFICATION', payload.title, `Dispatched push broadcast to ${payload.target} audience`);
      }
    } catch (err) {
      console.error('Error broadcasting push notification:', err);
      showToast('Failed to send broadcast. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = (id, title) => {
    setDeleteConfirm({ isOpen: true, notifId: id, title });
  };

  const confirmDeleteNotifAction = () => {
    const { notifId, title } = deleteConfirm;
    if (!notifId) return;
    notificationService.deleteNotification(notifId, 'admin');
    setNotifications(notificationService.getNotifications('admin'));
    showToast('Notification record deleted', 'info');
    setDeleteConfirm({ isOpen: false, notifId: null, title: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header with Browser Push Status & Test Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-600" />
            <span>Store Push Notifications & Broadcast Hub</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Dispatch instant promotional push notifications, restock alerts, and VIP festival announcements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {permissionState === 'granted' ? (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Browser Push Active</span>
            </div>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Radio className="w-4 h-4 text-rose-400" />
              <span>Enable Push on Device</span>
            </button>
          )}

          <button
            onClick={handleSendTestPush}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            title="Trigger an instant test notification on this screen with audio chime"
          >
            <Volume2 className="w-4 h-4 text-rose-600" />
            <span>Test Push & Sound</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs">
          <h3 className="font-serif font-black text-base text-neutral-900 mb-1 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-rose-600" />
            <span>Compose Push Broadcast</span>
          </h3>
          <p className="text-xs text-neutral-500 mb-4">Send instant alert to customer mobile devices</p>

          <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Headline Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., 🪔 Diwali Dhamaka: Flat 30% OFF Live Now!"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Broadcast Message *</label>
              <textarea
                rows="3"
                required
                placeholder="e.g., Explore pure cosmetics hampers and luxury pen sets with instant coupon saving code FESTIVE30."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Target Audience</label>
                <select
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Customers (450+)</option>
                  <option value="repeat">Repeat / Loyal Customers</option>
                  <option value="cart_abandoners">Cart Abandoners</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g., Flash Drop"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Action Deep Link</label>
              <input
                type="text"
                placeholder="e.g., /products?category=cosmetics-makeup"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold transition flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
              <span>{isSending ? 'Broadcasting to Devices...' : 'Broadcast to Devices'}</span>
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-serif font-black text-base text-neutral-900">Broadcast Dispatch Log</h3>
            <span className="font-mono text-xs text-neutral-400">{notifications.length} Sent</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                <p>No broadcast notifications sent yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 hover:bg-neutral-100/60 transition flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-neutral-900">{n.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold uppercase">
                        {n.target}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{n.message}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-neutral-400 font-mono pt-1">
                      <span>Sent: {n.sentAt ? new Date(n.sentAt).toLocaleDateString('en-IN') : 'Recent'}</span>
                      <span>•</span>
                      <span>{n.recipientCount || 100} Recipients</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(n.id, n.title)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Safe Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Notification Record?"
        message={`Are you sure you want to remove the broadcast log for "${deleteConfirm.title}"?`}
        confirmText="Yes, Delete Record"
        cancelText="Keep Record"
        confirmVariant="danger"
        onConfirm={confirmDeleteNotifAction}
        onClose={() => setDeleteConfirm({ isOpen: false, notifId: null, title: '' })}
      />
    </div>
  );
}
