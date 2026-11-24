import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      entryRoot: 'src',
      bundleTypes: true,
      outDirs: ['dist', { dir: 'dist', moduleFormat: 'cjs' }],
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      cssFileName: 'styles',
    },
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'framer-motion',
        'lucide-react',
        /^framer-motion\//,
        /^lucide-react\//,
      ],
      output: {
        banner: "'use client';",
      },
    },
  },
});
