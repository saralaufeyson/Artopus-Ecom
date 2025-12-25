module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: false, // use CI to enable coverage run
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/tests/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 20000,
};