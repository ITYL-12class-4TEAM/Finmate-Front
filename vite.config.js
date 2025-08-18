import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    historyApiFallback: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://54.180.75.58:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
