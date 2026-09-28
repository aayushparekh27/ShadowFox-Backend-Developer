const TicketService = require('../services/ticketService');
const ApiResponse = require('../utils/apiResponse');

class TicketController {
  static createTicket(req, res, next) {
    try {
      const ticket = TicketService.createTicket(req.body);
      return ApiResponse.success(
        res,
        'Support ticket created successfully.',
        ticket,
        201
      );
    } catch (err) {
      next(err);
    }
  }

  static getAllTickets(req, res, next) {
    try {
      const { status, priority, category, page, limit } = req.query;
      const result = TicketService.getAllTickets({
        status,
        priority,
        category,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10
      });

      return ApiResponse.success(
        res,
        'Tickets retrieved successfully.',
        result.tickets,
        200,
        result.pagination
      );
    } catch (err) {
      next(err);
    }
  }

  static getTicketById(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = TicketService.getTicketById(id);
      return ApiResponse.success(res, 'Ticket details retrieved successfully.', ticket, 200);
    } catch (err) {
      next(err);
    }
  }

  static getTicketByCode(req, res, next) {
    try {
      const { code } = req.params;
      const ticket = TicketService.getTicketByCode(code);
      return ApiResponse.success(res, 'Ticket details retrieved successfully.', ticket, 200);
    } catch (err) {
      next(err);
    }
  }

  static updateTicketStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updatedTicket = TicketService.updateTicketStatus(id, req.body);
      return ApiResponse.success(
        res,
        'Ticket status updated successfully.',
        updatedTicket,
        200
      );
    } catch (err) {
      next(err);
    }
  }

  static deleteTicket(req, res, next) {
    try {
      const { id } = req.params;
      TicketService.deleteTicket(id);
      return ApiResponse.success(res, 'Ticket deleted successfully.', null, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TicketController;
