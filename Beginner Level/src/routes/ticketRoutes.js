const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');
const { validateCreateTicket, validateUpdateStatus } = require('../middleware/validateTicket');

/**
 * @route   POST /api/tickets
 * @desc    Submit a new support ticket
 */
router.post('/', validateCreateTicket, TicketController.createTicket);

/**
 * @route   GET /api/tickets
 * @desc    Get list of support tickets with pagination & filters
 */
router.get('/', TicketController.getAllTickets);

/**
 * @route   GET /api/tickets/code/:code
 * @desc    Get ticket by ticket code (e.g. TCK-123456-ABCDEF)
 */
router.get('/code/:code', TicketController.getTicketByCode);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get single ticket details by ID
 */
router.get('/:id', TicketController.getTicketById);

/**
 * @route   PATCH /api/tickets/:id/status
 * @desc    Update ticket status and resolution notes
 */
router.patch('/:id/status', validateUpdateStatus, TicketController.updateTicketStatus);

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Delete a ticket by ID
 */
router.delete('/:id', TicketController.deleteTicket);

module.exports = router;
