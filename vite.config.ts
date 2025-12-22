
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
    // Definimos apenas a chave específica de forma isolada para evitar vazamento do process.env completo
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});
