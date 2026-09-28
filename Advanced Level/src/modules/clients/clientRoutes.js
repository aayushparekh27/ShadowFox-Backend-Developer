const express = require('express');
const router = express.Router();
const ClientController = require('./clientController');
const { authenticateJWT, authorize } = require('../../middleware/auth');

router.use(authenticateJWT);

router.post('/', authorize(['AGENCY_ADMIN']), ClientController.createClient);
router.get('/', authorize(['AGENCY_ADMIN', 'FREELANCER']), ClientController.getClients);
router.get('/:id', authorize(['AGENCY_ADMIN', 'FREELANCER']), ClientController.getClientById);

module.exports = router;
