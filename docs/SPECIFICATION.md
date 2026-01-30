# generator.handlebars Technical Specification

> Version 3.0.0 | Last Updated: January 2026

## 1. Overview

**generator.handlebars** is a template-based code generation library for Node.js that transforms JSON data models into text files using Handlebars templates.

### Core Flow

```
JSON Model → Template + Settings → Generated Files
```

### Design Principles

1. **Convention over Configuration** - Sensible defaults with override capability
2. **Separation of Concerns** - Templates, settings, and scripts are separate files
3. **Extensibility** - Plugin system for custom helpers and lifecycle hooks
4. **Developer Experience** - CLI tools, TypeScript support, detailed errors

---

## 2. System Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLI (cli.js)                             │
│  generate | validate | preview | list | watch                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TemplateLoader                               │
│  - Discovers templates from directories                         │
│  - Auto-loads partials                                          │
│  - Orchestrates generation                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Template     │ │ TemplateSettings│ │ HandlebarsHelpers│
│  - Load .hbs    │ │  - Parse JSON   │ │  - Register      │
│  - Compile      │ │  - Defaults     │ │    helpers       │
│  - Generate     │ │  - Validation   │ │  - Manage        │
│  - Write        │ │                 │ │    partials      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                                       │
          ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│ TemplateResult  │                     │  PluginManager  │
│  - File path    │                     │  - Helpers      │
│  - Content      │                     │  - Partials     │
│  - Write/Append │                     │  - Hooks        │
└─────────────────┘                     └─────────────────┘
```

### File Convention

Templates are composed of related files with matching base names:

| Extension | Required | Purpose |
|-----------|----------|---------|
| `.hbs` | Yes | Handlebars template |
| `.hbs.settings.json` | Yes | Generation settings |
| `.hbs.js` | No | Script hooks for model transformation |
| `.hbs.partial` | No | Reusable partial template |

**Example:**
```
mytemplate.hbs                    # Template
mytemplate.hbs.settings.json      # Settings
mytemplate.hbs.js                 # Optional hooks
_header.hbs.partial               # Reusable partial
```

---

## 3. Core Classes

### 3.1 Template

Represents a single template with its settings and handles the generation lifecycle.

#### Constructor
```javascript
new Template(directoryPath: string, fileName: string)
```

#### Properties

| Property | Type | Access | Description |
|----------|------|--------|-------------|
| `name` | string | get/set | Template name (without extension) |
| `templatePath` | string | get | Path to .hbs file |
| `settingsPath` | string | get | Path to settings JSON |
| `scriptPath` | string | get | Path to optional .hbs.js |
| `template` | string | get | Raw template content |
| `compiledTemplate` | Function | get | Compiled Handlebars function |
| `settings` | TemplateSettings | get | Parsed settings object |
| `isLoaded` | boolean | get | Whether template loaded successfully |
| `isGenerated` | boolean | get | Whether generation completed |
| `results` | TemplateResult[] | get | Generated results |
| `errors` | string[] | get/set | Accumulated errors |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `reset()` | `() → void` | Reset internal state |
| `load()` | `() → void` | Load template, settings, script files |
| `generate()` | `(model: object) → TemplateResult[]` | Generate output |
| `write()` | `() → void` | Write all results synchronously |
| `writeAsync()` | `(results?: TemplateResult[]) → Promise<void>` | Write async |
| `preview()` | `(model: object) → PreviewResult[]` | Dry-run preview |
| `validate()` | `() → boolean` | Check template is valid |

#### Generation Flow

```
1. load()
   ├── Read .hbs file
   ├── Read .hbs.settings.json
   ├── Read .hbs.js (optional)
   └── Compile Handlebars template

2. generate(model)
   ├── prepareModel hook (if script exists)
   ├── Resolve target from model
   ├── prepareTarget hook (if script exists)
   ├── For each item in target:
   │   ├── prepareItem hook
   │   ├── Build item model (item + model)
   │   ├── prepareItemModel hook
   │   ├── Execute compiled template
   │   ├── Resolve export path
   │   └── Create TemplateResult
   └── Handle SplitOn if configured

3. write() / writeAsync()
   └── For each result:
       └── Write/append to file
```

---

### 3.2 TemplateLoader

Discovers and manages multiple templates from directories.

#### Constructor
```javascript
new TemplateLoader(
  paths: string | string[],
  extension: string = '.hbs',
  recurse: boolean = true
)
```

#### Properties

| Property | Type | Access | Description |
|----------|------|--------|-------------|
| `paths` | string[] | get/set | Template directories |
| `extension` | string | get/set | File extension filter |
| `templates` | Template[] | get | Loaded templates |
| `partials` | string[] | get | Loaded partial names |
| `errors` | string[] | get/set | Accumulated errors |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `load()` | `(callback?: Function) → void` | Load all templates |
| `generate()` | `(model, options?) → void` | Generate all |
| `generateAsync()` | `(model, options?) → Promise<TemplateResult[][]>` | Async generate |
| `loadAndGenerate()` | `(model, callback?) → void` | Combined load + generate |
| `loadAndGenerateAsync()` | `(model, options?) → Promise<TemplateResult[][]>` | Combined async |
| `validateAll()` | `() → boolean` | Validate all templates |
| `preview()` | `(model) → PreviewResult[]` | Preview all templates |

#### Options Object

```typescript
interface GenerateOptions {
  write?: boolean;           // Default: true - write files to disk
  continueOnError?: boolean; // Default: false - continue on template error
}
```

---

### 3.3 TemplateSettings

Parses and provides access to template settings.

#### Constructor
```javascript
new TemplateSettings(json: object)
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `target` | string | `'Model'` | Model property to iterate |
| `targetItem` | string | `'item'` | Variable name for item |
| `targetProperty` | string | `'target'` | Name for target in context |
| `modelProperty` | string | `'model'` | Name for model in context |
| `targetItemNameProperty` | string | `'Name'` | Property for item name |
| `exportPath` | string | - | Output path template |
| `prepareExportPathUsingTemplate` | boolean | `true` | Path uses Handlebars |
| `prepareExportPathUsingReplace` | boolean | `false` | Path uses simple replace |
| `appendToExisting` | boolean | `false` | Append vs overwrite |
| `fileNamePattern` | string | - | Regex for filename extraction |
| `removeFileName` | boolean | `false` | Remove filename marker |
| `splitOn` | string | - | Split marker string |
| `generateIf` | string | - | Condition for generation |
| `skipIf` | string | - | Condition to skip generation |
| `enabled` | boolean | `true` | Enable/disable template |
| `description` | string | - | Human-readable description |

#### Static Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `evaluateCondition()` | `(expression, context) → boolean` | Evaluate condition expression |
| `getValueByPath()` | `(obj, path) → any` | Get value by dot-notation path |

#### Instance Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `shouldGenerate()` | `(context) → boolean` | Check if template should generate |

#### Condition Expression Syntax

Format: `path operator value`

Supported operators:
- `eq`, `==`, `===` - Equal
- `ne`, `!=`, `!==` - Not equal
- `gt`, `>` - Greater than
- `lt`, `<` - Less than
- `gte`, `>=`, `ge` - Greater than or equal
- `lte`, `<=`, `le` - Less than or equal
- `contains` - String contains
- `startswith` - String starts with
- `endswith` - String ends with
- `matches` - Regex match
- `exists` - Property exists
- `empty` - Value is empty

Environment variable prefix: `env:VAR_NAME`

---

### 3.4 TemplateResult

Holds generated content and handles file writing.

#### Constructor
```javascript
new TemplateResult(filePath: string, content: string, appendToExisting: boolean)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `filePath` | string | Output file path |
| `directory` | string | Output directory |
| `content` | string | Generated content |
| `appendToExisting` | boolean | Append mode |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `write()` | `() → void` | Write synchronously |
| `writeAsync()` | `() → Promise<void>` | Write asynchronously |
| `preview()` | `() → PreviewResult` | Get preview object |

---

### 3.5 HandlebarsHelpers

Registers custom Handlebars helpers and manages partials.

#### Registered Helpers

| Category | Helpers |
|----------|---------|
| Conditional | `ifEquals`, `ifNotEquals` |
| String | `camelCase`, `upperCase`, `lowerCase`, `replace`, `concat` |
| Type | `getType`, `isSystemType`, `hasSystemType`, `getSqlType`, `getSystemType`, `isNumber` |
| Collection | `findIn`, `existsIn`, `any`, `first`, `orderBy`, `where`, `contains` |
| Utility | `write` |

#### Static Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `registerHelper()` | `(name, fn) → void` | Register custom helper |
| `registerPartial()` | `(name, template) → void` | Register partial from string |
| `registerPartialFromFile()` | `(name, filePath) → void` | Register from file |
| `loadPartialsFromDirectory()` | `(directory) → string[]` | Load all partials |
| `unregisterPartial()` | `(name) → void` | Remove partial |
| `getPartials()` | `() → object` | Get all partials |
| `getHandlebars()` | `() → Handlebars` | Get Handlebars instance |

---

### 3.6 PluginManager

Manages plugins for extending generator functionality.

#### Plugin Interface

```typescript
interface Plugin {
  name: string;              // Required - unique identifier
  version?: string;          // Semantic version
  helpers?: {                // Custom Handlebars helpers
    [name: string]: Function;
  };
  partials?: {               // Custom partials
    [name: string]: string;
  };
  onBeforeGenerate?: (model: any) => void | Promise<void>;
  onAfterGenerate?: (results: TemplateResult[]) => void | Promise<void>;
  onBeforeWrite?: () => void | Promise<void>;
  onAfterWrite?: () => void | Promise<void>;
  transformModel?: (model: any) => any;
  transformResult?: (result: any) => any;
}
```

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `register()` | `(plugin: Plugin) → void` | Register plugin |
| `unregister()` | `(name: string) → boolean` | Remove plugin |
| `has()` | `(name: string) → boolean` | Check if registered |
| `get()` | `(name: string) → Plugin` | Get plugin by name |
| `executeHooks()` | `(hookName, ...args) → Promise<void>` | Execute async hooks |
| `executeHooksSync()` | `(hookName, ...args) → void` | Execute sync hooks |
| `transform()` | `(hookName, data) → any` | Transform through hooks |
| `clear()` | `() → void` | Remove all plugins |

#### Factory Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `createHelperPlugin()` | `(name, helpers) → Plugin` | Create helper-only plugin |
| `createPartialPlugin()` | `(name, partials) → Plugin` | Create partial-only plugin |

---

### 3.7 Error Classes

Custom error classes with detailed context.

#### GeneratorError (Base)

```javascript
new GeneratorError(message: string, context?: {
  template?: string;   // Template name
  file?: string;       // File path
  line?: number;       // Line number
  code?: string;       // Error code
  cause?: Error;       // Original error
})
```

**Properties:** `name`, `message`, `template`, `file`, `line`, `code`, `cause`, `timestamp`

**Methods:**
- `toDetailedString()` - Formatted multi-line error
- `toJSON()` - Serializable object

#### Specialized Errors

| Class | Default Code | Factory Methods |
|-------|--------------|-----------------|
| `TemplateLoadError` | `TEMPLATE_LOAD_ERROR` | - |
| `TemplateCompileError` | `TEMPLATE_COMPILE_ERROR` | `fromHandlebarsError(err, name, path)` |
| `TemplateGenerateError` | `TEMPLATE_GENERATE_ERROR` | - |
| `SettingsError` | `SETTINGS_ERROR` | `missingRequired()`, `invalidValue()` |
| `FileError` | `FILE_ERROR` | `notFound()`, `writeFailed()` |
| `PluginError` | `PLUGIN_ERROR` | - |

#### Utility Function

```javascript
formatErrorSummary(errors: (string | Error)[]) → string
```

---

## 4. Template Settings Schema

### JSON Schema

Settings files support JSON Schema for IDE validation:

```json
{
  "$schema": "node_modules/generator.handlebars/schemas/template-settings.schema.json"
}
```

### Properties Reference

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `Target` | string | No | `"Model"` | Model property to iterate |
| `TargetItem` | string | No | `"item"` | Variable name for current item |
| `ExportPath` | string | Yes | - | Output path (Handlebars expression) |
| `AppendToExisting` | boolean | No | `false` | Append vs overwrite |
| `SplitOn` | string | No | - | Split marker |
| `FileNamePattern` | string | No | - | Regex with `FileName` capture |
| `RemoveFileName` | boolean | No | `true` | Remove filename marker |

### Path Escaping

Double-escape backslashes before Handlebars expressions:

```json
{
  "ExportPath": ".\\Generated\\\\{{item.Name}}.cs"
}
```

---

## 5. Handlebars Helpers Reference

### Conditional Helpers

#### ifEquals / ifNotEquals
```handlebars
{{#ifEquals value1 value2}}Equal{{else}}Not equal{{/ifEquals}}
{{#ifNotEquals status "inactive"}}Active{{/ifNotEquals}}
```

### String Helpers

```handlebars
{{camelCase "PascalCase"}}        → pascalCase
{{upperCase name}}                → JOHN
{{lowerCase name}}                → john
{{replace name "old" "new"}}      → replaced string
{{concat firstName " " lastName}} → John Doe
```

### Collection Helpers

#### where - Filter with expression
```handlebars
{{#each (where items "IsActive eq true;Type ne System")}}
  {{Name}}
{{/each}}
```

**Filter Syntax:** `"property operator value[;property operator value]"`
**Operators:** `eq` (equals), `ne` (not equals)

#### first - Get first matching
```handlebars
{{#with (first items "Type eq Primary")}}
  Primary: {{Name}}
{{/with}}
```

#### any - Check if matches exist
```handlebars
{{#if (any items "IsRequired eq true")}}Has required{{/if}}
```

#### orderBy - Sort collection
```handlebars
{{#each (orderBy items "SortOrder")}}{{Name}}{{/each}}
```

#### findIn / existsIn - Lookup by property
```handlebars
{{#if (existsIn users "Id" currentUserId)}}User exists{{/if}}
{{#with (findIn users "Id" currentUserId)}}Found: {{Name}}{{/with}}
```

#### contains - Array includes
```handlebars
{{#if (contains roles "admin")}}Is admin{{/if}}
```

### Type Helpers

```handlebars
{{getType property}}              → string, int?, MyEnum
{{#if (isSystemType "string")}}System type{{/if}}
{{getSqlType property}}           → [nvarchar](50), [int]
{{getSystemType "int"}}           → Int32
{{#if (isNumber value)}}Numeric{{/if}}
```

---

## 6. CLI Reference

### Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `generate` | `gen` | Generate files from templates |
| `validate` | `val` | Validate templates |
| `preview` | - | Preview output without writing |
| `list` | `ls` | List templates in directory |
| `watch` | - | Watch and auto-regenerate |

### generate
```bash
generator-hbs generate -t <templates> -m <model> [options]
  -t, --templates <path>    Templates directory (required)
  -m, --model <path>        Model JSON file (required)
  -o, --output <path>       Override output directory
  --dry-run                 Preview without writing
  --continue-on-error       Continue on template errors
  -v, --verbose             Detailed output
```

### validate
```bash
generator-hbs validate -t <templates> [-v]
```

### preview
```bash
generator-hbs preview -t <templates> -m <model> [--json] [--full]
```

### list
```bash
generator-hbs list -t <templates> [--json]
```

### watch
```bash
generator-hbs watch -t <templates> -m <model> [--continue-on-error] [-v]
```

---

## 7. Script Hooks

Optional `.hbs.js` files provide lifecycle hooks for model transformation.

```javascript
module.exports = {
  // Transform entire model before processing
  prepareModel: (model) => ({ ...model, processed: true }),
  
  // Transform target array before iteration
  prepareTarget: (target) => target.filter(item => item.IsActive),
  
  // Transform each item before template execution
  prepareItem: (item) => ({ ...item, computed: item.a + item.b }),
  
  // Transform the combined {item, model} object
  prepareItemModel: (itemModel) => itemModel
};
```

### Execution Order

```
prepareModel(model) → prepareTarget(target) → 
  For each: prepareItem(item) → prepareItemModel({item, model}) → Execute
```

---

## 8. TypeScript Support

The package includes TypeScript declarations (`index.d.ts`).

```typescript
import Generator from 'generator.handlebars';

const loader = new Generator.TemplateLoader('./templates');
loader.load();
const results = await loader.generateAsync(model);
```

---

## 9. Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `handlebars` | ^4.7.8 | Template engine |
| `commander` | ^14.0.2 | CLI framework |
| `chokidar` | ^5.0.0 | File watching |

---

## Appendix A: System Type Mappings

### Supported Types
```
string, int, long, short, byte, bool, boolean, decimal, float, double,
DateTime, DateTimeOffset, Guid, TimeSpan, byte[], object, dynamic
```

### SQL Type Mappings

| Source | SQL Type |
|--------|----------|
| int | `[int]` |
| long | `[bigint]` |
| short | `[smallint]` |
| bool | `[bit]` |
| decimal | `[decimal](p,s)` |
| string | `[nvarchar](len)` |
| DateTime | `[datetime2]` |
| Guid | `[uniqueidentifier]` |
| byte[] | `[varbinary](max)` |

### .NET System Type Mappings

| Source | System Type |
|--------|-------------|
| int | `Int32` |
| string | `String` |
| bool | `Boolean` |
| decimal | `Decimal` |
| DateTime | `DateTime` |
| Guid | `Guid` |
