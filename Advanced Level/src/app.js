const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const authRoutes = require('./modules/auth/authRoutes');
const clientRoutes = require('./modules/clients/clientRoutes');
const projectRoutes = require('./modules/projects/projectRoutes');
const deliverableRoutes = require('./modules/deliverables/deliverableRoutes');
const invoiceRoutes = require('./modules/invoices/invoiceRoutes');
const auditRoutes = require('./modules/audit/auditRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend UI
app.use(express.static(path.join(__dirname, '../public')));

// Swagger UI Setup
try {
  const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
  const swaggerDocument = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn('Swagger documentation file not found or invalid YAML:', err.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'ClientPulse Management Platform API (Advanced Level)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', deliverableRoutes); // Mounted at /api for deliverables & milestone deliverables
app.use('/api/invoices', invoiceRoutes);
app.use('/api/audit-logs', auditRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
