# Copilot Instructions for generator.handlebars

## Project Overview

A Handlebars-based code generation library that transforms JSON models into text files using templates. Core flow: **JSON Model → Template + Settings → Generated Files**.

## Architecture

### Core Components (lib/)

| Component           | Purpose                                                                           |
| ------------------- | --------------------------------------------------------------------------------- |
| `TemplateLoader`    | Discovers `.hbs` templates and their `.hbs.settings.json` files from directories  |
| `Template`          | Compiles Handlebars templates, manages generation lifecycle, handles script hooks |
| `TemplateSettings`  | Parses settings JSON with defaults for target, export path, split behavior        |
| `TemplateResult`    | Holds generated content and writes to filesystem                                  |
| `TemplateBuilder`   | Creates templates from multiple source files with replacements                    |
| `HandlebarsHelpers` | Registers custom Handlebars helpers (see Helpers.js for implementations)          |

### Template File Convention

Templates require **two files** with matching base names:

```
mytemplate.hbs                    # Handlebars template
mytemplate.hbs.settings.json      # Generation settings
mytemplate.hbs.js                 # (Optional) Script hooks for model preparation
```

### Key Settings Properties

```json
{
  "Target": "Items",
  "TargetItem": "item",
  "ExportPath": ".\\Out\\{{item.Name}}.txt",
  "AppendToExisting": false,
  "SplitOn": "//##SPLIT##",
  "FileNamePattern": "//\\[(?<FileName>[\\w]+)\\]",
  "RemoveFileName": true
}
```

- `Target`: Model property to iterate (use `"Model"` for single output)
- `ExportPath`: Handlebars expression for output path
- `SplitOn`: Split single template output into multiple files
- `FileNamePattern`: Regex with `FileName` capture group

**Path escaping**: Double-escape backslashes before Handlebars expressions: `\\\\{{var}}`

## Custom Handlebars Helpers

Available in templates via `HandlebarsHelpers.js` → `Helpers.js`:

- **String**: `camelCase`, `upperCase`, `lowerCase`, `replace`, `concat`
- **Conditionals**: `ifEquals`, `ifNotEquals`
- **Collections**: `where`, `orderBy`, `first`, `any`, `findIn`, `existsIn`, `contains`
- **Type utilities**: `getType`, `isSystemType`, `getSqlType`, `isNumber`

### Filter syntax for `where` helper

```handlebars
{{#each (where Items "IsActive eq true;Type ne System")}}
```

## Script Hooks (Optional .hbs.js files)

```javascript
module.exports = {
  prepareModel: (model) => model,
  prepareTarget: (target) => target,
  prepareItem: (item) => item,
  prepareItemModel: (itemModel) => itemModel,
};
```

## Development Commands

```bash
npm test              # Run Jest test suite
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run generate      # Run sample generation (outputs to ./Generated/)
npm run lint          # Run ESLint
```

## Async API

All core operations support async/await for non-blocking I/O:

```javascript
const { TemplateLoader, Template } = require('generator.handlebars');

// Async generation with TemplateLoader
const loader = new TemplateLoader(templateDir);
loader.load();
const results = await loader.generateAsync(model, { write: true });

// One-liner: load and generate
const results = await TemplateLoader.loadAndGenerateAsync(templateDir, model);

// Async file writing with Template
const template = new Template(templatePath);
const results = template.generate(model);
await template.writeAsync(results);
```

## Validation & Preview Mode

Validate templates before generation and preview output without writing:

```javascript
// Validate a single template
const template = new Template(templatePath);
const isValid = template.validate();
if (!isValid) console.error(template.errors);

// Validate all templates in a loader
const loader = new TemplateLoader(templateDir);
loader.load();
const allValid = loader.validateAll();

// Preview mode (dry-run) - get output without writing files
const previews = loader.preview(model);
previews.forEach((p) => {
  console.log(`Would write to: ${p.filePath}`);
  console.log(`Content: ${p.content}`);
});

// Generate without writing
const results = loader.generate(model, { write: false });
```

## Code Patterns

- **Properties**: Getter/setter with `_` prefix for private fields
- **Exports**: CommonJS (`module.exports` / `exports.ClassName`)
- **Error handling**: Classes expose `errors` array; throw `Error` for fatal issues
- **Async methods**: Use `Async` suffix (e.g., `generateAsync`, `writeAsync`)
- **Variables**: Use `const`/`let` (no `var`), arrow functions where appropriate
- **Documentation**: JSDoc comments on public APIs

## When Adding New Helpers

1. Implement function in `lib/Helpers.js` with JSDoc comments and input validation
2. Register in `lib/HandlebarsHelpers.js`:
   ```javascript
   Handlebars.registerHelper('helperName', Helpers.helperName);
   ```
3. Export from the module's exports object
4. Add unit tests in `lib/__tests__/Helpers.test.js`

## Testing

Tests use Jest in `lib/__tests__/`. Run with `npm test`.

- **Helpers.test.js**: Unit tests for all helper functions (71+ tests)
- **integration.test.js**: End-to-end tests for Template, TemplateLoader, FileHelper
- Test files follow `*.test.js` naming convention
- Uses `mock-fs` for filesystem mocking in integration tests

## Sample Templates

See `sample-templates/` for working examples:

- `sample.hbs` - Basic iteration over model array
- `sample-full-model.hbs` - Single output from full model
- `sample-full-model-split.hbs` - Split output into multiple files
- `sample-from-list.hbs` - Alternative target array

## Error Handling

Classes accumulate non-fatal errors in an `errors` array:

```javascript
const template = new Template(path);
template.generate(model);

if (template.errors.length > 0) {
  template.errors.forEach((err) => console.error(err));
}

// TemplateLoader supports continueOnError option
const loader = new TemplateLoader(dir);
loader.load();
loader.generate(model, { continueOnError: true });
console.log(loader.errors); // Array of errors from all templates
```
