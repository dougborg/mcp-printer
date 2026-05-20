import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Test environment
    environment: "node",

    // Global test setup
    globals: true,

    // Default timeout for unit tests (5 seconds)
    // Integration tests override this via CLI flag in package.json scripts
    testTimeout: 5000,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/index.ts", // Entry point - just calls startServer
      ],
      // Conservative global floor that captures the current unit-only
      // baseline. As coverage grows (e.g., the dedicated config / utils
      // / batch-helpers tests in follow-up work), nudge these up to
      // lock in the gain — but keep a small buffer to avoid flaking on
      // noise.
      thresholds: {
        statements: 20,
        branches: 20,
        functions: 20,
        lines: 20,
      },
    },

    // Include and exclude patterns
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
  },
})
