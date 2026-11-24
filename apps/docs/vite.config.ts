import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { aliases } from './aliases.ts';
import { contentSecurityPolicy } from './csp.ts';

export default defineConfig({
  base: './',
  plugins: [react(), contentSecurityPolicy()],
  resolve: { alias: aliases },
  build: {
    rollupOptions: {
      output: {
        // Bibliotecas de terceiros em arquivos separados: cache melhor entre deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('prism-react-renderer')) return 'prism';
          if (id.includes('framer-motion') || id.includes('motion-')) return 'motion';
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor';
        },
      },
    },
  },
});
