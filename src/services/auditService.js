import dataProvider from '../providers/dataProvider';

export const auditService = {
  getLogs: () => {
    return dataProvider.getAuditLogs ? dataProvider.getAuditLogs() : [];
  },

  logAction: (action, target, details, user = 'Store Administrator', type = 'info') => {
    if (dataProvider.logAuditAction) {
      return dataProvider.logAuditAction(action, target, details, user, type);
    }
    return { id: `log-${Date.now()}`, action, target, details, user, type, timestamp: new Date().toISOString() };
  },

  log: (action, entity, details, type = 'info', actor = 'Store Administrator') => {
    return auditService.logAction(action, entity, details, actor, type);
  },

  clearLogs: () => {
    return dataProvider.clearAuditLogs ? dataProvider.clearAuditLogs() : [];
  }
};

export default auditService;


