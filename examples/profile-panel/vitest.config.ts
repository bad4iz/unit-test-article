import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.tsx'],
    mockReset: true,
    restoreMocks: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
