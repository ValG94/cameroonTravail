// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js', 'src/**/*.test.js'],
    globals: true, // pour éviter d’importer describe/it/expect
    watch: false,
    reporters: 'default',
  },
});
