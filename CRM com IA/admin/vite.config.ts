import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { evolutionDevProxy } from "./vite-evolution-dev";
import { blogDevPublish } from "./vite-blog-dev";
import { cursosDevPublish } from "./vite-cursos-dev";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/admin/",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/assets": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        bypass: (req) => {
          if (req.url && req.url.startsWith("/assets/imagens/")) {
            return req.url;
          }
        },
      },
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    evolutionDevProxy(),
    blogDevPublish(),
    cursosDevPublish(),
    {
      name: 'redirect-to-admin-slash',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ? req.url.split('?')[0] : '';
          if (url === '/admin') {
            const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
            res.writeHead(301, { Location: '/admin/' + query });
            res.end();
            return;
          }
          next();
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../../dist/admin",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
}));

