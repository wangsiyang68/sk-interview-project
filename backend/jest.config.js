module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  verbose: true,
  testTimeout: 10000,
  // Ignore node_modules
  testPathIgnorePatterns: ['/node_modules/'],
};

