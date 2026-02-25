import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cuayo-interactive/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
});
