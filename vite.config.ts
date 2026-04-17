import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function safeCopyPublicPlugin() {
  return {
    name: 'safe-copy-public',
    apply: 'build' as const,
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');

      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

      function copyDirSafe(src: string, dest: string) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        let entries: fs.Dirent[] = [];
        try {
          entries = fs.readdirSync(src, { withFileTypes: true });
        } catch {
          return;
        }
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          try {
            if (entry.isDirectory()) {
              copyDirSafe(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          } catch {
            console.warn(`[safe-copy-public] Skipped inaccessible file: ${entry.name}`);
          }
        }
      }

      copyDirSafe(publicDir, distDir);
    }
  };
}

export default defineConfig({
  plugins: [react(), safeCopyPublicPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    copyPublicDir: false,
  },
});
