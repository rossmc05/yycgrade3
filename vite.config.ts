import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the site works from https://<user>.github.io/<repo>/
// Two apps share the code: Grade 3 Quest (index.html) and the Big League Brains ballpark (ballpark.html).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { main: 'index.html', ballpark: 'ballpark.html' },
    },
  },
});
