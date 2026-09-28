const db = require('../../config/database');
const AuditService = require('../../services/auditService');

class ClientService {
  static createClient({ companyName, contactName, contactEmail, industry }, userId) {
    const clients = db.getCollection('clients');

    if (clients.some(c => c.contact_email.toLowerCase() === contactEmail.toLowerCase())) {
      const error = new Error(`Client with email '${contactEmail}' already exists.`);
      error.statusCode = 409;
      throw error;
    }

    const newClient = {
      id: db.getNextId('clients'),
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail.toLowerCase(),
      industry: (industry || 'GENERAL').toUpperCase(),
      created_at: new Date().toISOString()
    };

    clients.push(newClient);
    db.save();

    AuditService.log({
      userId,
      action: 'CLIENT_CREATED',
      entityType: 'CLIENT',
      entityId: newClient.id,
      details: { companyName }
    });

    return newClient;
  }

  static getClients() {
    return db.getCollection('clients');
  }

  static getClientById(id) {
    const clients = db.getCollection('clients');
    const client = clients.find(c => c.id === parseInt(id, 10));
    if (!client) {
      const error = new Error(`Client profile with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return client;
  }
}

module.exports = ClientService;
