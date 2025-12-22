
import { defineConfig } from 'vite';

// Capturamos apenas o valor da string. 
// Ao fazer isso fora do 'define', evitamos que o Vite tente mapear o objeto process.env inteiro.
const envKey = String(process.env.API_KEY || "");

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
    // Substituição cirúrgica: o código verá apenas o valor da string, 
    // sem nunca acessar o objeto process.env do seu computador em tempo de execução.
    'process.env.API_KEY': JSON.stringify(envKey)
  }
});
