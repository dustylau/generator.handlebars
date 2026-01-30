# Changelog

All notable changes to generator.handlebars will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Work In Progress

- Configuration file support (`.generatorrc.json`)
- Additional string helpers (`pluralize`, `singularize`, `join`, `split`)
- Post-generation hooks for auto-formatting
- Verbose/debug mode with timing statistics

---

## [3.0.0] - 2026-01-28

### Added

#### Core Features
- **Async/Await API** - All generation methods now support async operations
  - `generateAsync()` on Template and TemplateLoader
  - `writeAsync()` on Template and TemplateResult
  - `loadAndGenerateAsync()` static method on TemplateLoader
- **Validation Methods** - Validate templates before generation
  - `validate()` on Template
  - `validateAll()` on TemplateLoader
- **Preview/Dry-Run Mode** - See output without writing files
  - `preview()` method on Template and TemplateLoader
  - `--dry-run` flag in CLI
  - `{ write: false }` option in programmatic API

#### CLI Tool
- Full command-line interface with Commander.js
- `generate` command - Generate files from templates
- `validate` command - Validate templates without generating
- `preview` command - Preview output without writing
- `list` command - List templates in a directory
- `watch` command - Auto-regenerate on file changes (using chokidar)

#### Plugin System
- `PluginManager` class for extending functionality
- Plugin interface with helpers, partials, and lifecycle hooks
- Hooks: `onBeforeGenerate`, `onAfterGenerate`, `onBeforeWrite`, `onAfterWrite`
- Transform hooks: `transformModel`, `transformResult`
- Factory methods: `createHelperPlugin()`, `createPartialPlugin()`
- Singleton `pluginManager` instance exported

#### Handlebars Partials
- Formalized partial support with `.hbs.partial` extension
- `registerPartial()` - Register from string
- `registerPartialFromFile()` - Register from file
- `loadPartialsFromDirectory()` - Auto-load all partials
- `unregisterPartial()` - Remove registered partial
- `getPartials()` - Get all registered partials
- Auto-loading in TemplateLoader

#### Error Handling
- Custom error classes with rich context
- `GeneratorError` - Base error class
- `TemplateLoadError` - Template loading failures
- `TemplateCompileError` - Handlebars compilation errors
- `TemplateGenerateError` - Generation failures
- `SettingsError` - Settings validation errors
- `FileError` - File system errors
- `PluginError` - Plugin-related errors
- `toDetailedString()` - Formatted error output
- `toJSON()` - Serializable error objects
- `formatErrorSummary()` - Format multiple errors

#### TypeScript Support
- Full TypeScript declarations in `index.d.ts`
- Type definitions for all classes and interfaces
- Exported via `types` field in package.json

#### Developer Experience
- JSON Schema for template settings
- Husky + lint-staged for pre-commit hooks
- Prettier integration for code formatting
- ESLint configuration with Prettier compatibility
- Jest test suite with 139 tests
- Sample partials (`header.hbs.partial`, `itemDetails.hbs.partial`)

### Changed

- **Node.js Requirement** - Now requires Node.js >= 18.0.0
- **Package Version** - Bumped to 3.0.0
- **Dependencies Updated**
  - handlebars ^4.7.8
  - commander ^14.0.2 (new)
  - chokidar ^5.0.0 (new)

### Fixed

- Fixed bug in `Helpers.camelCase()` for edge cases
- Fixed template path resolution in Template class
- Improved error messages throughout codebase

### Deprecated

- None

### Removed

- Dropped support for Node.js < 18

### Security

- Updated all dependencies to latest versions

---

## [2.x.x] - Legacy

Previous versions of the library with basic template generation functionality.

### Features (Legacy)
- Basic Handlebars template loading
- Settings-based generation
- Script hooks (prepareModel, prepareItem, etc.)
- Core helpers (camelCase, where, orderBy, etc.)

---

## Migration Guide: 2.x → 3.0

### Breaking Changes

1. **Node.js Version**
   ```bash
   # Check your Node version
   node --version  # Must be >= 18.0.0
   ```

2. **No API Breaking Changes**
   - All 2.x APIs remain compatible
   - New features are additive

### Recommended Updates

1. **Use Async Methods**
   ```javascript
   // Before (still works)
   loader.generate(model);
   
   // After (recommended)
   await loader.generateAsync(model);
   ```

2. **Use Validation**
   ```javascript
   loader.load();
   if (!loader.validateAll()) {
     console.error(loader.errors);
     process.exit(1);
   }
   ```

3. **Use CLI for Scripts**
   ```bash
   # Before: custom node script
   # After: use CLI
   npx generator-hbs generate -t ./templates -m ./model.json
   ```

4. **Add TypeScript Types**
   ```typescript
   import Generator from 'generator.handlebars';
   // Types are automatically available
   ```

---

## Links

- [GitHub Repository](https://github.com/dustylau/generator.handlebars)
- [npm Package](https://www.npmjs.com/package/generator.handlebars)
- [Documentation](./docs/)
- [Issue Tracker](https://github.com/dustylau/generator.handlebars/issues)
