module.exports = {
  // Flag to indicate if Code Coverage to be collected and reported
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage
  // information should be collected
  collectCoverageFrom: ['src/**/*.{js,jsx,mjs}'],

  testPathIgnorePatterns: ['/build/'],
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/routes/',
    '/src/app.js'
  ]
}
