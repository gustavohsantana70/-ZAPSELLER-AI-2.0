
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
    // Garante que o process.env.API_KEY esteja disponível no navegador
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
