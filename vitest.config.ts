import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['src-app/**/*.test.tsx', 'jsdom']
    ],
    include: ['packages/**/*.test.ts', 'src-app/**/*.test.ts', 'src-app/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**']
  },
  resolve: {
    alias: {
      '@ainovelist/schema': new URL('./packages/schema/src/index.ts', import.meta.url).pathname,
      '@ainovelist/core': new URL('./packages/core/src/index.ts', import.meta.url).pathname
    }
  }
})
