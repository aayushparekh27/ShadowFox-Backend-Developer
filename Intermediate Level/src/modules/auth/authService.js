const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../middleware/auth');

class AuthService {
  static register({ name, email, password, role = 'CUSTOMER' }) {
    const users = db.getCollection('users');

    // Check duplicate email
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      const error = new Error('User with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: db.getNextId('users'),
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    db.save();

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  }

  static login({ email, password }) {
    const users = db.getCollection('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static getProfile(userId) {
    const users = db.getCollection('users');
    const user = users.find(u => u.id === userId);

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = AuthService;
