const InvoiceService = require('./invoiceService');
const ApiResponse = require('../../utils/apiResponse');

class InvoiceController {
  static getInvoices(req, res, next) {
    try {
      const invoices = InvoiceService.getInvoices();
      return ApiResponse.success(res, 'Invoices retrieved successfully.', invoices, 200);
    } catch (err) {
      next(err);
    }
  }

  static getInvoiceById(req, res, next) {
    try {
      const invoice = InvoiceService.getInvoiceById(req.params.id);
      return ApiResponse.success(res, 'Invoice details retrieved.', invoice, 200);
    } catch (err) {
      next(err);
    }
  }

  static markAsPaid(req, res, next) {
    try {
      const invoice = InvoiceService.markAsPaid(req.params.id, req.user.id);
      return ApiResponse.success(res, 'Invoice payment recorded successfully.', invoice, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InvoiceController;
