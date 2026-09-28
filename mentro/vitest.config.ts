/// <reference types="vitest/config" />
import { defineConfig, mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default defineConfig((env) =>
  mergeConfig(viteConfig(env), {
    test: {
      globals: false,
      environment: 'node',
      passWithNoTests: false,
    },
  })
);
