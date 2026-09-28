const db = require('../../config/database');
const ProjectService = require('../projects/projectService');
const AuditService = require('../../services/auditService');
const crypto = require('crypto');

class DeliverableService {
  static generateInvoiceCode() {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `INV-${Date.now().toString().slice(-6)}-${randomHex}`;
  }

  static submitDeliverable(milestoneId, { title, deliverableUrl, notes }, userId) {
    const milestones = db.getCollection('milestones');
    const milestone = milestones.find(m => m.id === parseInt(milestoneId, 10));

    if (!milestone) {
      const error = new Error(`Milestone with ID ${milestoneId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (milestone.status === 'COMPLETED') {
      const error = new Error('Cannot submit deliverables for an already completed milestone.');
      error.statusCode = 422;
      throw error;
    }

    const deliverables = db.getCollection('deliverables');
    const now = new Date().toISOString();
    const newDeliverable = {
      id: db.getNextId('deliverables'),
      milestone_id: milestone.id,
      submitted_by: userId,
      title,
      deliverable_url: deliverableUrl,
      notes: notes || '',
      review_status: 'PENDING_REVIEW', // PENDING_REVIEW, APPROVED, REVISION_REQUESTED
      feedback_notes: null,
      reviewed_at: null,
      created_at: now
    };

    deliverables.push(newDeliverable);

    // Automatically update milestone status to UNDER_REVIEW
    milestone.status = 'UNDER_REVIEW';
    milestone.updated_at = now;

    db.save();

    AuditService.log({
      userId,
      action: 'DELIVERABLE_SUBMITTED',
      entityType: 'DELIVERABLE',
      entityId: newDeliverable.id,
      details: { milestoneId: milestone.id, title, deliverableUrl }
    });

    return newDeliverable;
  }

  static getDeliverablesByMilestone(milestoneId) {
    const deliverables = db.getCollection('deliverables');
    return deliverables.filter(d => d.milestone_id === parseInt(milestoneId, 10));
  }

  static reviewDeliverable(deliverableId, { decision, feedbackNotes }, reviewerUserId) {
    const VALID_DECISIONS = ['APPROVED', 'REVISION_REQUESTED'];
    const reviewDecision = decision.toUpperCase();

    if (!VALID_DECISIONS.includes(reviewDecision)) {
      const error = new Error(`Invalid decision. Must be 'APPROVED' or 'REVISION_REQUESTED'.`);
      error.statusCode = 400;
      throw error;
    }

    const deliverables = db.getCollection('deliverables');
    const deliverable = deliverables.find(d => d.id === parseInt(deliverableId, 10));

    if (!deliverable) {
      const error = new Error(`Deliverable with ID ${deliverableId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const milestones = db.getCollection('milestones');
    const milestone = milestones.find(m => m.id === deliverable.milestone_id);
    const now = new Date().toISOString();

    deliverable.review_status = reviewDecision;
    deliverable.feedback_notes = feedbackNotes || (reviewDecision === 'APPROVED' ? 'Approved by client.' : 'Revisions requested.');
    deliverable.reviewed_at = now;

    let generatedInvoice = null;

    if (reviewDecision === 'APPROVED') {
      // 1. Mark milestone COMPLETED
      milestone.status = 'COMPLETED';
      milestone.updated_at = now;

      // 2. Automated Milestone Invoice Generation
      const invoices = db.getCollection('invoices');
      const invoiceDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      generatedInvoice = {
        id: db.getNextId('invoices'),
        invoice_code: this.generateInvoiceCode(),
        milestone_id: milestone.id,
        project_id: milestone.project_id,
        amount: milestone.amount,
        status: 'UNPAID',
        due_date: invoiceDueDate,
        created_at: now,
        paid_at: null
      };

      invoices.push(generatedInvoice);

      AuditService.log({
        userId: reviewerUserId,
        action: 'DELIVERABLE_APPROVED',
        entityType: 'DELIVERABLE',
        entityId: deliverable.id
      });

      AuditService.log({
        userId: reviewerUserId,
        action: 'MILESTONE_COMPLETED',
        entityType: 'MILESTONE',
        entityId: milestone.id
      });

      AuditService.log({
        userId: reviewerUserId,
        action: 'INVOICE_GENERATED',
        entityType: 'INVOICE',
        entityId: generatedInvoice.id,
        details: { amount: generatedInvoice.amount, code: generatedInvoice.invoice_code }
      });
    } else {
      // REVISION_REQUESTED: Update milestone status back to IN_PROGRESS
      milestone.status = 'IN_PROGRESS';
      milestone.updated_at = now;

      AuditService.log({
        userId: reviewerUserId,
        action: 'REVISION_REQUESTED',
        entityType: 'DELIVERABLE',
        entityId: deliverable.id,
        details: { feedbackNotes }
      });
    }

    db.save();

    return {
      deliverable,
      milestone_status: milestone.status,
      generated_invoice: generatedInvoice
    };
  }
}

module.exports = DeliverableService;
