const DeliverableService = require('./deliverableService');
const ApiResponse = require('../../utils/apiResponse');

class DeliverableController {
  static submitDeliverable(req, res, next) {
    try {
      const { milestoneId } = req.params;
      const { title, deliverableUrl, notes } = req.body;

      if (!title || !deliverableUrl) {
        return ApiResponse.error(res, 'Deliverable title and URL are required.', 400);
      }

      const deliverable = DeliverableService.submitDeliverable(milestoneId, { title, deliverableUrl, notes }, req.user.id);
      return ApiResponse.success(res, 'Deliverable submitted for review successfully.', deliverable, 201);
    } catch (err) {
      next(err);
    }
  }

  static getDeliverablesByMilestone(req, res, next) {
    try {
      const { milestoneId } = req.params;
      const deliverables = DeliverableService.getDeliverablesByMilestone(milestoneId);
      return ApiResponse.success(res, 'Deliverables retrieved.', deliverables, 200);
    } catch (err) {
      next(err);
    }
  }

  static reviewDeliverable(req, res, next) {
    try {
      const { id } = req.params;
      const { decision, feedbackNotes } = req.body;

      if (!decision) {
        return ApiResponse.error(res, "Review decision ('APPROVED' or 'REVISION_REQUESTED') is required.", 400);
      }

      const result = DeliverableService.reviewDeliverable(id, { decision, feedbackNotes }, req.user.id);
      return ApiResponse.success(res, `Deliverable review submitted: ${decision}`, result, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DeliverableController;
