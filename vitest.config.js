import { defineConfig } from 'vitest/config';

// QA agent test config. Specs live under tests/ and bind to Support MD case IDs.
// The 'code' path is where the developers' team2-hackathon code gets mounted once
// it's available - point CODE_DIR (env) or the alias below at it and the same
// specs run against the real React modules instead of the contract oracle.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node', // switch to 'jsdom' for React component specs (needs @testing-library)
    globals: false,
    reporters: 'verbose',
  },
});
