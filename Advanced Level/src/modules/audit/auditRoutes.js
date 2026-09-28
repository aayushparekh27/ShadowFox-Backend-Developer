const express = require('express');
const router = express.Router();
const AuditController = require('./auditController');
const { authenticateJWT, authorize } = require('../../middleware/auth');

router.use(authenticateJWT);

// Admin-only endpoint for compliance audit logs
router.get('/', authorize(['AGENCY_ADMIN']), AuditController.getLogs);

module.exports = router;
