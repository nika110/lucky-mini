import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	 build: {
    outDir: '../docs'  // This puts the build output in the docs folder
  },
  plugins: [react()]
});

