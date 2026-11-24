import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.ts', 'apps/*/vitest.config.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/sakura-ui/src/**/*.{ts,tsx}', 'apps/docs/src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/index.ts', '**/main.tsx', '**/*.d.ts'],
      reporter: ['text-summary', 'html', 'lcov'],
    },
  },
});
