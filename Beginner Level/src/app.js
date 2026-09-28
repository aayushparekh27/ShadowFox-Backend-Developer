const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const ticketRoutes = require('./routes/ticketRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend UI
app.use(express.static(path.join(__dirname, '../public')));

// Serve Swagger Documentation if swagger.yaml exists
try {
  const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
  const swaggerDocument = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn('Swagger documentation file not found or invalid YAML:', err.message);
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Support Ticket API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/tickets', ticketRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
