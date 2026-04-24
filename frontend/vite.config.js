import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Lets `@/foo` resolve to `<root>/src/foo` in imports.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Forwards /api/* to the backend during dev so the browser never hits CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
