
import { defineConfig } from 'vite';

// Extraímos apenas o valor necessário antes de definir a config.
// Isso evita que o esbuild acesse o objeto process.env como um todo durante o mapeamento.
const API_KEY = process.env.API_KEY || "";

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
    // Substituição literal e isolada. 
    // Não usamos 'process.env': { ... } para evitar o aviso de segurança do PATH.
    'process.env.API_KEY': JSON.stringify(API_KEY)
  }
});
