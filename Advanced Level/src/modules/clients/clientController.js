const ClientService = require('./clientService');
const ApiResponse = require('../../utils/apiResponse');

class ClientController {
  static createClient(req, res, next) {
    try {
      const { companyName, contactName, contactEmail, industry } = req.body;
      if (!companyName || !contactName || !contactEmail) {
        return ApiResponse.error(res, 'Company name, contact name, and contact email are required.', 400);
      }

      const client = ClientService.createClient({ companyName, contactName, contactEmail, industry }, req.user.id);
      return ApiResponse.success(res, 'Client profile created successfully.', client, 201);
    } catch (err) {
      next(err);
    }
  }

  static getClients(req, res, next) {
    try {
      const clients = ClientService.getClients();
      return ApiResponse.success(res, 'Client profiles retrieved successfully.', clients, 200);
    } catch (err) {
      next(err);
    }
  }

  static getClientById(req, res, next) {
    try {
      const client = ClientService.getClientById(req.params.id);
      return ApiResponse.success(res, 'Client profile details retrieved.', client, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ClientController;
