import { beforeEach, describe, expect, it, vi } from "vitest"
import { join } from "path"

// Mock config with rendering enabled and no excluded extensions so each
// describe block can drive shouldRenderToPdf / shouldRenderCode through
// known states. Individual tests flip flags via the live `config` object
// captured below.
vi.mock("../../src/config.js", () => ({
  config: {
    autoRenderMarkdown: true,
    autoRenderCode: true,
    code: {
      excludeExtensions: [] as string[],
    },
  },
  MARKDOWN_EXTENSIONS: ["md", "markdown"] as const,
}))

import { hasShebang, shouldRenderToPdf } from "../../src/utils.js"
import { shouldRenderCode } from "../../src/renderers/code.js"
import { config } from "../../src/config.js"

const fixturesDir = join(process.cwd(), "tests", "fixtures")

describe("shouldRenderToPdf", () => {
  beforeEach(() => {
    config.autoRenderMarkdown = true
  })

  it("returns true for the canonical markdown extensions", () => {
    expect(shouldRenderToPdf("README.md")).toBe(true)
    expect(shouldRenderToPdf("notes.markdown")).toBe(true)
  })

  it("is case-insensitive on the extension", () => {
    expect(shouldRenderToPdf("FILE.MD")).toBe(true)
    expect(shouldRenderToPdf("File.Md")).toBe(true)
    expect(shouldRenderToPdf("NOTES.MARKDOWN")).toBe(true)
  })

  it("uses the final extension when the filename contains multiple dots", () => {
    expect(shouldRenderToPdf("my.file.name.md")).toBe(true)
    expect(shouldRenderToPdf("my.md.bak")).toBe(false)
  })

  it("returns false for non-markdown extensions and bare names", () => {
    expect(shouldRenderToPdf("file.txt")).toBe(false)
    expect(shouldRenderToPdf("file.pdf")).toBe(false)
    expect(shouldRenderToPdf("README")).toBe(false)
    expect(shouldRenderToPdf("script.js")).toBe(false)
  })

  it("returns false for everything when autoRenderMarkdown is disabled", () => {
    config.autoRenderMarkdown = false
    expect(shouldRenderToPdf("README.md")).toBe(false)
    expect(shouldRenderToPdf("notes.markdown")).toBe(false)
  })
})

describe("shouldRenderCode", () => {
  beforeEach(() => {
    config.autoRenderCode = true
    config.code.excludeExtensions = []
  })

  it("returns true for whitelisted source extensions", async () => {
    expect(await shouldRenderCode("script.js")).toBe(true)
    expect(await shouldRenderCode("app.py")).toBe(true)
    expect(await shouldRenderCode("component.ts")).toBe(true)
    expect(await shouldRenderCode("config.json")).toBe(true)
    expect(await shouldRenderCode("main.rs")).toBe(true)
    expect(await shouldRenderCode("server.go")).toBe(true)
  })

  it("returns true for whitelisted extensionless filenames", async () => {
    expect(await shouldRenderCode(join(fixturesDir, "Makefile"))).toBe(true)
  })

  it("returns false for non-whitelisted extensionless files without shebang", async () => {
    expect(await shouldRenderCode(join(fixturesDir, "LICENSE"))).toBe(false)
    expect(await shouldRenderCode(join(fixturesDir, "README"))).toBe(false)
    expect(await shouldRenderCode(join(fixturesDir, "CHANGELOG"))).toBe(false)
  })

  it("falls back to shebang detection for files with no recognised extension", async () => {
    expect(await shouldRenderCode(join(fixturesDir, "shebang-first-line"))).toBe(true)
    expect(await shouldRenderCode(join(fixturesDir, "shebang-env-style"))).toBe(true)
    expect(await shouldRenderCode(join(fixturesDir, "no-shebang-plain"))).toBe(false)
  })

  it("respects the excludeExtensions list even for whitelisted languages", async () => {
    config.code.excludeExtensions = ["js", "py"]
    expect(await shouldRenderCode("script.js")).toBe(false)
    expect(await shouldRenderCode("app.py")).toBe(false)
    // Other languages still render.
    expect(await shouldRenderCode("main.rs")).toBe(true)
  })

  it("normalizes excluded extensions to lower case before comparing", async () => {
    config.code.excludeExtensions = ["ts"]
    expect(await shouldRenderCode("script.TS")).toBe(false)
    expect(await shouldRenderCode("script.Ts")).toBe(false)
  })

  it("returns false for everything when autoRenderCode is disabled", async () => {
    config.autoRenderCode = false
    expect(await shouldRenderCode("script.js")).toBe(false)
    expect(await shouldRenderCode(join(fixturesDir, "Makefile"))).toBe(false)
    expect(await shouldRenderCode(join(fixturesDir, "shebang-first-line"))).toBe(false)
  })
})

describe("hasShebang", () => {
  it("detects a shebang on the first line", async () => {
    expect(await hasShebang(join(fixturesDir, "shebang-first-line"))).toBe(true)
  })

  it("detects a shebang after blank lines", async () => {
    expect(await hasShebang(join(fixturesDir, "shebang-after-blank"))).toBe(true)
  })

  it("detects an env-style shebang", async () => {
    expect(await hasShebang(join(fixturesDir, "shebang-env-style"))).toBe(true)
  })

  it("returns false for files without a shebang", async () => {
    expect(await hasShebang(join(fixturesDir, "no-shebang-plain"))).toBe(false)
    expect(await hasShebang(join(fixturesDir, "LICENSE"))).toBe(false)
    expect(await hasShebang(join(fixturesDir, "README"))).toBe(false)
    expect(await hasShebang(join(fixturesDir, "notes.txt"))).toBe(false)
  })

  it("returns false for non-existent files", async () => {
    expect(await hasShebang("/nonexistent/file-that-does-not-exist")).toBe(false)
  })
})
