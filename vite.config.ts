import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the site works from https://<user>.github.io/<repo>/
// Three apps share the code: Grade 3 Quest (index.html), the Big League Brains ballpark (ballpark.html)
// and Unicorn Meadow for Kindergarten (unicorn.html).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { main: 'index.html', ballpark: 'ballpark.html', unicorn: 'unicorn.html' },
    },
  },
});
