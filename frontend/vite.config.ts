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
    host: '0.0.0.0', // Permet l'accès depuis l'extérieur
    port: 5173,
    open: false, // Désactivé pour Manus
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
