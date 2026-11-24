import react from '@vitejs/plugin-react';
import { defineProject } from 'vitest/config';
import { aliases } from './aliases.ts';

export default defineProject({
  plugins: [react()],
  resolve: { alias: aliases },
  test: {
    name: 'docs',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['../../packages/sakura-ui/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
  },
});
