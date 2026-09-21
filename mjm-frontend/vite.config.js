import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const getBuildInfo = () => {
  let commitHash = 'latest';
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    commitHash = 'dev';
  }

  const now = new Date();
  const publishDate = now.toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return { commitHash, publishDate };
};

const buildInfo = getBuildInfo();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_PUBLISH_TIME__: JSON.stringify(buildInfo.publishDate),
    __APP_COMMIT_HASH__: JSON.stringify(buildInfo.commitHash),
  },
  build: {
    chunkSizeWarningLimit: 800,
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(dep => !dep.includes('charts'));
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react')) {
              return 'vendor-react';
            }
            return 'vendor-libs';
          }
        },
      },
    },
  },
})

