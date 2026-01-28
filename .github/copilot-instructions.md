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
  "Target": "Items", // Model property to iterate (use "Model" for single output)
  "TargetItem": "item", // Variable name in template for current item
  "ExportPath": ".\\Out\\{{item.Name}}.txt", // Handlebars expression for output path
  "AppendToExisting": false,
  "SplitOn": "//##SPLIT##", // Split single template output into multiple files
  "FileNamePattern": "//\\[(?<FileName>[\\w]+)\\]", // Regex with FileName capture group
  "RemoveFileName": true
}
```

**Path escaping**: Double-escape backslashes before Handlebars expressions: `\\\\{{var}}`

## Custom Handlebars Helpers

Available in templates via `HandlebarsHelpers.js` → `Helpers.js`:

- String: `camelCase`, `upperCase`, `lowerCase`, `replace`, `concat`
- Conditionals: `ifEquals`, `ifNotEquals`
- Collections: `where`, `orderBy`, `first`, `any`, `findIn`, `existsIn`
- Type utilities: `getType`, `isSystemType`, `getSqlType`, `isNumber`, `contains`

### Filter syntax for `where` helper

```handlebars
{{#each (where Items "IsActive eq true;Type ne System")}}
```

## Script Hooks (Optional .hbs.js files)

Templates can include preparation scripts with these hooks:

```javascript
module.exports = {
  prepareModel: function (model) {
    return model;
  },
  prepareTarget: function (target) {
    return target;
  },
  prepareItem: function (item) {
    return item;
  },
  prepareItemModel: function (itemModel) {
    return itemModel;
  },
};
```

## Development Commands

```bash
node generate.js     # Run sample generation (outputs to ./Generated/)
npm install          # Runs postinstall.js to copy sample-templates
```

## Code Patterns

- **Properties**: Use getter/setter pattern with `_` prefix for private fields
- **Exports**: CommonJS modules (`module.exports` / `exports.ClassName`)
- **Callbacks**: Support callback-based async pattern (not Promises)
- **File paths**: Handle both `/` and `\` separators, normalize in path construction

## When Adding New Helpers

1. Implement function in `lib/Helpers.js`
2. Register with Handlebars in `lib/HandlebarsHelpers.js`:
   ```javascript
   Handlebars.registerHelper('helperName', Helpers.helperName);
   ```

## Sample Templates Reference

See `sample-templates/` for working examples:

- `sample.hbs` - Basic iteration over model array
- `sample-full-model.hbs` - Single output from full model
- `sample-full-model-split.hbs` - Split output into multiple files
- `sample-from-list.hbs` - Alternative target array
