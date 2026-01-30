# generator.handlebars Roadmap

> Version 3.0.0 → Future | Last Updated: January 2026

## Current Status

**Version 3.0.0** is the current stable release with:
- ✅ Core generation engine
- ✅ Full CLI with 5 commands
- ✅ Plugin system
- ✅ TypeScript declarations
- ✅ Custom error classes
- ✅ Handlebars partials support
- ✅ 139 passing tests

---

## Version 3.1.0 - Developer Experience (Phase 5)

**Target: Q1 2026**

### 3.1.0-alpha: Configuration & Helpers

| Feature | Description | Status |
|---------|-------------|--------|
| Configuration File | `.generatorrc.json` for project defaults | 🔲 Planned |
| `pluralize` helper | Pluralize words (`user` → `users`) | 🔲 Planned |
| `singularize` helper | Singularize words (`users` → `user`) | 🔲 Planned |
| `formatDate` helper | Date formatting with patterns | 🔲 Planned |
| `padLeft`/`padRight` helpers | String padding | 🔲 Planned |
| `join` helper | Array to string with separator | 🔲 Planned |
| `split` helper | String to array | 🔲 Planned |
| `default` helper | Default value for undefined | 🔲 Planned |
| `coalesce` helper | First non-null value | 🔲 Planned |

### 3.1.0-beta: Post-Generation & Debugging

| Feature | Description | Status |
|---------|-------------|--------|
| Post-generation hooks | Auto-run formatters on output | 🔲 Planned |
| `--verbose` mode | Detailed logging with timing | 🔲 Planned |
| Statistics output | Files generated, sizes, duration | 🔲 Planned |
| `--quiet` mode | Minimal output | 🔲 Planned |

### 3.1.0-rc: Conditional Generation

| Feature | Description | Status |
|---------|-------------|--------|
| `GenerateIf` setting | Skip generation based on condition | 🔲 Planned |
| Environment variables | `{{env.VAR_NAME}}` in templates | 🔲 Planned |
| `--define` CLI option | Pass variables from command line | 🔲 Planned |

---

## Version 3.2.0 - Advanced Templates (Phase 6)

**Target: Q2 2026**

| Feature | Description | Status |
|---------|-------------|--------|
| Template inheritance | Layouts with `{{block}}` and `{{extend}}` | 🔲 Planned |
| Diff preview mode | Show changes before overwriting | 🔲 Planned |
| Incremental generation | Only regenerate changed files | 🔲 Planned |
| Template composition | Include templates within templates | 🔲 Planned |

---

## Version 3.3.0 - Validation & Quality (Phase 7)

**Target: Q3 2026**

| Feature | Description | Status |
|---------|-------------|--------|
| Model schema validation | Validate JSON against schema | 🔲 Planned |
| Template linting | Catch undefined vars, missing partials | 🔲 Planned |
| Settings validation | Warn on invalid/deprecated settings | 🔲 Planned |
| Generated code validation | Optional lint check on output | 🔲 Planned |

---

## Version 4.0.0 - Platform Features

**Target: Q4 2026**

| Feature | Description | Status |
|---------|-------------|--------|
| Remote templates | Load from URLs or npm packages | 🔲 Planned |
| Template repository | Shareable template collections | 🔲 Planned |
| Interactive mode | Prompt for missing values | 🔲 Planned |
| `init` command | Scaffold new template projects | 🔲 Planned |
| VS Code extension | Syntax highlighting, snippets | 🔲 Planned |

---

## Backlog (Unscheduled)

| Feature | Description | Priority |
|---------|-------------|----------|
| Output to stdout | `--stdout` for piping | Low |
| YAML model support | Accept YAML in addition to JSON | Low |
| Streaming generation | Handle very large models | Low |
| Parallel generation | Generate templates concurrently | Medium |
| Cache compiled templates | Improve watch mode performance | Medium |
| Custom file encodings | UTF-16, ASCII support | Low |
| Dry-run diff | Show unified diff in preview | Medium |

---

## Breaking Changes Planned for 4.0

1. **Minimum Node.js 20** - Drop Node 18 support
2. **ESM-first** - Default to ES modules (CommonJS via compatibility)
3. **Async-only API** - Remove synchronous methods
4. **Settings schema v2** - New settings format with migration tool

---

## Feature Request Process

1. Open GitHub issue with `[Feature Request]` prefix
2. Describe use case and expected behavior
3. Community voting via 👍 reactions
4. Accepted features added to appropriate milestone

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 3.0.0 | Jan 2026 | Plugin system, TypeScript, CLI, async API |
| 2.x | Legacy | Original implementation |
| 1.x | Legacy | Initial release |
