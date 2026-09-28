const express = require('express');
const router = express.Router();
const ProjectController = require('./projectController');
const { authenticateJWT, authorize } = require('../../middleware/auth');

router.use(authenticateJWT);

// Project management routes
router.post('/', authorize(['AGENCY_ADMIN']), ProjectController.createProject);
router.get('/', authorize(['AGENCY_ADMIN', 'FREELANCER', 'CLIENT']), ProjectController.getProjects);
router.get('/:id', authorize(['AGENCY_ADMIN', 'FREELANCER', 'CLIENT']), ProjectController.getProjectById);

// Milestone routes
router.post('/:projectId/milestones', authorize(['AGENCY_ADMIN']), ProjectController.addMilestone);
router.patch('/milestones/:milestoneId/status', authorize(['AGENCY_ADMIN', 'FREELANCER']), ProjectController.updateMilestoneStatus);

module.exports = router;
