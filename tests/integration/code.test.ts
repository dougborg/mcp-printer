/**
 * @fileoverview Integration tests for code → PDF rendering. Pure
 * helpers from src/renderers/code.ts (language mapping, span fixing)
 * live in tests/unit/code.test.ts; only the Chrome-driven path is
 * exercised here.
 */

import { describe, it, vi } from "vitest"

// Mock config to allow access to the test directory. Must run before
// importing renderCodeToPdf so the renderer sees our widened
// allowedPaths.
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
import { expectRenderedPdf, withTempFile } from "./helpers.js"

describe("renderCodeToPdf", () => {
  it("renders a simple JavaScript file to PDF", async () => {
    await withTempFile("test-code.js", "const x = 5;\nconsole.log(x);", (path) =>
      expectRenderedPdf(renderCodeToPdf, path)
    )
  })

  it("handles different languages", async () => {
    await withTempFile("test-code.py", 'def hello():\n    print("Hello")', (path) =>
      expectRenderedPdf(renderCodeToPdf, path)
    )
  })

  it("respects the lineNumbers option in both directions", async () => {
    await withTempFile("test-code.ts", "const y = 10;", async (path) => {
      await expectRenderedPdf((p) => renderCodeToPdf(p, { lineNumbers: true }), path)
      await expectRenderedPdf((p) => renderCodeToPdf(p, { lineNumbers: false }), path)
    })
  })

  it("handles empty files", async () => {
    await withTempFile("test-empty.js", "", (path) => expectRenderedPdf(renderCodeToPdf, path))
  })

  it("handles files with HTML special characters in the source", async () => {
    await withTempFile(
      "test-special-chars.js",
      'const str = "Hello <world> & \\"quotes\\"";',
      (path) => expectRenderedPdf(renderCodeToPdf, path)
    )
  })
})
