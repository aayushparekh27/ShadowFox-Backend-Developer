const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../middleware/auth');
const AuditService = require('../../services/auditService');

class AuthService {
  static register({ name, email, password, role = 'CLIENT' }) {
    const users = db.getCollection('users');

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      const error = new Error(`User with email '${email}' is already registered.`);
      error.statusCode = 409;
      throw error;
    }

    const VALID_ROLES = ['AGENCY_ADMIN', 'FREELANCER', 'CLIENT'];
    const userRole = VALID_ROLES.includes(role) ? role : 'CLIENT';

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: db.getNextId('users'),
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      role: userRole,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    db.save();

    AuditService.log({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: newUser.id,
      details: { role: newUser.role }
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPass } = newUser;
    return { user: userWithoutPass, token };
  }

  static login({ email, password }) {
    const users = db.getCollection('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.password)) {
      const error = new Error('Invalid email credentials or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    AuditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id
    });

    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  static getProfile(userId) {
    const users = db.getCollection('users');
    const user = users.find(u => u.id === userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    const { password: _, ...userWithoutPass } = user;
    return userWithoutPass;
  }
}

module.exports = AuthService;
