/**
 * @fileoverview Unit tests for pure helpers in src/renderers/code.ts.
 *
 * `renderCodeToPdf` lives under tests/integration because it spawns
 * Chrome; the language-mapping and span-fixing helpers below have no
 * external dependencies and can run in the default unit suite.
 */

import { describe, it, expect } from "vitest"
import { fixMultilineSpans, getLanguageFromExtension } from "../../src/renderers/code.js"

describe("getLanguageFromExtension", () => {
  it("should map whitelisted extensions to highlight.js language names", () => {
    expect(getLanguageFromExtension("file.ts")).toBe("typescript")
    expect(getLanguageFromExtension("script.py")).toBe("python")
    expect(getLanguageFromExtension("main.rs")).toBe("rust")
    expect(getLanguageFromExtension("README.md")).toBe("markdown")
    expect(getLanguageFromExtension("app.go")).toBe("go")
    expect(getLanguageFromExtension("style.css")).toBe("css")
  })

  it("should map multiple variants to same language", () => {
    expect(getLanguageFromExtension("app.js")).toBe("javascript")
    expect(getLanguageFromExtension("component.jsx")).toBe("javascript")
    expect(getLanguageFromExtension("config.yaml")).toBe("yaml")
    expect(getLanguageFromExtension("deploy.yml")).toBe("yaml")
    expect(getLanguageFromExtension("util.cpp")).toBe("cpp")
    expect(getLanguageFromExtension("util.cc")).toBe("cpp")
    expect(getLanguageFromExtension("util.cxx")).toBe("cpp")
  })

  it("should return empty string for unknown extensions (strict whitelist)", () => {
    expect(getLanguageFromExtension("file.unknown")).toBe("")
    expect(getLanguageFromExtension("data.xyz")).toBe("")
    expect(getLanguageFromExtension("notes.txt")).toBe("")
    expect(getLanguageFromExtension("backup.bak")).toBe("")
  })

  it("should handle extensionless whitelisted code files", () => {
    expect(getLanguageFromExtension("Makefile")).toBe("makefile")
    expect(getLanguageFromExtension("Dockerfile")).toBe("dockerfile")
    expect(getLanguageFromExtension("Gemfile")).toBe("ruby")
    expect(getLanguageFromExtension("Rakefile")).toBe("ruby")
    expect(getLanguageFromExtension("Vagrantfile")).toBe("ruby")
  })

  it("should return empty string for non-whitelisted extensionless files", () => {
    expect(getLanguageFromExtension("LICENSE")).toBe("")
    expect(getLanguageFromExtension("README")).toBe("")
    expect(getLanguageFromExtension("CHANGELOG")).toBe("")
  })

  it("should handle full paths correctly", () => {
    expect(getLanguageFromExtension("/path/to/file.ts")).toBe("typescript")
    expect(getLanguageFromExtension("/home/user/script.py")).toBe("python")
    expect(getLanguageFromExtension("/home/user/Makefile")).toBe("makefile")
    expect(getLanguageFromExtension("/home/user/LICENSE")).toBe("")
  })

  it("should handle Sass files using SCSS highlighting", () => {
    expect(getLanguageFromExtension("style.sass")).toBe("scss")
    expect(getLanguageFromExtension("style.scss")).toBe("scss")
  })
})

describe("fixMultilineSpans", () => {
  it("should handle text without spans", () => {
    const input = "line1\nline2\nline3"
    const result = fixMultilineSpans(input)
    expect(result).toBe("line1\nline2\nline3")
  })

  it("should close and reopen spans across lines", () => {
    const input =
      '<span class="hljs-keyword">const</span> foo\n<span class="hljs-string">bar</span>'
    const result = fixMultilineSpans(input)

    // Each line should be self-contained
    const lines = result.split("\n")
    expect(lines[0]).toContain("const")
    expect(lines[1]).toContain("bar")
  })

  it("should handle nested spans", () => {
    const input = '<span class="outer"><span class="inner">text</span></span>'
    const result = fixMultilineSpans(input)
    expect(result).toContain("text")
  })

  it("should preserve span classes", () => {
    const input = '<span class="hljs-keyword">keyword</span>\ncontinued'
    const result = fixMultilineSpans(input)
    expect(result).toContain("hljs-keyword")
  })

  it("should handle empty lines", () => {
    const input = '<span class="test">line1</span>\n\n<span class="test">line3</span>'
    const result = fixMultilineSpans(input)
    const lines = result.split("\n")
    expect(lines).toHaveLength(3)
  })

  it("should handle unclosed spans across multiple lines", () => {
    const input = '<span class="cls1">line1\nline2\nline3</span>'
    const result = fixMultilineSpans(input)
    const lines = result.split("\n")

    // Each line should have span closed
    expect(lines[0]).toContain("</span>")
    expect(lines[1]).toContain("</span>")
    expect(lines[2]).toContain("</span>")
  })
})
