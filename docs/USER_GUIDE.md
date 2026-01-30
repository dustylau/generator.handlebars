# Generator.handlebars User Guide

A comprehensive guide to using generator.handlebars for code generation.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [Template Syntax](#template-syntax)
6. [Settings Reference](#settings-reference)
7. [Handlebars Helpers](#handlebars-helpers)
8. [Script Hooks](#script-hooks)
9. [Partials](#partials)
10. [CLI Reference](#cli-reference)
11. [Programmatic API](#programmatic-api)
12. [Plugin System](#plugin-system)
13. [Error Handling](#error-handling)
14. [Best Practices](#best-practices)
15. [Recipes](#recipes)
16. [Troubleshooting](#troubleshooting)

---

## Introduction

generator.handlebars is a template-based code generation library that transforms JSON data models into text files using Handlebars templates. It's ideal for:

- Generating boilerplate code from schemas
- Creating multiple files from a single template
- Maintaining consistent code patterns
- Building scaffolding tools

### Key Features

- Handlebars template syntax with custom helpers
- JSON-based configuration
- Iterate over model arrays to generate multiple files
- Split single templates into multiple outputs
- Script hooks for model transformation
- Plugin system for extensibility
- Full async/await support
- CLI and programmatic API

---

## Installation

```bash
npm install generator.handlebars
```

### Requirements

- Node.js >= 18.0.0

### Verify Installation

```bash
npx generator-hbs --version
```

---

## Quick Start

### 1. Create a Model

Create `model.json`:

```json
{
  "projectName": "MyApp",
  "entities": [
    { "name": "User", "fields": ["id", "name", "email"] },
    { "name": "Product", "fields": ["id", "title", "price"] }
  ]
}
```

### 2. Create a Template

Create `entity.hbs`:

```handlebars
// Generated file for {{item.name}}
class {{item.name}} {
{{#each item.fields}}
  {{this}}: any;
{{/each}}
}

export default {{item.name}};
```

### 3. Create Settings

Create `entity.hbs.settings.json`:

```json
{
  "Target": "entities",
  "TargetItem": "item",
  "ExportPath": "./output/{{item.name}}.ts"
}
```

### 4. Generate

```bash
npx generator-hbs generate -t . -m model.json
```

This creates:

- `./output/User.ts`
- `./output/Product.ts`

---

## Core Concepts

### The Generation Flow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│ JSON Model  │ -> │   Template   │ -> │ Output Files │
└─────────────┘    │  + Settings  │    └──────────────┘
                   └──────────────┘
```

### File Convention

Templates use a naming convention with paired files:

| File | Purpose |
|------|---------|
| `name.hbs` | Handlebars template |
| `name.hbs.settings.json` | Generation settings |
| `name.hbs.js` | Script hooks (optional) |
| `name.hbs.partial` | Reusable partial (optional) |

### Generation Modes

1. **Single Output** - One template produces one file
2. **Multiple Outputs** - Template iterates over an array, producing one file per item
3. **Split Output** - Single template produces multiple files via split markers

---

## Template Syntax

Templates use standard Handlebars syntax with extensions.

### Variables

```handlebars
{{variableName}}
{{nested.property}}
{{../parentContext}}
```

### Conditionals

```handlebars
{{#if condition}}
  Content when true
{{else}}
  Content when false
{{/if}}
```

### Iteration

```handlebars
{{#each items}}
  {{@index}}: {{this.name}}
{{/each}}
```

### Comments

```handlebars
{{! This is a comment }}
{{!-- This is also a comment --}}
```

### Raw Blocks

To output literal Handlebars syntax:

```handlebars
\{{notProcessed}}
{{{{raw}}}}
  {{also.notProcessed}}
{{{{/raw}}}}
```

### Context in Iterations

When iterating over the target array with settings:

```json
{ "Target": "entities", "TargetItem": "item" }
```

Inside the template:

- `{{item}}` - Current item from the array
- `{{item.name}}` - Property of current item
- `{{Model}}` - Full original model (always available)
- `{{Model.projectName}}` - Access other model properties

---

## Settings Reference

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `Target` | string | Model property to iterate, or `"Model"` for single output |
| `ExportPath` | string | Output path (supports Handlebars expressions) |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `TargetItem` | string | `"item"` | Variable name for current item |
| `AppendToExisting` | boolean | `false` | Append to file if exists |
| `SplitOn` | string | - | String marker to split output |
| `FileNamePattern` | string | - | Regex to extract filename from content |
| `RemoveFileName` | boolean | `false` | Remove filename marker from output |

### Conditional Generation Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `GenerateIf` | string | - | Condition that must be true to generate |
| `SkipIf` | string | - | Condition that skips generation if true |
| `Enabled` | boolean | `true` | Enables or disables this template |
| `Description` | string | - | Human-readable description |

#### GenerateIf and SkipIf Syntax

Conditions use the format: `path operator value`

**Operators:**
- `eq`, `==`, `===` - Equal
- `ne`, `!=`, `!==` - Not equal
- `gt`, `>` - Greater than
- `lt`, `<` - Less than
- `gte`, `>=` - Greater than or equal
- `lte`, `<=` - Less than or equal
- `contains` - String contains
- `startswith` - String starts with
- `endswith` - String ends with
- `matches` - Regex match
- `exists` - Property exists and is not null
- `empty` - Value is empty/null/[]

**Examples:**

```json
{
  "Target": "entities",
  "GenerateIf": "Model.generateEntities eq true",
  "ExportPath": "./models/{{item.name}}.ts"
}
```

```json
{
  "Target": "entities",
  "SkipIf": "item.IsAbstract eq true",
  "ExportPath": "./models/{{item.name}}.ts"
}
```

**Environment Variable Conditions:**

```json
{
  "GenerateIf": "env:GENERATE_MODELS",
  "SkipIf": "env:SKIP_ENTITIES"
}
```

**Disable Template:**

```json
{
  "Enabled": false,
  "Description": "Template disabled for now"
}
```

### Path Escaping

Double-escape backslashes before Handlebars expressions:

```json
{
  "ExportPath": ".\\\\output\\\\{{item.name}}.ts"
}
```

### Examples

**Single file output:**

```json
{
  "Target": "Model",
  "ExportPath": "./output/index.ts"
}
```

**Multiple files from array:**

```json
{
  "Target": "entities",
  "TargetItem": "entity",
  "ExportPath": "./models/{{entity.name}}.ts"
}
```

**Split output:**

```json
{
  "Target": "Model",
  "ExportPath": "./output/",
  "SplitOn": "//##SPLIT##",
  "FileNamePattern": "//\\[(?<FileName>[\\w.]+)\\]",
  "RemoveFileName": true
}
```

---

## Handlebars Helpers

### Conditional Helpers

#### ifEquals

```handlebars
{{#ifEquals value "expected"}}matches{{/ifEquals}}
```

#### ifNotEquals

```handlebars
{{#ifNotEquals status "active"}}not active{{/ifNotEquals}}
```

### String Helpers

#### camelCase

```handlebars
{{camelCase "user_name"}}  {{!-- userName --}}
```

#### upperCase

```handlebars
{{upperCase "hello"}}  {{!-- HELLO --}}
```

#### lowerCase

```handlebars
{{lowerCase "HELLO"}}  {{!-- hello --}}
```

#### replace

```handlebars
{{replace name "_" "-"}}  {{!-- replaces underscores --}}
```

#### concat

```handlebars
{{concat "Hello" " " "World"}}  {{!-- Hello World --}}
```

### Collection Helpers

#### where

Filter arrays with conditions:

```handlebars
{{#each (where items "IsActive eq true")}}
  {{this.name}}
{{/each}}
```

Filter syntax: `"PropertyName operator value"`

Operators:

- `eq` - equals
- `ne` - not equals
- `gt` - greater than
- `lt` - less than
- `ge` - greater or equal
- `le` - less or equal

Multiple conditions (semicolon-separated):

```handlebars
{{#each (where items "Type eq User;IsActive eq true")}}
```

#### orderBy

```handlebars
{{#each (orderBy items "name")}}
  {{this.name}}
{{/each}}
```

#### first

```handlebars
{{first items}}  {{!-- First item --}}
```

#### any

```handlebars
{{#if (any items)}}has items{{/if}}
```

#### findIn

```handlebars
{{findIn items "id" 5}}  {{!-- Find item with id=5 --}}
```

#### existsIn

```handlebars
{{#if (existsIn items "name" "Admin")}}admin exists{{/if}}
```

#### contains

```handlebars
{{#if (contains tags "featured")}}is featured{{/if}}
```

### Type Helpers

#### getType

```handlebars
{{getType "string"}}  {{!-- Returns mapped type --}}
```

#### isSystemType

```handlebars
{{#if (isSystemType typeName)}}system{{/if}}
```

#### getSqlType

```handlebars
{{getSqlType "string"}}  {{!-- nvarchar(max) --}}
```

#### isNumber

```handlebars
{{#if (isNumber value)}}is numeric{{/if}}
```

### Utility Helpers

#### debug

Outputs the current context for debugging:

```handlebars
{{debug this}}
```

---

## Script Hooks

Create a `.hbs.js` file alongside your template for data transformation.

### Available Hooks

```javascript
module.exports = {
  // Called once with the full model
  prepareModel: (model) => {
    return { ...model, timestamp: new Date() };
  },

  // Called with the target array
  prepareTarget: (target) => {
    return target.filter(item => item.enabled);
  },

  // Called for each item during iteration
  prepareItem: (item) => {
    return { ...item, processed: true };
  },

  // Called with complete item context
  prepareItemModel: (itemModel) => {
    // itemModel contains: item, Model, etc.
    return itemModel;
  }
};
```

### Hook Execution Order

1. `prepareModel(model)` - Transform full model
2. `prepareTarget(target)` - Transform target array
3. For each item:
   - `prepareItem(item)` - Transform item
   - `prepareItemModel(context)` - Transform context

### Example: Add Computed Properties

**entity.hbs.js:**

```javascript
module.exports = {
  prepareItem: (item) => ({
    ...item,
    className: item.name,
    fileName: item.name.toLowerCase(),
    hasFields: item.fields && item.fields.length > 0
  })
};
```

---

## Partials

Partials are reusable template fragments.

### Creating Partials

Create files with `.hbs.partial` or `.partial.hbs` extension:

**header.hbs.partial:**

```handlebars
/**
 * {{title}}
 * Generated on {{timestamp}}
 * DO NOT EDIT
 */
```

### Using Partials

```handlebars
{{> header title="My Class"}}

class MyClass {
  // ...
}
```

### Registering Partials Programmatically

```javascript
const { HandlebarsHelpers } = require('generator.handlebars');

// From string
HandlebarsHelpers.registerPartial('footer', '// End of {{name}}');

// From file
HandlebarsHelpers.registerPartialFromFile('header', './partials/header.hbs.partial');

// Load all from directory
HandlebarsHelpers.loadPartialsFromDirectory('./partials');
```

---

## CLI Reference

### generate

Generate files from templates:

```bash
npx generator-hbs generate -t <templateDir> -m <modelPath> [options]
```

Options:

| Option | Description |
|--------|-------------|
| `-t, --templates <dir>` | Template directory (required) |
| `-m, --model <file>` | Model JSON file (required) |
| `-o, --output <dir>` | Base output directory |
| `--dry-run` | Preview without writing |
| `-v, --verbose` | Verbose output |

### validate

Validate templates:

```bash
npx generator-hbs validate -t <templateDir> [options]
```

Options:

| Option | Description |
|--------|-------------|
| `-t, --templates <dir>` | Template directory (required) |
| `-v, --verbose` | Show detailed validation info |

### preview

Preview generation output:

```bash
npx generator-hbs preview -t <templateDir> -m <modelPath>
```

### list

List available templates:

```bash
npx generator-hbs list -t <templateDir>
```

### watch

Watch for changes and regenerate:

```bash
npx generator-hbs watch -t <templateDir> -m <modelPath>
```

---

## Programmatic API

### Basic Usage

```javascript
const { TemplateLoader } = require('generator.handlebars');

// Load templates
const loader = new TemplateLoader('./templates');
loader.load();

// Load model
const model = require('./model.json');

// Generate (async)
await loader.generateAsync(model, { write: true });
```

### One-liner

```javascript
const { TemplateLoader } = require('generator.handlebars');

await TemplateLoader.loadAndGenerateAsync('./templates', require('./model.json'));
```

### Using Template Directly

```javascript
const { Template } = require('generator.handlebars');

const template = new Template('./templates/entity.hbs');
const results = template.generate(model);
await template.writeAsync(results);
```

### Validation

```javascript
const loader = new TemplateLoader('./templates');
loader.load();

if (!loader.validateAll()) {
  console.error('Validation errors:', loader.errors);
  process.exit(1);
}
```

### Preview Mode

```javascript
const previews = loader.preview(model);

for (const preview of previews) {
  console.log(`Would create: ${preview.filePath}`);
  console.log(preview.content);
}
```

---

## Plugin System

Extend functionality with plugins.

### Creating a Plugin

```javascript
const { pluginManager } = require('generator.handlebars');

pluginManager.register({
  name: 'my-plugin',
  
  // Add custom helpers
  helpers: {
    double: (n) => n * 2,
    wrap: (text, wrapper) => `${wrapper}${text}${wrapper}`
  },
  
  // Add custom partials
  partials: {
    footer: '// Generated by {{generator}}'
  },
  
  // Lifecycle hooks
  onBeforeGenerate: (model, template) => {
    console.log(`Generating from ${template.templatePath}`);
  },
  
  onAfterGenerate: (results, template) => {
    console.log(`Generated ${results.length} files`);
  },
  
  // Transform the model
  transformModel: (model) => ({
    ...model,
    generatedAt: new Date().toISOString()
  })
});
```

### Plugin Lifecycle

1. `onBeforeGenerate(model, template)` - Before generation starts
2. `transformModel(model)` - Transform the model
3. Template renders
4. `transformResult(result)` - Transform each result
5. `onAfterGenerate(results, template)` - After generation completes
6. `onBeforeWrite(result)` - Before writing each file
7. `onAfterWrite(result)` - After writing each file

### Factory Methods

```javascript
const { PluginManager } = require('generator.handlebars');

// Helper-only plugin
const helperPlugin = PluginManager.createHelperPlugin('string-utils', {
  reverse: (str) => str.split('').reverse().join('')
});

// Partial-only plugin
const partialPlugin = PluginManager.createPartialPlugin('common', {
  disclaimer: '// Auto-generated - Do not edit'
});
```

---

## Error Handling

### Error Classes

```javascript
const {
  GeneratorError,
  TemplateLoadError,
  TemplateCompileError,
  TemplateGenerateError,
  SettingsError,
  FileError,
  PluginError
} = require('generator.handlebars');
```

### Checking for Errors

```javascript
const template = new Template(path);
const results = template.generate(model);

if (template.errors.length > 0) {
  for (const err of template.errors) {
    console.error(err.toDetailedString());
  }
}
```

### Error Context

Errors include rich context:

```javascript
try {
  template.generate(model);
} catch (err) {
  if (err instanceof TemplateCompileError) {
    console.log('Template:', err.template);
    console.log('Line:', err.lineNumber);
    console.log('Details:', err.toDetailedString());
  }
}
```

### Continue on Error

```javascript
const loader = new TemplateLoader(dir);
loader.load();

// Don't stop on first error
loader.generate(model, { continueOnError: true });

// Check accumulated errors
if (loader.errors.length > 0) {
  console.error(formatErrorSummary(loader.errors));
}
```

---

## Best Practices

### Template Organization

```
templates/
├── models/
│   ├── entity.hbs
│   ├── entity.hbs.settings.json
│   └── entity.hbs.js
├── services/
│   ├── service.hbs
│   └── service.hbs.settings.json
├── partials/
│   ├── header.hbs.partial
│   └── imports.hbs.partial
└── shared/
    └── types.hbs.partial
```

### Model Design

- Use consistent property naming
- Include metadata for generation
- Keep models flat when possible

```json
{
  "metadata": {
    "version": "1.0",
    "author": "generator"
  },
  "entities": [...],
  "enums": [...]
}
```

### Template Patterns

1. **Use partials** for repeated sections
2. **Use script hooks** for complex transformations
3. **Use the `debug` helper** to inspect context
4. **Keep templates focused** - one concern per template

### Error Handling

1. Always validate before generating in production
2. Use `continueOnError` for batch operations
3. Log errors with full context

---

## Recipes

### Recipe: Generate from OpenAPI Schema

```javascript
// model.json is an OpenAPI spec
const model = require('./openapi.json');

// Transform in script hook
module.exports = {
  prepareModel: (spec) => ({
    schemas: Object.entries(spec.components?.schemas || {}).map(
      ([name, schema]) => ({ name, ...schema })
    )
  })
};
```

### Recipe: Conditional File Generation

```handlebars
{{#if item.generateController}}
//##SPLIT##
//[{{item.name}}Controller.ts]
export class {{item.name}}Controller { }
{{/if}}
```

### Recipe: Import Statements

```handlebars
{{#each (where item.fields "IsReference eq true")}}
import { {{this.Type}} } from './{{this.Type}}';
{{/each}}
```

### Recipe: Enum Generation

```handlebars
{{#each Model.enums}}
export enum {{this.name}} {
{{#each this.values}}
  {{this}}{{#unless @last}},{{/unless}}
{{/each}}
}
{{/each}}
```

### Recipe: TypeScript Interfaces

**model.json:**

```json
{
  "interfaces": [
    {
      "name": "User",
      "properties": [
        { "name": "id", "type": "number", "required": true },
        { "name": "email", "type": "string", "required": true },
        { "name": "name", "type": "string", "required": false }
      ]
    }
  ]
}
```

**interface.hbs:**

```handlebars
export interface {{item.name}} {
{{#each item.properties}}
  {{this.name}}{{#unless this.required}}?{{/unless}}: {{this.type}};
{{/each}}
}
```

---

## Troubleshooting

### Common Issues

#### Template not found

```
Error: Template file not found: ./templates/entity.hbs
```

**Solution:** Verify the file path and extension.

#### Settings file missing

```
Error: Settings file not found for template
```

**Solution:** Create a matching `.hbs.settings.json` file.

#### Invalid ExportPath

```
Error: ExportPath must be specified
```

**Solution:** Add `"ExportPath"` to settings with a valid path.

#### Target not found in model

```
Error: Target 'entities' not found in model
```

**Solution:** Verify the Target matches a property in your model, or use `"Model"` for the full model.

#### Handlebars syntax error

```
Error: Parse error on line X
```

**Solution:** Check for unclosed blocks, missing helpers, or typos.

### Debugging Tips

1. **Use debug helper:**

   ```handlebars
   {{debug this}}
   ```

2. **Use preview mode:**

   ```bash
   npx generator-hbs preview -t ./templates -m ./model.json
   ```

3. **Enable verbose:**

   ```bash
   npx generator-hbs generate -t ./templates -m ./model.json -v
   ```

4. **Check model structure:**

   ```javascript
   console.log(JSON.stringify(model, null, 2));
   ```

### Getting Help

- [GitHub Issues](https://github.com/dustylau/generator.handlebars/issues)
- [Documentation](./docs/)
- [Examples](./sample-templates/)
