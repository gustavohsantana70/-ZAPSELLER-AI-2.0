
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@google/genai'],
  },
  define: {
    'process.env': process.env
  }
});
