const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('ClientPulse Enterprise API (Advanced Level)', () => {
  let adminToken = '';
  let freelancerToken = '';
  let clientToken = '';

  beforeEach(async () => {
    db.resetForTest();

    // Login Admin
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@agency.com',
      password: 'AdminPass123!'
    });
    adminToken = adminLogin.body.data.token;

    // Login Freelancer
    const freelancerLogin = await request(app).post('/api/auth/login').send({
      email: 'freelancer@agency.com',
      password: 'FreelancerPass123!'
    });
    freelancerToken = freelancerLogin.body.data.token;

    // Login Client
    const clientLogin = await request(app).post('/api/auth/login').send({
      email: 'client@acme.com',
      password: 'ClientPass123!'
    });
    clientToken = clientLogin.body.data.token;
  });

  describe('Client & Project Onboarding', () => {
    it('should allow Agency Admin to create a client profile', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: 'Wayne Enterprises',
          contactName: 'Bruce Wayne',
          contactEmail: 'bruce@wayne.com',
          industry: 'DEFENSE'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.company_name).toBe('Wayne Enterprises');
    });

    it('should reject client creation from a Client user (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          companyName: 'Unauthorized Corp',
          contactName: 'Hacker',
          contactEmail: 'hacker@anon.com'
        });

      expect(res.statusCode).toEqual(403);
    });

    it('should calculate project completion progress percentage correctly', async () => {
      const res = await request(app)
        .get('/api/projects/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('progress_percentage');
      expect(res.body.data.total_milestones).toBe(2);
    });
  });

  describe('Deliverable Submission & Client Review Workflow', () => {
    it('should allow Freelancer to submit a deliverable for a milestone', async () => {
      const res = await request(app)
        .post('/api/milestones/1/deliverables')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          title: 'Authentication Microservice PR',
          deliverableUrl: 'https://github.com/agency/project/pull/1',
          notes: 'Implemented OAuth2 and JWT authentication.'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.review_status).toBe('PENDING_REVIEW');

      // Verify milestone status updated to UNDER_REVIEW
      const projectRes = await request(app)
        .get('/api/projects/1')
        .set('Authorization', `Bearer ${adminToken}`);
      const milestone = projectRes.body.data.milestones.find(m => m.id === 1);
      expect(milestone.status).toBe('UNDER_REVIEW');
    });

    it('should complete milestone and auto-generate invoice when Client approves deliverable', async () => {
      // 1. Submit deliverable
      const subRes = await request(app)
        .post('/api/milestones/1/deliverables')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          title: 'Database Schema Migration',
          deliverableUrl: 'https://github.com/agency/project/pull/2'
        });

      const deliverableId = subRes.body.data.id;

      // 2. Client Reviews & Approves
      const reviewRes = await request(app)
        .post(`/api/deliverables/${deliverableId}/review`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          decision: 'APPROVED',
          feedbackNotes: 'Staging deployment verified. Approved!'
        });

      expect(reviewRes.statusCode).toEqual(200);
      expect(reviewRes.body.data.milestone_status).toBe('COMPLETED');
      expect(reviewRes.body.data).toHaveProperty('generated_invoice');
      expect(reviewRes.body.data.generated_invoice.status).toBe('UNPAID');

      // 3. Verify Invoice appears in /api/invoices list
      const invRes = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(invRes.body.data.length).toBeGreaterThan(0);
    });

    it('should reset milestone to IN_PROGRESS when Client requests revisions', async () => {
      // 1. Submit deliverable
      const subRes = await request(app)
        .post('/api/milestones/1/deliverables')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          title: 'UI Mockups',
          deliverableUrl: 'https://figma.com/file/123'
        });

      const deliverableId = subRes.body.data.id;

      // 2. Client Requests Revision
      const reviewRes = await request(app)
        .post(`/api/deliverables/${deliverableId}/review`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          decision: 'REVISION_REQUESTED',
          feedbackNotes: 'Please change dark mode contrast ratios.'
        });

      expect(reviewRes.statusCode).toEqual(200);
      expect(reviewRes.body.data.milestone_status).toBe('IN_PROGRESS');
      expect(reviewRes.body.data.generated_invoice).toBeNull();
    });
  });

  describe('Audit Logging & Compliance', () => {
    it('should generate audit trail logs for key system events', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
