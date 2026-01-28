# generator.handlebars
The Generator.Handlebars NPM package provides a template code generation library based on the Handlebars template engine.
The library is easily installed via npm and provides a set of tools to generate any text-based asset from a JSON datasource.


## Installation

```bash
npm install --save generator.handlebars
```

## CLI Usage

The package includes a command-line interface for quick generation:

```bash
# Generate files from templates
npx generator-hbs generate -t ./templates -m ./model.json

# Preview output without writing files
npx generator-hbs generate -t ./templates -m ./model.json --dry-run

# Validate templates
npx generator-hbs validate -t ./templates

# List available templates
npx generator-hbs list -t ./templates

# Watch mode - regenerate on changes
npx generator-hbs watch -t ./templates -m ./model.json
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `generate` | Generate files from templates |
| `validate` | Validate templates without generating |
| `preview` | Preview generated output |
| `list` | List templates in a directory |
| `watch` | Watch for changes and regenerate |

### Test
```bash
node generate.js
```

## Programmatic Usage
___

### 1. Include the library
```javascript
const Generator = require('generator.handlebars');
```
___

### 2. Load or define a model
```javascript
// Load a model
const model = require("./sample-templates/sample-model.json");

// Or

// Define a model
const model = {
    Description: "Test Model",
    Items: [
        { 
            Name: "ItemA", 
            Description: "Item - A", 
            Options: [ 
                { Id: "A", Description: "Option A" },
                { Id: "B", Description: "Option B" }
            ] 
        },
        { 
            Name: "ItemB", 
            Description: "Item - B", 
            Options: [ 
                { Id: "C", Description: "Option C" },
                { Id: "D", Description: "Option D" }
            ] 
        }
    ]
};
```
___


### 3. Define a template

Create a Handlebars template file: ./sample-templates/sample.hbs

```hbs
This sample template is generated for each item in model.Items.

You have access to the entire model:
  Model Description: {{model.Description}}

You have access to the current scoped item in the Items array:
  Item Name: {{item.Name}}
    Description: {{item.Description}}
    Options:
      {{#each item.Options}}
        Id: {{Id}}  Description: {{Description}}
      {{/each}}
```
___

### 4. Define the template settings

Create a template settings file: ./sample-templates/sample.hbs.settings.json

```json
{
    "Target": "Items",
    "TargetItem": "item",
    "ExportPath": ".\\Generated\\Items\\\\{{item.Name}}.txt",
    "AppendToExisting": false
}
```

**Note:** _When using backslashes in a path, you must escape the backslashes an additional time if it precedes a Handldebars expression_
___


### 5. Create a Template Loader

Create a Template Loader and pass it the path to the directory containing the templates.
The loader will automatically load all template files ending in ".hbs" and their corresponding settings ".hbs.settings.json"

```javascript
const loader = new Generator.TemplateLoader('./sample-templates');
```
___

### 6. Load and generate the templates

  1. Call the `loader.load()` function and pass a callback that recieves an array of loaded templates.
  1. Iterate the loaded template array and call `template.generate()` for each template passing in your model.
  1. Call `template.write()` on a generated template to write the generated template to its defined file.

```javascript
// Load the templates
loader.load();

// Generate the loaded templates.
loader.generate(model, (loader) => { console.log("Templates Generated."); });
```

Or

```javascript
// Load and generate
loader.loadAndGenerate(model, (loader) => { console.log('Templates loaded and generated.'); });
```

Or

```javascript
// Load the templates with a callback containing the list of loaded templates
loader.load(function (templates) {
    // Interate the templates and generate each with the supplied model
    for (const template of templates) {
        console.log(`Generating template: ${template.name}`)
        // Generate the template
        template.generate(model);
        // Write the generated template to file
        template.write();
    }
});
```
___

### 7. Async/Await Support

All core operations support async/await for non-blocking I/O:

```javascript
// Async generation with TemplateLoader
const loader = new Generator.TemplateLoader('./sample-templates');
loader.load();
const results = await loader.generateAsync(model, { write: true });

// One-liner: load and generate
const results = await Generator.TemplateLoader.loadAndGenerateAsync('./sample-templates', model);

// Async file writing with Template
const template = new Generator.Template('./sample-templates/sample.hbs');
const results = template.generate(model);
await template.writeAsync(results);
```
___

### 8. Validation & Preview Mode

Validate templates before generation and preview output without writing:

```javascript
// Validate a single template
const template = new Generator.Template('./sample-templates/sample.hbs');
const isValid = template.validate();
if (!isValid) console.error(template.errors);

// Validate all templates in a loader
const loader = new Generator.TemplateLoader('./sample-templates');
loader.load();
const allValid = loader.validateAll();

// Preview mode (dry-run) - get output without writing files
const previews = loader.preview(model);
previews.forEach(p => {
  console.log(`Would write to: ${p.filePath}`);
  console.log(`Content: ${p.content}`);
});

// Generate without writing
const results = loader.generate(model, { write: false });
```
___

### 9. Error Handling

Classes accumulate non-fatal errors in an `errors` array:

```javascript
const template = new Generator.Template(path);
template.generate(model);

if (template.errors.length > 0) {
  template.errors.forEach(err => console.error(err));
}

// TemplateLoader supports continueOnError option
const loader = new Generator.TemplateLoader(dir);
loader.load();
loader.generate(model, { continueOnError: true });
console.log(loader.errors); // Array of errors from all templates
```___

### 10. Handlebars Partials

Partials allow you to create reusable template fragments. The library supports partials with the `.hbs.partial` or `.partial.hbs` extension.

#### Automatic Loading

Partials in template directories are automatically loaded when using `TemplateLoader`:

```javascript
const loader = new Generator.TemplateLoader('./sample-templates');
loader.load(); // Automatically registers partials from the directory

console.log(loader.partials); // ['header', 'itemDetails']
```

#### Using Partials in Templates

Reference partials with the `{{> partialName}}` syntax:

```hbs
{{!-- header.hbs.partial --}}
==========================
{{title}}
Generated: {{timestamp}}
==========================

{{!-- main template --}}
{{> header title="My Document" timestamp="2024-01-01"}}

{{#each items}}
  {{> itemDetails}}
{{/each}}
```

#### Manual Partial Registration

You can also register partials programmatically:

```javascript
const { HandlebarsHelpers } = require('generator.handlebars');

// Register from string
HandlebarsHelpers.registerPartial('myPartial', '<div>{{name}}</div>');

// Register from file
HandlebarsHelpers.registerPartialFromFile('header', './partials/header.hbs.partial');

// Load all partials from a directory
const registered = HandlebarsHelpers.loadPartialsFromDirectory('./partials');
console.log(registered); // ['header', 'footer', 'sidebar']

// Get all registered partials
const allPartials = HandlebarsHelpers.getPartials();

// Unregister a partial
HandlebarsHelpers.unregisterPartial('myPartial');
```

#### Partial File Naming Convention

- `name.hbs.partial` - Partial named "name"
- `name.partial.hbs` - Also supported, partial named "name"___

### 11. Plugin System

Extend the generator with custom helpers, partials, and lifecycle hooks:

```javascript
const { pluginManager, PluginManager } = require('generator.handlebars');

// Register a plugin with custom helpers
pluginManager.register({
  name: 'my-custom-helpers',
  version: '1.0.0',
  helpers: {
    pluralize: (word) => word + 's',
    formatDate: (date) => new Date(date).toLocaleDateString()
  },
  partials: {
    copyright: '© {{year}} {{company}}'
  }
});

// Use factory methods for simple plugins
const helperPlugin = PluginManager.createHelperPlugin('string-utils', {
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1)
});
pluginManager.register(helperPlugin);

// Check registered plugins
console.log(pluginManager.plugins); // ['my-custom-helpers', 'string-utils']

// Unregister when done
pluginManager.unregister('my-custom-helpers');
```

#### Plugin Lifecycle Hooks

Plugins can hook into the generation lifecycle:

```javascript
pluginManager.register({
  name: 'logging-plugin',
  onBeforeGenerate: (model) => console.log('Starting generation...'),
  onAfterGenerate: (results) => console.log(`Generated ${results.length} files`),
  transformModel: (model) => ({ ...model, timestamp: new Date() })
});
```
___

### 12. TypeScript Support

The package includes TypeScript declarations for full IDE support:

```typescript
import Generator from 'generator.handlebars';

const loader = new Generator.TemplateLoader('./templates');
loader.load();

const results = await loader.generateAsync(model, { write: true });
```
___

### 13. Custom Error Classes

The package provides detailed error classes for better debugging:

```javascript
const { 
  GeneratorError,
  TemplateLoadError,
  TemplateCompileError,
  FileError,
  formatErrorSummary
} = require('generator.handlebars');

try {
  // ... generation code
} catch (err) {
  if (err instanceof TemplateCompileError) {
    console.log(err.toDetailedString());
    // [TEMPLATE_COMPILE_ERROR] Failed to compile template
    //   Template: myTemplate
    //   File: myTemplate.hbs
    //   Line: 42
  }
}

// Format multiple errors
console.log(formatErrorSummary(loader.errors));
```
___

### 14. JSON Schema for Settings

Template settings files support JSON Schema for IDE validation:

```json
{
  "$schema": "node_modules/generator.handlebars/schemas/template-settings.schema.json",
  "Target": "Items",
  "TargetItem": "item",
  "ExportPath": ".\\Generated\\\\{{item.Name}}.cs"
}
```
