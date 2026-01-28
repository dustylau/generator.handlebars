const Template = require('./Template.js');
const { FileHelper } = require('./FileHelper');

/**
 * Loads and manages template generation from a directory.
 */
class TemplateLoader {
  /**
   * Creates a new TemplateLoader.
   * @param {string|string[]} paths - Directory path(s) containing templates.
   * @param {string} [extension='.hbs'] - Template file extension.
   * @param {boolean} [recurse=true] - Whether to search subdirectories.
   */
  constructor(paths, extension = '.hbs', recurse = true) {
    this._paths = Array.isArray(paths) ? paths : [paths];
    this._extension = extension;
    this._templates = [];
    this._recurse = recurse;
    this._errors = [];
  }

  get paths() {
    return this._paths;
  }

  set paths(value) {
    this._paths = Array.isArray(value) ? value : [value];
  }

  get extension() {
    return this._extension;
  }

  set extension(value) {
    this._extension = value;
  }

  get templates() {
    return this._templates;
  }

  get errors() {
    return this._errors;
  }

  /**
   * Loads all templates from the configured paths.
   * @param {Function} [callback] - Optional callback(templates, loader).
   * @returns {Template[]} Array of loaded templates.
   */
  load(callback) {
    this._templates = [];
    this._errors = [];

    for (const path of this._paths) {
      try {
        const files = FileHelper.getFileInformationSync(path, this._recurse);

        for (const file of files) {
          if (!file.fullName.endsWith(this._extension)) {
            continue;
          }

          try {
            const template = new Template(file.directory, file.fullName);

            if (!template.isLoaded) {
              this._errors.push(...template.errors);
              continue;
            }

            const isDuplicate = this._templates.some(
              (t) => t.templatePath === template.templatePath,
            );

            if (!isDuplicate) {
              this._templates.push(template);
            }
          } catch (error) {
            this._errors.push({
              phase: 'load',
              file: file.fullName,
              message: error.message,
              error,
            });
          }
        }
      } catch (error) {
        this._errors.push({
          phase: 'load',
          path,
          message: `Failed to read directory: ${error.message}`,
          error,
        });
      }
    }

    if (callback) {
      callback(this._templates, this);
    }

    return this._templates;
  }

  /**
   * Generates all loaded templates with the given model.
   * @param {object} model - The data model for generation.
   * @param {Function} [callback] - Optional callback(loader).
   * @param {object} [options] - Generation options.
   * @param {boolean} [options.continueOnError=true] - Continue if a template fails.
   * @param {boolean} [options.write=true] - Write results to files.
   * @returns {TemplateLoader} This loader instance.
   */
  generate(model, callback, options = {}) {
    const { continueOnError = true, write = true } = options;

    for (const template of this._templates) {
      try {
        console.log(`Generating template: ${template.name}`);
        template.generate(model);

        if (write) {
          template.write();
        }
      } catch (error) {
        this._errors.push({
          phase: 'generate',
          template: template.name,
          message: error.message,
          error,
        });

        if (!continueOnError) {
          throw error;
        }
      }
    }

    if (callback) {
      callback(this);
    }

    return this;
  }

  /**
   * Loads templates and generates them with the given model.
   * @param {object} model - The data model for generation.
   * @param {Function} [callback] - Optional callback(loader).
   * @param {object} [options] - Generation options.
   * @returns {TemplateLoader} This loader instance.
   */
  loadAndGenerate(model, callback, options) {
    this.load();
    this.generate(model, null, options);

    if (callback) {
      callback(this);
    }

    return this;
  }

  /**
   * Generates all loaded templates asynchronously.
   * @param {object} model - The data model for generation.
   * @param {object} [options] - Generation options.
   * @param {boolean} [options.continueOnError=true] - Continue if a template fails.
   * @param {boolean} [options.write=true] - Write results to files.
   * @returns {Promise<TemplateLoader>} This loader instance.
   */
  async generateAsync(model, options = {}) {
    const { continueOnError = true, write = true } = options;

    for (const template of this._templates) {
      try {
        console.log(`Generating template: ${template.name}`);
        template.generate(model);

        if (write) {
          await template.writeAsync();
        }
      } catch (error) {
        this._errors.push({
          phase: 'generate',
          template: template.name,
          message: error.message,
          error,
        });

        if (!continueOnError) {
          throw error;
        }
      }
    }

    return this;
  }

  /**
   * Loads and generates templates asynchronously.
   * @param {object} model - The data model for generation.
   * @param {object} [options] - Generation options.
   * @returns {Promise<TemplateLoader>} This loader instance.
   */
  async loadAndGenerateAsync(model, options) {
    this.load();
    await this.generateAsync(model, options);
    return this;
  }

  /**
   * Validates all loaded templates without generating output.
   * @returns {{valid: boolean, results: Array<{template: string, valid: boolean, errors: Array}>}}
   */
  validateAll() {
    const results = this._templates.map((template) => ({
      template: template.name,
      ...template.validate(),
    }));

    return {
      valid: results.every((r) => r.valid),
      results,
    };
  }

  /**
   * Returns a preview of what would be generated without writing files.
   * @param {object} model - The data model for generation.
   * @param {object} [options] - Generation options.
   * @returns {Array<{template: string, files: Array<{filePath: string, content: string}>}>}
   */
  preview(model, options = {}) {
    const { continueOnError = true } = options;
    const previews = [];

    for (const template of this._templates) {
      try {
        template.generate(model);
        previews.push({
          template: template.name,
          files: template.getPreview(),
        });
      } catch (error) {
        this._errors.push({
          phase: 'preview',
          template: template.name,
          message: error.message,
          error,
        });

        if (!continueOnError) {
          throw error;
        }

        previews.push({
          template: template.name,
          files: [],
          error: error.message,
        });
      }
    }

    return previews;
  }
}

exports.TemplateLoader = TemplateLoader;
