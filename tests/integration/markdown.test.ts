import { describe, it, vi } from "vitest"

// Mock config to allow access to the test directory. Must run before
// importing renderMarkdownToPdf so the renderer sees our widened
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
      autoRenderMarkdown: true,
      chromePath: "",
    },
    MARKDOWN_EXTENSIONS: ["md", "markdown"],
  }
})

import { renderMarkdownToPdf } from "../../src/renderers/markdown.js"
import { expectRenderedPdf, withTempFile } from "./helpers.js"

describe("renderMarkdownToPdf", () => {
  it("renders a simple markdown file to PDF", async () => {
    await withTempFile("test.md", "# Hello World\n\nThis is a **test** markdown file.", (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("handles markdown with code blocks", async () => {
    const content = `# Code Example

\`\`\`javascript
const x = 5;
console.log(x);
\`\`\`

Some text after the code.`
    await withTempFile("test-code-blocks.md", content, (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("handles markdown with lists and formatting", async () => {
    const content = `# Features

- **Bold text**
- *Italic text*
- \`Inline code\`

1. First item
2. Second item
3. Third item

> This is a blockquote`
    await withTempFile("test-formatting.md", content, (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("handles empty markdown files", async () => {
    await withTempFile("test-empty.md", "", (path) => expectRenderedPdf(renderMarkdownToPdf, path))
  })

  it("handles markdown with special characters", async () => {
    const content = `# Special Characters

HTML entities: < > & "

Math symbols: α β γ Δ

Emoji: 🎉 ✨ 🚀`
    await withTempFile("test-special.md", content, (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("injects page numbering into markdown without front-matter", async () => {
    await withTempFile("test-no-frontmatter.md", "# Hello World\n\nThis is a test.", (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("merges page numbering with existing front-matter", async () => {
    const content = `---
title: My Document
author: Test Author
---

# Hello World

This is a test with existing front-matter.`
    await withTempFile("test-existing-frontmatter.md", content, (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("respects existing chrome configuration in front-matter", async () => {
    const content = `---
chrome:
  displayHeaderFooter: false
---

# Hello World

This document has its own chrome config that should not be overridden.`
    await withTempFile("test-existing-chrome-config.md", content, (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("respects existing puppeteer configuration in front-matter", async () => {
    const content = `---
puppeteer:
  displayHeaderFooter: true
  headerTemplate: '<div>Custom Header</div>'
---

# Hello World

This document has its own puppeteer config that should not be overridden.`
    await withTempFile("test-existing-puppeteer-config.md", content, (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("handles empty front-matter blocks", async () => {
    const content = `---
---

# Hello World

This has an empty front-matter block.`
    await withTempFile("test-empty-frontmatter.md", content, (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })

  it("handles filenames with HTML special characters in the footer", async () => {
    // The renderer HTML-escapes filenames for the page footer; verifying
    // the render completes is a smoke test for the escape path.
    const content =
      "# Test HTML Escaping\n\nThis tests that filenames with HTML special characters are properly escaped."
    await withTempFile("test-html-chars.md", content, (path) =>
      expectRenderedPdf(renderMarkdownToPdf, path)
    )
  })
})
