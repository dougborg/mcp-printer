/**
 * @fileoverview Shared helpers for integration tests that need to
 * round-trip a file through one of the renderers. Centralizes the
 * tests/tmp/ path derivation and the input-file + output-PDF cleanup
 * that every test was previously open-coding.
 */

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { expect } from "vitest"

const HERE = dirname(fileURLToPath(import.meta.url))

/** Absolute path of `tests/tmp/`, created on first import if missing. */
export const TMP_DIR = join(HERE, "..", "tmp")

if (!existsSync(TMP_DIR)) {
  mkdirSync(TMP_DIR, { recursive: true })
}

/**
 * Write `content` to `tests/tmp/<name>`, invoke `fn` with the
 * absolute path, then unlink the file. Cleanup runs whether `fn`
 * resolves or rejects.
 */
export async function withTempFile<T>(
  name: string,
  content: string,
  fn: (path: string) => Promise<T>
): Promise<T> {
  const filePath = join(TMP_DIR, name)
  writeFileSync(filePath, content, "utf-8")
  try {
    return await fn(filePath)
  } finally {
    try {
      unlinkSync(filePath)
    } catch {
      // best-effort
    }
  }
}

/**
 * Render `inputPath` through `render`, assert the resulting PDF
 * exists on disk, then unlink it. Returns the PDF path so callers
 * can make additional assertions before this helper deletes it (the
 * delete happens before return, so any post-call assertions must
 * not touch the file).
 */
export async function expectRenderedPdf(
  render: (path: string) => Promise<string>,
  inputPath: string
): Promise<string> {
  const pdfPath = await render(inputPath)
  expect(pdfPath).toBeDefined()
  expect(pdfPath).toContain(".pdf")
  expect(existsSync(pdfPath)).toBe(true)
  unlinkSync(pdfPath)
  return pdfPath
}
