/**
 * @fileoverview Unit tests for pure helpers in src/renderers/markdown.ts.
 *
 * `renderMarkdownToPdf` lives under tests/integration because it spawns
 * Chrome via crossnote; the front-matter manipulation helpers below
 * have no external dependencies and run in the default unit suite.
 */

import { describe, expect, it } from "vitest"
import matter from "gray-matter"
import { getPageNumberConfig, injectPageNumbering } from "../../src/renderers/markdown.js"

describe("getPageNumberConfig", () => {
  it("produces a Puppeteer-compatible header/footer config", () => {
    const cfg = getPageNumberConfig("doc.md")

    expect(cfg.displayHeaderFooter).toBe(true)
    expect(cfg.headerTemplate).toBe("<div></div>")
    expect(cfg.footerTemplate).toContain("pageNumber")
    expect(cfg.footerTemplate).toContain("totalPages")
    expect(cfg.margin).toEqual({
      top: "1cm",
      bottom: "1.5cm",
      left: "1cm",
      right: "1cm",
    })
  })

  it("HTML-escapes the filename in the footer template", () => {
    const cfg = getPageNumberConfig('<script>alert("xss")</script>.md')

    expect(cfg.footerTemplate).not.toContain("<script>")
    expect(cfg.footerTemplate).toContain("&lt;script&gt;")
    expect(cfg.footerTemplate).toContain("&quot;xss&quot;")
    expect(cfg.footerTemplate).toContain("&lt;/script&gt;")
  })

  it("includes the escaped filename verbatim for ordinary names", () => {
    const cfg = getPageNumberConfig("report.md")
    expect(cfg.footerTemplate).toContain("report.md")
  })
})

describe("injectPageNumbering", () => {
  it("adds chrome front-matter when none exists", () => {
    const result = injectPageNumbering("# Heading\n\nBody.\n", "doc.md")
    const { data, content } = matter(result)

    expect(data.chrome).toBeDefined()
    expect(data.chrome.displayHeaderFooter).toBe(true)
    expect(content.trim()).toBe("# Heading\n\nBody.")
  })

  it("merges chrome config with existing front-matter", () => {
    const input = `---
title: My Document
author: Test
---

# Heading
`
    const result = injectPageNumbering(input, "doc.md")
    const { data } = matter(result)

    expect(data.title).toBe("My Document")
    expect(data.author).toBe("Test")
    expect(data.chrome).toBeDefined()
    expect(data.chrome.displayHeaderFooter).toBe(true)
  })

  it("returns content unchanged when chrome front-matter already exists", () => {
    const input = `---
chrome:
  displayHeaderFooter: false
---

# Heading
`
    const result = injectPageNumbering(input, "doc.md")

    expect(result).toBe(input)
  })

  it("returns content unchanged when puppeteer front-matter exists", () => {
    const input = `---
puppeteer:
  headerTemplate: '<div>Custom</div>'
---

# Heading
`
    const result = injectPageNumbering(input, "doc.md")

    expect(result).toBe(input)
  })

  it("adds chrome front-matter when only an empty block is present", () => {
    const input = `---
---

# Heading
`
    const result = injectPageNumbering(input, "doc.md")
    const { data } = matter(result)

    expect(data.chrome).toBeDefined()
    expect(data.chrome.displayHeaderFooter).toBe(true)
  })

  it("escapes the filename into the injected footer template", () => {
    const result = injectPageNumbering("# Heading\n", '<svg/onload="x">.md')
    const { data } = matter(result)

    expect(data.chrome.footerTemplate).not.toContain('<svg/onload="x">')
    expect(data.chrome.footerTemplate).toContain("&lt;svg")
    expect(data.chrome.footerTemplate).toContain("&quot;x&quot;")
  })
})
