const db = require('../config/database');

class AuditService {
  static log({ userId, action, entityType, entityId, details = null }) {
    const logs = db.getCollection('audit_logs');
    const newLog = {
      id: db.getNextId('audit_logs'),
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    db.save();
    return newLog;
  }

  static getLogs({ entityType, entityId, limit = 20 }) {
    let logs = db.getCollection('audit_logs');

    if (entityType) {
      logs = logs.filter(l => l.entity_type === entityType.toUpperCase());
    }

    if (entityId) {
      logs = logs.filter(l => l.entity_id === parseInt(entityId, 10));
    }

    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return logs.slice(0, parseInt(limit, 10));
  }
}

module.exports = AuditService;
