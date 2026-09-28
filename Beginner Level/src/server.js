require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Support Ticket API Server running on port ${PORT}`);
  console.log(` API Docs available at http://localhost:${PORT}/api-docs`);
  console.log(` Health Check at http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
