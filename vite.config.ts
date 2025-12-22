
import { defineConfig } from 'vite';

// A chave fornecida é injetada aqui. O sistema prioriza a variável de ambiente se existir.
const envKey = String(process.env.API_KEY || "AIzaSyAbGKJte4L0msR1tNDrFnWieGeeiC5JJVU");

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
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
    // Injeta a chave de forma global na aplicação
    'process.env.API_KEY': JSON.stringify(envKey)
  }
});
