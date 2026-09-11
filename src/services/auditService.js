import storage from '../utils/storage';

const AUDIT_STORAGE_KEY = 'rajlaxmi_audit_logs';

const initialLogs = [
  {
    id: 'log-1',
    user: 'Store Super Admin',
    actor: 'Store Super Admin',
    action: 'DISPATCH_ORDER',
    target: 'Order #ORD-9842',
    entity: 'Order #ORD-9842',
    details: 'Assigned courier BlueDart (Tracking #BD7729104)',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    type: 'success'
  },
  {
    id: 'log-2',
    user: 'Store Super Admin',
    actor: 'Store Super Admin',
    action: 'UPDATE_PRODUCT_PRICE',
    target: 'Lakmé Absolute Matte Lipstick',
    entity: 'Lakmé Absolute Matte Lipstick',
    details: 'Price adjusted from ₹850 to ₹749 (12% off)',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'info'
  },
  {
    id: 'log-3',
    user: 'System Automation',
    actor: 'System Automation',
    action: 'LOW_STOCK_ALERT',
    target: 'Camlin Artist Acrylic Colors Set (12 Shades)',
    entity: 'Camlin Artist Acrylic Colors Set (12 Shades)',
    details: 'Stock depleted to 3 units (Threshold: 5)',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    type: 'warning'
  },
  {
    id: 'log-4',
    user: 'Store Super Admin',
    actor: 'Store Super Admin',
    action: 'CREATE_CAMPAIGN',
    target: 'Diwali Festive Dhamaka 2026',
    entity: 'Diwali Festive Dhamaka 2026',
    details: 'Published seasonal banner campaign with 25% catalog discount',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    type: 'success'
  },
  {
    id: 'log-5',
    user: 'Store Super Admin',
    actor: 'Store Super Admin',
    action: 'APPROVE_REVIEW',
    target: 'Review #REV-104',
    entity: 'Review #REV-104',
    details: 'Approved 5-star verified lookbook review by Priya S.',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    type: 'info'
  }
];

export const auditService = {
  getLogs: () => {
    const logs = storage.get(AUDIT_STORAGE_KEY, null);
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      storage.set(AUDIT_STORAGE_KEY, initialLogs);
      return initialLogs;
    }
    return logs.map(l => ({
      ...l,
      user: l.user || l.actor || 'Administrator',
      actor: l.actor || l.user || 'Administrator',
      target: l.target || l.entity || 'General',
      entity: l.entity || l.target || 'General'
    }));
  },

  logAction: (action, target, details, user = 'Store Administrator', type = 'info') => {
    const logs = auditService.getLogs();
    const newEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user: user || 'Store Administrator',
      actor: user || 'Store Administrator',
      action: action || 'ACTION',
      target: target || 'General',
      entity: target || 'General',
      details: details || '',
      timestamp: new Date().toISOString(),
      type
    };
    const updated = [newEntry, ...logs].slice(0, 150);
    storage.set(AUDIT_STORAGE_KEY, updated);
    return newEntry;
  },

  log: (action, entity, details, type = 'info', actor = 'Store Administrator') => {
    return auditService.logAction(action, entity, details, actor, type);
  },

  clearLogs: () => {
    storage.set(AUDIT_STORAGE_KEY, []);
    return [];
  }
};

export default auditService;

