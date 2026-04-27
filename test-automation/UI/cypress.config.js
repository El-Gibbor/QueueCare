const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    video: false,
    env: {
      apiUrl: 'http://localhost:3000',
    },
    setupNodeEvents() {},
    experimentalRunAllSpecs: true,
  },
});
