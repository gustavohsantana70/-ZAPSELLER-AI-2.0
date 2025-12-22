
import { defineConfig } from 'vite';

// Capturamos a chave de forma isolada e segura.
const envKey = String(process.env.API_KEY || "");

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    // Aumentamos o limite para 1600kb para evitar o aviso de tamanho de chunk
    // causado por bibliotecas pesadas como a do Google GenAI.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          genai: ['@google/genai']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@google/genai'],
  },
  define: {
    // Injeta apenas a string da chave, protegendo o restante do process.env
    'process.env.API_KEY': JSON.stringify(envKey)
  }
});
