const express = require('express');
const router = express.Router();
const DeliverableController = require('./deliverableController');
const { authenticateJWT, authorize } = require('../../middleware/auth');

router.use(authenticateJWT);

// Submit deliverable for milestone
router.post('/milestones/:milestoneId/deliverables', authorize(['FREELANCER', 'AGENCY_ADMIN']), DeliverableController.submitDeliverable);

// Get deliverables for milestone
router.get('/milestones/:milestoneId/deliverables', authorize(['AGENCY_ADMIN', 'FREELANCER', 'CLIENT']), DeliverableController.getDeliverablesByMilestone);

// Client or Admin review deliverable (APPROVED / REVISION_REQUESTED)
router.post('/deliverables/:id/review', authorize(['CLIENT', 'AGENCY_ADMIN']), DeliverableController.reviewDeliverable);

module.exports = router;
