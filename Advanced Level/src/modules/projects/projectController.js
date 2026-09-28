const ProjectService = require('./projectService');
const ApiResponse = require('../../utils/apiResponse');

class ProjectController {
  static createProject(req, res, next) {
    try {
      const { clientId, title, description, totalBudget } = req.body;
      if (!clientId || !title || !totalBudget) {
        return ApiResponse.error(res, 'Client ID, project title, and total budget are required.', 400);
      }

      const project = ProjectService.createProject({ clientId, title, description, totalBudget }, req.user.id);
      return ApiResponse.success(res, 'Project created successfully.', project, 201);
    } catch (err) {
      next(err);
    }
  }

  static getProjects(req, res, next) {
    try {
      const projects = ProjectService.getProjects();
      return ApiResponse.success(res, 'Projects portfolio retrieved.', projects, 200);
    } catch (err) {
      next(err);
    }
  }

  static getProjectById(req, res, next) {
    try {
      const project = ProjectService.getProjectById(req.params.id);
      return ApiResponse.success(res, 'Project details retrieved.', project, 200);
    } catch (err) {
      next(err);
    }
  }

  static addMilestone(req, res, next) {
    try {
      const { projectId } = req.params;
      const { title, dueDate, amount } = req.body;

      if (!title || !dueDate || !amount) {
        return ApiResponse.error(res, 'Milestone title, due date, and amount are required.', 400);
      }

      const milestone = ProjectService.addMilestone(projectId, { title, dueDate, amount }, req.user.id);
      return ApiResponse.success(res, 'Milestone added to project successfully.', milestone, 201);
    } catch (err) {
      next(err);
    }
  }

  static updateMilestoneStatus(req, res, next) {
    try {
      const { milestoneId } = req.params;
      const { status } = req.body;

      if (!status) {
        return ApiResponse.error(res, 'Milestone status parameter is required.', 400);
      }

      const updated = ProjectService.updateMilestoneStatus(milestoneId, status, req.user.id);
      return ApiResponse.success(res, 'Milestone status updated successfully.', updated, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProjectController;
