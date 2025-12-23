import { defineConfig, loadEnv } from 'vite';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
      target: 'esnext',
    },
    define: {
      // Garante que o frontend acesse a chave via process.env.API_KEY conforme exigido pelo SDK
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '')
    }
  };
});