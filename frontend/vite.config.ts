import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // 👉 On laisse la racine par défaut : le dossier où se trouve ce fichier (frontend)
  plugins: [react()],

  resolve: {
    alias: {
      // Tu peux utiliser "@/pages/Truc" si tu veux
      '@': path.resolve(__dirname, '.'),
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    outDir: 'dist',      // suffisant, relatif à frontend
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    open: true,
  },
});
