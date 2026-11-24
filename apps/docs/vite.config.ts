import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { aliases } from './aliases.ts';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: { alias: aliases },
});
