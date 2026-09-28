const db = require('../config/database');
const crypto = require('crypto');

class TicketModel {
  static generateTicketCode() {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `TCK-${Date.now().toString().slice(-6)}-${randomHex}`;
  }

  static create(ticketData) {
    const { customer_name, customer_email, category, priority = 'MEDIUM', subject, description } = ticketData;
    const tickets = db.getCollection('tickets');
    
    const now = new Date().toISOString();
    const newTicket = {
      id: db.getNextId('tickets'),
      ticket_code: this.generateTicketCode(),
      customer_name,
      customer_email,
      category: category.toUpperCase(),
      priority: (priority || 'MEDIUM').toUpperCase(),
      subject,
      description,
      status: 'OPEN',
      resolution_notes: null,
      created_at: now,
      updated_at: now
    };

    tickets.push(newTicket);
    db.save();
    return newTicket;
  }

  static findById(id) {
    const tickets = db.getCollection('tickets');
    return tickets.find(t => t.id === Number(id)) || null;
  }

  static findByCode(ticketCode) {
    const tickets = db.getCollection('tickets');
    return tickets.find(t => t.ticket_code === ticketCode) || null;
  }

  static findAll({ status, priority, category, page = 1, limit = 10 }) {
    let tickets = db.getCollection('tickets');

    if (status) {
      tickets = tickets.filter(t => t.status === status.toUpperCase());
    }

    if (priority) {
      tickets = tickets.filter(t => t.priority === priority.toUpperCase());
    }

    if (category) {
      tickets = tickets.filter(t => t.category === category.toUpperCase());
    }

    const total = tickets.length;
    
    // Sort descending by created_at
    tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const offset = (page - 1) * limit;
    const paginatedTickets = tickets.slice(offset, offset + Number(limit));

    return {
      tickets: paginatedTickets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  static updateStatus(id, { status, resolution_notes }) {
    const tickets = db.getCollection('tickets');
    const ticket = tickets.find(t => t.id === Number(id));

    if (!ticket) return null;

    ticket.status = status.toUpperCase();
    if (resolution_notes) {
      ticket.resolution_notes = resolution_notes;
    }
    ticket.updated_at = new Date().toISOString();

    db.save();
    return ticket;
  }

  static delete(id) {
    const tickets = db.getCollection('tickets');
    const index = tickets.findIndex(t => t.id === Number(id));

    if (index === -1) return false;

    tickets.splice(index, 1);
    db.save();
    return true;
  }
}

module.exports = TicketModel;
