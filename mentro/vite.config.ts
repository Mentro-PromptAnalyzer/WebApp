import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { validateBuildEnvironment } from './build-environment';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    validateBuildEnvironment({ ...loadEnv(mode, process.cwd(), ''), ...process.env } as Record<
      string,
      string
    >);
  }
  return { plugins: [react(), tailwindcss()] };
});
