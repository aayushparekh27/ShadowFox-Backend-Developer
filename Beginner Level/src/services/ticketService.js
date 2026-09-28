const TicketModel = require('../models/ticketModel');

class TicketService {
  static createTicket(ticketData) {
    return TicketModel.create(ticketData);
  }

  static getTicketById(id) {
    const ticket = TicketModel.findById(id);
    if (!ticket) {
      const error = new Error(`Support ticket with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return ticket;
  }

  static getTicketByCode(ticketCode) {
    const ticket = TicketModel.findByCode(ticketCode);
    if (!ticket) {
      const error = new Error(`Support ticket with code ${ticketCode} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return ticket;
  }

  static getAllTickets(queryParams) {
    return TicketModel.findAll(queryParams);
  }

  static updateTicketStatus(id, updateData) {
    // Check if ticket exists
    const existingTicket = this.getTicketById(id);

    // Business Logic: Valid state transitions
    const currentStatus = existingTicket.status;
    const newStatus = updateData.status.toUpperCase();

    if (currentStatus === 'CLOSED' && newStatus !== 'CLOSED') {
      const error = new Error('Closed tickets cannot be reopened or modified.');
      error.statusCode = 422;
      throw error;
    }

    return TicketModel.updateStatus(id, updateData);
  }

  static deleteTicket(id) {
    // Check if ticket exists
    this.getTicketById(id);
    return TicketModel.delete(id);
  }
}

module.exports = TicketService;
