const AuditService = require('../../services/auditService');
const ApiResponse = require('../../utils/apiResponse');

class AuditController {
  static getLogs(req, res, next) {
    try {
      const { entityType, entityId, limit } = req.query;
      const logs = AuditService.getLogs({ entityType, entityId, limit });
      return ApiResponse.success(res, 'System audit logs retrieved.', logs, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuditController;
