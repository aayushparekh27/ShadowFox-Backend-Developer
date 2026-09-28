const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Support Ticket API Endpoints (Beginner Level)', () => {
  beforeEach(() => {
    db.resetForTest();
  });

  describe('POST /api/tickets', () => {
    it('should create a support ticket with valid data', async () => {
      const payload = {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        category: 'TECHNICAL',
        priority: 'HIGH',
        subject: 'Cannot login to account',
        description: 'Getting 500 error every time I try to submit login credentials.'
      };

      const res = await request(app)
        .post('/api/tickets')
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('ticket_code');
      expect(res.body.data.customer_name).toBe('John Doe');
      expect(res.body.data.status).toBe('OPEN');
    });

    it('should return 400 validation error for missing or invalid email', async () => {
      const payload = {
        customer_name: 'John Doe',
        customer_email: 'invalid-email',
        category: 'TECHNICAL',
        subject: 'Short',
        description: 'Short'
      };

      const res = await request(app)
        .post('/api/tickets')
        .send(payload);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/tickets', () => {
    it('should list all tickets with pagination meta', async () => {
      // Create a ticket first
      await request(app).post('/api/tickets').send({
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        category: 'BILLING',
        subject: 'Double charged on invoice',
        description: 'I noticed two charges of $50 on my credit card statement.'
      });

      const res = await request(app).get('/api/tickets');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta).toHaveProperty('total', 1);
    });
  });

  describe('PATCH /api/tickets/:id/status', () => {
    it('should update ticket status to RESOLVED with resolution notes', async () => {
      const ticketRes = await request(app).post('/api/tickets').send({
        customer_name: 'Bob Ross',
        customer_email: 'bob@example.com',
        category: 'GENERAL',
        subject: 'Inquiry about pricing plans',
        description: 'Where can I find annual plan discount rates?'
      });

      const ticketId = ticketRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .send({
          status: 'RESOLVED',
          resolution_notes: 'Sent pricing chart link via email.'
        });

      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.data.status).toBe('RESOLVED');
      expect(updateRes.body.data.resolution_notes).toBe('Sent pricing chart link via email.');
    });

    it('should reject status update if resolving without resolution notes', async () => {
      const ticketRes = await request(app).post('/api/tickets').send({
        customer_name: 'Bob Ross',
        customer_email: 'bob@example.com',
        category: 'GENERAL',
        subject: 'Inquiry about pricing plans',
        description: 'Where can I find annual plan discount rates?'
      });

      const ticketId = ticketRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/tickets/${ticketId}/status`)
        .send({
          status: 'RESOLVED'
        });

      expect(updateRes.statusCode).toEqual(400);
      expect(updateRes.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    it('should delete existing ticket', async () => {
      const ticketRes = await request(app).post('/api/tickets').send({
        customer_name: 'Bob Ross',
        customer_email: 'bob@example.com',
        category: 'GENERAL',
        subject: 'Inquiry about pricing plans',
        description: 'Where can I find annual plan discount rates?'
      });

      const ticketId = ticketRes.body.data.id;

      const delRes = await request(app).delete(`/api/tickets/${ticketId}`);
      expect(delRes.statusCode).toEqual(200);

      const getRes = await request(app).get(`/api/tickets/${ticketId}`);
      expect(getRes.statusCode).toEqual(404);
    });
  });
});
