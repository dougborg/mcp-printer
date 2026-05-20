/**
 * @fileoverview Integration tests for code → PDF rendering. Pure
 * helpers from src/renderers/code.ts (language mapping, span fixing)
 * live in tests/unit/code.test.ts; only the Chrome-driven path is
 * exercised here.
 */

import { describe, it, expect, vi } from "vitest"
import { unlinkSync } from "fs"

// Mock config to allow access to test directory
vi.mock("../../src/config.js", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { dirname, join } = require("path")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fileURLToPath } = require("url")
  const mockTestDir = join(dirname(fileURLToPath(import.meta.url)), "..")

  return {
    config: {
      allowedPaths: [mockTestDir],
      deniedPaths: [],
      autoRenderCode: true,
      chromePath: "",
      code: {
        excludeExtensions: [],
        colorScheme: "atom-one-light",
        enableLineNumbers: true,
        fontSize: "10pt",
        lineSpacing: "1.5",
      },
    },
    MARKDOWN_EXTENSIONS: ["md", "markdown"],
  }
})

import { renderCodeToPdf } from "../../src/renderers/code.js"

describe("renderCodeToPdf", () => {
  it("should render a simple JavaScript file to PDF", async () => {
    // Create a simple test file in the test tmp directory
    const { writeFileSync } = await import("fs")
    const { join, dirname } = await import("path")
    const { fileURLToPath } = await import("url")

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const testFile = join(__dirname, "../tmp/test-code.js")
    writeFileSync(testFile, "const x = 5;\nconsole.log(x);", "utf-8")

    try {
      const pdfPath = await renderCodeToPdf(testFile)

      // Check that PDF was created
      expect(pdfPath).toBeDefined()
      expect(pdfPath).toContain(".pdf")

      // Check that file exists
      const { existsSync } = await import("fs")
      expect(existsSync(pdfPath)).toBe(true)

      // Clean up
      unlinkSync(pdfPath)
      unlinkSync(testFile)
    } catch (error) {
      // Clean up on error
      try {
        unlinkSync(testFile)
      } catch {}
      throw error
    }
  })

  it("should handle different languages", async () => {
    const { writeFileSync } = await import("fs")
    const { join, dirname } = await import("path")
    const { fileURLToPath } = await import("url")

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const testFile = join(__dirname, "../tmp/test-code.py")
    writeFileSync(testFile, 'def hello():\n    print("Hello")', "utf-8")

    try {
      const pdfPath = await renderCodeToPdf(testFile)
      expect(pdfPath).toBeDefined()

      // Clean up
      unlinkSync(pdfPath)
      unlinkSync(testFile)
    } catch (error) {
      try {
        unlinkSync(testFile)
      } catch {}
      throw error
    }
  })

  it("should respect line numbers parameter", async () => {
    const { writeFileSync } = await import("fs")
    const { join, dirname } = await import("path")
    const { fileURLToPath } = await import("url")

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const testFile = join(__dirname, "../tmp/test-code.ts")
    writeFileSync(testFile, "const y = 10;", "utf-8")

    try {
      // With line numbers
      const pdfWithNumbers = await renderCodeToPdf(testFile, { lineNumbers: true })
      expect(pdfWithNumbers).toBeDefined()
      unlinkSync(pdfWithNumbers)

      // Without line numbers
      const pdfWithoutNumbers = await renderCodeToPdf(testFile, { lineNumbers: false })
      expect(pdfWithoutNumbers).toBeDefined()
      unlinkSync(pdfWithoutNumbers)

      unlinkSync(testFile)
    } catch (error) {
      try {
        unlinkSync(testFile)
      } catch {}
      throw error
    }
  })

  it("should handle empty files", async () => {
    const { writeFileSync } = await import("fs")
    const { join, dirname } = await import("path")
    const { fileURLToPath } = await import("url")

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const testFile = join(__dirname, "../tmp/test-empty.js")
    writeFileSync(testFile, "", "utf-8")

    try {
      const pdfPath = await renderCodeToPdf(testFile)
      expect(pdfPath).toBeDefined()

      unlinkSync(pdfPath)
      unlinkSync(testFile)
    } catch (error) {
      try {
        unlinkSync(testFile)
      } catch {}
      throw error
    }
  })

  it("should handle files with special characters", async () => {
    const { writeFileSync } = await import("fs")
    const { join, dirname } = await import("path")
    const { fileURLToPath } = await import("url")

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const testFile = join(__dirname, "../tmp/test-special-chars.js")
    writeFileSync(testFile, 'const str = "Hello <world> & \"quotes\"";', "utf-8")

    try {
      const pdfPath = await renderCodeToPdf(testFile)
      expect(pdfPath).toBeDefined()

      unlinkSync(pdfPath)
      unlinkSync(testFile)
    } catch (error) {
      try {
        unlinkSync(testFile)
      } catch {}
      throw error
    }
  })
})
