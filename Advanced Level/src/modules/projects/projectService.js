const db = require('../../config/database');
const ClientService = require('../clients/clientService');
const AuditService = require('../../services/auditService');

class ProjectService {
  static createProject({ clientId, title, description, totalBudget }, userId) {
    // Check client exists
    ClientService.getClientById(clientId);

    const projects = db.getCollection('projects');
    const newProject = {
      id: db.getNextId('projects'),
      client_id: parseInt(clientId, 10),
      title,
      description: description || '',
      total_budget: parseFloat(totalBudget),
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };

    projects.push(newProject);
    db.save();

    AuditService.log({
      userId,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: newProject.id,
      details: { title, clientId }
    });

    return newProject;
  }

  static getProjects() {
    const projects = db.getCollection('projects');
    const milestones = db.getCollection('milestones');

    return projects.map(p => {
      const pMilestones = milestones.filter(m => m.project_id === p.id);
      const completedCount = pMilestones.filter(m => m.status === 'COMPLETED').length;
      const totalCount = pMilestones.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        ...p,
        total_milestones: totalCount,
        completed_milestones: completedCount,
        progress_percentage: progressPercent
      };
    });
  }

  static getProjectById(id) {
    const projects = db.getCollection('projects');
    const project = projects.find(p => p.id === parseInt(id, 10));

    if (!project) {
      const error = new Error(`Project with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const milestones = db.getCollection('milestones').filter(m => m.project_id === project.id);
    const completedCount = milestones.filter(m => m.status === 'COMPLETED').length;
    const totalCount = milestones.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      ...project,
      milestones,
      total_milestones: totalCount,
      completed_milestones: completedCount,
      progress_percentage: progressPercent
    };
  }

  static addMilestone(projectId, { title, dueDate, amount }, userId) {
    this.getProjectById(projectId); // validates existence

    const milestones = db.getCollection('milestones');
    const now = new Date().toISOString();
    const newMilestone = {
      id: db.getNextId('milestones'),
      project_id: parseInt(projectId, 10),
      title,
      due_date: dueDate,
      amount: parseFloat(amount),
      status: 'PLANNED',
      created_at: now,
      updated_at: now
    };

    milestones.push(newMilestone);
    db.save();

    AuditService.log({
      userId,
      action: 'MILESTONE_CREATED',
      entityType: 'MILESTONE',
      entityId: newMilestone.id,
      details: { projectId, title, amount }
    });

    return newMilestone;
  }

  static updateMilestoneStatus(milestoneId, status, userId) {
    const ALLOWED_STATUSES = ['PLANNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'];
    const newStatus = status.toUpperCase();

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      const error = new Error(`Invalid milestone status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const milestones = db.getCollection('milestones');
    const milestone = milestones.find(m => m.id === parseInt(milestoneId, 10));

    if (!milestone) {
      const error = new Error(`Milestone with ID ${milestoneId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = milestone.status;
    milestone.status = newStatus;
    milestone.updated_at = new Date().toISOString();

    db.save();

    AuditService.log({
      userId,
      action: 'MILESTONE_STATUS_UPDATED',
      entityType: 'MILESTONE',
      entityId: milestone.id,
      details: { previousStatus: oldStatus, newStatus }
    });

    return milestone;
  }
}

module.exports = ProjectService;
