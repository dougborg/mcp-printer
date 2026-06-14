# Changelog

All notable changes to this project will be documented in this file.

> This is the changelog for the maintained fork [`@dougborg/mcp-printer`](https://www.npmjs.com/package/@dougborg/mcp-printer).
> From `2.1.0` onward, releases and entries are generated automatically by
> [release-please](docs/release-process.md) from Conventional Commits. Entries at `2.0.0` and
> below are inherited from upstream [`steveclarke/mcp-printer`](https://github.com/steveclarke/mcp-printer).

## [2.1.0](https://github.com/dougborg/mcp-printer/compare/v2.0.0...v2.1.0) (2026-06-14)


### Features

* establish @dougborg/mcp-printer maintained fork (v2.1.0) ([#7](https://github.com/dougborg/mcp-printer/issues/7)) ([042d1e1](https://github.com/dougborg/mcp-printer/commit/042d1e1eeb80e2ea35e3923eac083a2f6a2b49a3))


### Bug Fixes

* lazy-load crossnote (sync slim version into fork master) ([b03d7d4](https://github.com/dougborg/mcp-printer/commit/b03d7d4290343b640570f033acade4c01250f4ca))
* lazy-load crossnote to isolate module-load failures ([5b7ea34](https://github.com/dougborg/mcp-printer/commit/5b7ea34819d6d0d8ddab9131361da78df0f2d53b))

## [2.0.0] - 2025-10-20

### Added
- Batch operation support: AI agents can now print multiple files, check multiple page counts, or cancel multiple jobs in a single MCP tool call
- `print_file` now accepts `files` array parameter for batch printing (single operations supported via single-element arrays)
- `get_page_meta` now accepts `files` array parameter for batch metadata retrieval
- `cancel_print_job` now accepts `jobs` array parameter for batch cancellations
- All batch operations support partial success - processing continues on individual failures
- Detailed batch operation results showing success/failure status for each item
- Batch size validation with recommended limit of 50 items per operation

### Changed
- **BREAKING**: `print_file` API signature changed to accept `files` array instead of individual file parameters
- **BREAKING**: `get_page_meta` API signature changed to accept `files` array instead of individual file parameters
- **BREAKING**: `cancel_print_job` API signature changed to accept `jobs` array instead of individual job parameters
- Replaced `print-code-review` prompt with simpler `print-changed` prompt
- New `print-changed` prompt focuses on batch printing changed files (staged, uncommitted, branch)
- Removed complex code review document generation from prompts (stayed printer-focused)

## [1.3.0] - 2025-10-15

### Added
- Shebang detection for automatic code file identification
- Files without standard extensions that contain shebangs (`#!/bin/bash`, `#!/usr/bin/env python`, etc.) are now automatically rendered with syntax highlighting
- Support for all line ending types: Unix (`\n`), Windows (`\r\n`), and old Mac (`\r`)
- Four new test fixture files for shebang detection testing

### Enhanced
- `shouldRenderCode()` now checks for shebangs in the first 1024 bytes of files with unknown extensions
- Code rendering now works seamlessly with shell scripts, Python scripts, and other executables without file extensions

## [1.2.0] - 2025-10-14

### Added
- New `get_page_meta` tool to get page count and metadata before printing
- Page count confirmation prompt when print jobs exceed configurable threshold
- `MCP_PRINTER_CONFIRM_IF_OVER_PAGES` environment variable (default: 10 physical sheets)

### Fixed
- Markdown PDF footer layout regression where filename and page numbers were misaligned
- Footer font now matches GitHub's markdown rendering font stack for consistent typography

## [1.1.0] - 2025-10-13

### Added
- New `MCP_PRINTER_ENABLE_PROMPTS` environment variable to enable/disable prompt registration
- Prompts can now be disabled by setting `MCP_PRINTER_ENABLE_PROMPTS=false` in configuration
- Prompts are enabled by default

### Changed
- Updated `get_config` tool to display `MCP_PRINTER_ENABLE_PROMPTS` status

## [1.0.0] - 2025-10-13

### Added
- Initial release of MCP Printer
- Print files directly from AI conversations via MCP protocol
- Beautiful markdown rendering with Mermaid diagram support
- Syntax-highlighted code printing for multiple languages
- Print queue management tools
- Printer configuration and management
- Security features with path restrictions and dotfile blocking
- Support for macOS and Linux (CUPS)
- Configuration via environment variables
- Tools: `print_file`, `list_printers`, `get_default_printer`, `set_default_printer`, `get_print_queue`, `cancel_print_job`, `get_config`
- Automatic duplex printing support
- Code rendering with configurable syntax highlighting, line numbers, and color schemes
- Markdown rendering with GitHub-style formatting

### Documentation
- Comprehensive README with setup instructions
- Configuration guide with all environment variables
- Security documentation
- MIT License

[2.0.0]: https://github.com/steveclarke/mcp-printer/releases/tag/v2.0.0
[1.3.0]: https://github.com/steveclarke/mcp-printer/releases/tag/v1.3.0
[1.0.0]: https://github.com/steveclarke/mcp-printer/releases/tag/v1.0.0
