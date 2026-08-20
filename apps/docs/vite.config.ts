import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 20011,
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.turbo/**'],
    },
  },
});
