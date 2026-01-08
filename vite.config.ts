import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // ✅ Indique à Vite que ton code source est dans le dossier "frontend"
  root: path.resolve(__dirname, 'frontend'),

  // ✅ Plugins React
  plugins: [react()],

  // ✅ Résolution des chemins absolus si tu veux faire des imports comme "@/pages/Home"
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend'),
    },
  },

  // ✅ Dépendances à exclure (ton cas)
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  // ✅ Configuration du build pour que la sortie soit propre
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  // ✅ Configuration du serveur local
  server: {
    port: 5173,
    open: true, // ouvre le navigateur automatiquement
  },
})
