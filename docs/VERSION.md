# Version Information

This file is automatically updated by release-please.

## Current Version

`3.0.0`

## Compatibility

| Component | Minimum Version | Recommended |
| --------- | --------------- | ----------- |
| Node.js   | 18.0.0          | 20.x LTS    |
| npm       | 8.0.0           | 10.x        |

## Feature Matrix

| Feature                    | Since   | Status  |
| -------------------------- | ------- | ------- |
| Core Template Engine       | 1.0.0   | Stable  |
| Template Loader            | 1.0.0   | Stable  |
| Custom Helpers             | 1.0.0   | Stable  |
| Partials Support           | 2.0.0   | Stable  |
| Async API                  | 2.0.0   | Stable  |
| CLI Tool                   | 2.0.0   | Stable  |
| Plugin System              | 3.0.0   | Stable  |
| Configuration Loader       | 3.0.0   | Stable  |
| Conditional Generation     | 3.0.0   | Stable  |
| Generation Statistics      | 3.0.0   | Stable  |
| Custom Error Classes       | 3.0.0   | Stable  |
| Pre-release Support        | 3.0.0   | Stable  |

## API Stability

| API                   | Stability |
| --------------------- | --------- |
| Template              | Stable    |
| TemplateLoader        | Stable    |
| TemplateSettings      | Stable    |
| TemplateResult        | Stable    |
| TemplateBuilder       | Stable    |
| HandlebarsHelpers     | Stable    |
| Helpers               | Stable    |
| FileHelper            | Stable    |
| ConfigLoader          | Stable    |
| PluginManager         | Stable    |
| GenerationStats       | Stable    |
| GeneratorError        | Stable    |

**Stability Definitions:**

- **Stable**: API is finalized and will not change in breaking ways until the next major version
- **Beta**: API is feature-complete but may have minor changes based on feedback
- **Experimental**: API is under active development and may change significantly

## Deprecations

| Deprecated Feature | Since   | Removed In | Replacement |
| ------------------ | ------- | ---------- | ----------- |
| None currently     | -       | -          | -           |

## Breaking Changes History

### Version 3.0.0

- Minimum Node.js version raised to 18.0.0
- Added strict validation in Template constructor
- Plugin hooks now receive frozen context objects

### Version 2.0.0

- Changed export structure (use named exports)
- Async methods now required for file operations
- Partials require `.hbs.partial` or `.partial.hbs` extension

### Version 1.0.0

- Initial stable release

## Documentation Versions

| Documentation       | Last Updated | Matches Version |
| ------------------- | ------------ | --------------- |
| README.md           | 3.0.0        | ✅               |
| API Reference       | 3.0.0        | ✅               |
| CLI Documentation   | 3.0.0        | ✅               |
| Migration Guide     | 3.0.0        | ✅               |
| RELEASING.md        | 3.0.0        | ✅               |
| copilot-instructions| 3.0.0        | ✅               |

---

*This file is managed by release-please. Do not edit manually.*
