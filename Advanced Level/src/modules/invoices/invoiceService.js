const db = require('../../config/database');
const AuditService = require('../../services/auditService');

class InvoiceService {
  static getInvoices() {
    return db.getCollection('invoices');
  }

  static getInvoiceById(id) {
    const invoices = db.getCollection('invoices');
    const invoice = invoices.find(i => i.id === parseInt(id, 10));
    if (!invoice) {
      const error = new Error(`Invoice with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return invoice;
  }

  static markAsPaid(invoiceId, userId) {
    const invoice = this.getInvoiceById(invoiceId);

    if (invoice.status === 'PAID') {
      const error = new Error('Invoice is already marked as PAID.');
      error.statusCode = 422;
      throw error;
    }

    invoice.status = 'PAID';
    invoice.paid_at = new Date().toISOString();

    db.save();

    AuditService.log({
      userId,
      action: 'INVOICE_PAID',
      entityType: 'INVOICE',
      entityId: invoice.id,
      details: { amount: invoice.amount, code: invoice.invoice_code }
    });

    return invoice;
  }
}

module.exports = InvoiceService;
