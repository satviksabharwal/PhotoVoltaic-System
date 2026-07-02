import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server stays on CRA's old port 3000 so existing CORS settings and
// Supabase auth redirect URLs keep working; the build keeps CRA's `build/`
// output directory so deploy configs need no changes.
export default defineConfig({
  plugins: [react()],
  server: { port: 3000, open: true },
  build: { outDir: 'build' },
});
