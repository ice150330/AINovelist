import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**']
  },
  resolve: {
    alias: {
      '@ainovelist/schema': new URL('./packages/schema/src/index.ts', import.meta.url).pathname,
      '@ainovelist/core': new URL('./packages/core/src/index.ts', import.meta.url).pathname
    }
  }
})
