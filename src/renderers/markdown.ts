/**
 * @fileoverview Markdown file renderer.
 * Converts markdown files to PDF using crossnote.
 * Provides beautiful Markdown Preview Enhanced-quality output with Mermaid diagram support.
 * Automatically adds page numbering to all rendered PDFs.
 */

import { basename, join } from "path"
import { mkdtemp, readFile, rm, writeFile } from "fs/promises"
import { tmpdir } from "os"
import matter from "gray-matter"
import he from "he"
import { findChrome } from "../utils.js"
import { validateFilePath } from "../file-security.js"
import { config } from "../config.js"
import { Notebook } from "crossnote"

/**
 * Page numbering configuration function for Puppeteer PDF generation.
 * Generates header/footer templates with inline styles (required by Puppeteer).
 * Filename is HTML-escaped to prevent XSS and rendering issues.
 *
 * @param filename - The name of the file being rendered (displayed in footer)
 * @returns Configuration object with header/footer templates
 */
function getPageNumberConfig(filename: string) {
  // Puppeteer PDF headers/footers require inline styles (no external CSS support)
  const footerStyles = {
    container: [
      "font-size: 9px",
      "width: 100%",
      "margin: 0",
      "padding: 0 1cm",
      "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
      "display: flex",
      "justify-content: space-between",
      "align-items: center",
    ].join("; "),
    filename: "font-size: 8px; color: #666;",
  }

  return {
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: `
      <div style="${footerStyles.container}">
        <span style="${footerStyles.filename}">${he.encode(filename)}</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: "1cm",
      bottom: "1.5cm",
      left: "1cm",
      right: "1cm",
    },
  }
}

/**
 * Injects page numbering configuration into markdown content.
 * Properly merges with existing front-matter if present.
 * Uses gray-matter's stringify for robust formatting.
 * @param content - Original markdown content
 * @param filename - Name of the file being rendered (displayed in footer)
 * @returns Markdown content with page numbering front-matter added/merged
 */
function injectPageNumbering(content: string, filename: string): string {
  const { data, content: body } = matter(content)

  // Check if user already has chrome or puppeteer config in their frontmatter -
  // respect their settings
  if (data.chrome || data.puppeteer) {
    return content // Don't modify user's existing config
  }

  // Merge in the chrome config with existing front-matter (even if empty)
  const mergedFrontMatter = {
    ...data,
    chrome: getPageNumberConfig(filename),
  }

  // Use gray-matter's stringify to properly format the document
  return matter.stringify(body, mergedFrontMatter)
}

/**
 * Renders a markdown file to PDF using crossnote.
 * Provides beautiful Markdown Preview Enhanced-quality output with
 * comprehensive diagram support. Automatically adds page numbering (Page X /
 * Y) to the footer of each page.
 *
 * @param filePath - Path to the markdown file to render
 * @returns Path to the generated temporary PDF file
 * @throws {Error} If Chrome is not found or rendering fails
 */
export async function renderMarkdownToPdf(filePath: string): Promise<string> {
  await validateFilePath(filePath)

  // Read the source, create the temp dir, and locate Chrome in parallel —
  // none of these depend on each other.
  const [originalContent, tempDir, chromePath] = await Promise.all([
    readFile(filePath, "utf-8"),
    mkdtemp(join(tmpdir(), "mcp-printer-markdown-")),
    config.chromePath ? Promise.resolve(config.chromePath) : findChrome(),
  ])

  const tempFileName = basename(filePath)
  const tempFilePath = join(tempDir, tempFileName)
  const contentWithPageNumbers = injectPageNumbering(originalContent, tempFileName)
  await writeFile(tempFilePath, contentWithPageNumbers, "utf-8")

  try {
    const notebook = await Notebook.init({
      notebookPath: tempDir,
      config: {
        // Themes hardcoded for printing: light background, clean styling.
        previewTheme: "github-light.css",
        codeBlockTheme: "github.css",
        mermaidTheme: "default",
        mathRenderingOption: "KaTeX",
        printBackground: true,
        breakOnSingleNewLine: true,
        enableEmojiSyntax: true,
        enableWikiLinkSyntax: false,
        enableExtendedTableSyntax: false,
        chromePath,
        // Security: never execute embedded code.
        enableScriptExecution: false,
      },
    })

    return await notebook.getNoteMarkdownEngine(tempFileName).chromeExport({
      fileType: "pdf",
      runAllCodeChunks: false,
    })
  } catch (error: unknown) {
    throw new Error(
      `Failed to render markdown with crossnote: ${error instanceof Error ? error.message : String(error)}`
    )
  } finally {
    // PDF lands outside tempDir, so only the input file needs cleanup.
    // .catch() prevents an rm failure from masking the original error.
    await rm(tempFilePath, { force: true }).catch(() => {})
  }
}
