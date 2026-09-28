const ApiResponse = require('../utils/apiResponse');

const ALLOWED_CATEGORIES = ['BILLING', 'TECHNICAL', 'GENERAL', 'ACCOUNT', 'FEATURE_REQUEST'];
const ALLOWED_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const ALLOWED_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateCreateTicket(req, res, next) {
  const { customer_name, customer_email, category, priority, subject, description } = req.body;
  const errors = [];

  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length === 0) {
    errors.push({ field: 'customer_name', message: 'Customer name is required.' });
  }

  if (!customer_email || !isValidEmail(customer_email)) {
    errors.push({ field: 'customer_email', message: 'Valid customer email is required.' });
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category.toUpperCase())) {
    errors.push({ 
      field: 'category', 
      message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` 
    });
  }

  if (priority && !ALLOWED_PRIORITIES.includes(priority.toUpperCase())) {
    errors.push({ 
      field: 'priority', 
      message: `Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}` 
    });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 5) {
    errors.push({ field: 'subject', message: 'Subject is required and must be at least 5 characters long.' });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description is required and must be at least 10 characters long.' });
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation Error: Invalid input parameters', 400, errors);
  }

  next();
}

function validateUpdateStatus(req, res, next) {
  const { status, resolution_notes } = req.body;
  const errors = [];

  if (!status || !ALLOWED_STATUSES.includes(status.toUpperCase())) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`
    });
  }

  if ((status === 'RESOLVED' || status === 'CLOSED') && (!resolution_notes || resolution_notes.trim().length < 5)) {
    errors.push({
      field: 'resolution_notes',
      message: 'Resolution notes (at least 5 characters) are required when resolving or closing a ticket.'
    });
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation Error: Invalid status update parameters', 400, errors);
  }

  next();
}

module.exports = {
  validateCreateTicket,
  validateUpdateStatus
};
