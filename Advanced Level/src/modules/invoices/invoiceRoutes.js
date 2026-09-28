const express = require('express');
const router = express.Router();
const InvoiceController = require('./invoiceController');
const { authenticateJWT, authorize } = require('../../middleware/auth');

router.use(authenticateJWT);

router.get('/', authorize(['AGENCY_ADMIN', 'CLIENT']), InvoiceController.getInvoices);
router.get('/:id', authorize(['AGENCY_ADMIN', 'CLIENT']), InvoiceController.getInvoiceById);
router.patch('/:id/pay', authorize(['AGENCY_ADMIN']), InvoiceController.markAsPaid);

module.exports = router;
