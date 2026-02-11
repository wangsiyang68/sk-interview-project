require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3001;

// Start server
async function startServer() {
  // Test database connection - exit if not available
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('❌ Cannot start server: Database connection required');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/incidents`);
  });
}

startServer();
