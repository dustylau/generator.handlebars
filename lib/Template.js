const fs = require('fs');
const Handlebars = require('handlebars');
const { TemplateResult } = require('./TemplateResult');
const { TemplateSettings } = require('./TemplateSettings');
const Helpers = require('./Helpers');
const { resolve } = require('path');

/**
 * Represents a Handlebars template with associated settings and generation logic.
 */
class Template {
  static defaultPrepareScript = {
    prepareModel: (model) => model,
    prepareTarget: (target) => target,
    prepareItem: (item) => item,
    prepareItemModel: (itemModel) => itemModel,
  };

  /**
   * Creates a new Template instance.
   * @param {string} directoryPath - The directory containing the template files.
   * @param {string} fileName - The template file name.
   */
  constructor(directoryPath, fileName) {
    this.initialize();
    this.load(directoryPath, fileName);
  }

  initialize() {
    this._name = null;
    this._templatePath = null;
    this._templateSettingsPath = null;
    this._scriptPath = null;
    this._templateContent = null;
    this._settings = null;
    this._isGenerated = false;
    this._result = [];
    this._isLoaded = false;
    this._script = Template.defaultPrepareScript;
    this._errors = [];
    this._skippedItems = [];
  }

  /**
   * Loads a template and its settings from the file system.
   * @param {string} directoryPath - The directory containing the template files.
   * @param {string} fileName - The template file name.
   */
  load(directoryPath, fileName) {
    const templateSettingsPattern = /\w+\.hbs\.json/i;
    const templatePattern = /\w+\.hbs/i;

    if (directoryPath.endsWith('/') || directoryPath.endsWith('\\')) {
      directoryPath = directoryPath.substring(0, directoryPath.length - 1);
    }

    let name = '';
    let result = templateSettingsPattern.exec(fileName);

    if (result) {
      name = fileName.replace('.hbs.settings.json', '');
    } else {
      result = templatePattern.exec(fileName);
      if (!result) return;
      name = fileName.replace('.hbs', '');
    }

    const templateSettingsFile = `${name}.hbs.settings.json`;
    const templateFile = `${name}.hbs`;
    const scriptFile = `${templateFile}.js`;

    this._templatePath = `${directoryPath}/${templateFile}`;
    this._templateSettingsPath = `${directoryPath}/${templateSettingsFile}`;
    this._scriptPath = `${directoryPath}/${scriptFile}`;

    try {
      const templateContent = fs.readFileSync(this._templatePath, {
        encoding: 'utf8',
      });
      const settingsContent = fs.readFileSync(this._templateSettingsPath, {
        encoding: 'utf8',
      });

      if (fs.existsSync(this._scriptPath)) {
        this._script = require(resolve(this._scriptPath));
      } else {
        this._script = null;
      }

      this._name = name;
      this._templateContent = templateContent;
      this._template = Handlebars.compile(templateContent);
      this._settings = new TemplateSettings(JSON.parse(settingsContent));
      this._isLoaded = true;
    } catch (error) {
      this._errors.push({
        phase: 'load',
        message: `Failed to load template "${name}": ${error.message}`,
        error,
      });
      this._isLoaded = false;
    }
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }
  get templatePath() {
    return this._templatePath;
  }
  get templateSettingsPath() {
    return this._templateSettingsPath;
  }
  get scriptPath() {
    return this._scriptPath;
  }
  get templateContent() {
    return this._templateContent;
  }
  get template() {
    return this._template;
  }
  get settings() {
    return this._settings;
  }
  get isLoaded() {
    return this._isLoaded;
  }
  get isGenerated() {
    return this._isGenerated;
  }
  get result() {
    return this._result;
  }
  get errors() {
    return this._errors;
  }

  /**
   * Extracts filename and processes section content based on fileNamePattern settings.
   * @param {string} section - The content section to process.
   * @param {string} defaultFileName - Default filename if pattern doesn't match.
   * @returns {{fileName: string, section: string}} Processed section and filename.
   * @private
   */
  _extractFileNameFromSection(section, defaultFileName) {
    let fileName = defaultFileName;

    if (this._settings.fileNamePattern) {
      const regex = new RegExp(this._settings.fileNamePattern);
      const nameMatch = regex.exec(section);

      if (nameMatch && nameMatch.groups && nameMatch.groups.FileName) {
        if (this._settings.removeFileName) {
          section = section.replace(nameMatch[0], '');
        }
        fileName = nameMatch.groups.FileName;
      } else {
        this._errors.push({
          phase: 'generate',
          message: `FileNamePattern "${this._settings.fileNamePattern}" did not match in section. Using default: ${defaultFileName}`,
        });
      }
    }

    return { fileName, section: section.trim() };
  }

  /**
   * Processes split content into multiple TemplateResults.
   * @param {string} content - The full generated content.
   * @param {object} model - The model used for export path generation.
   * @param {string} namePrefix - Prefix for default filenames.
   * @private
   */
  _processSplitContent(content, model, namePrefix) {
    const sections = content.split(this._settings.splitOn);

    for (let index = 0; index < sections.length; index++) {
      let section = sections[index];

      if (section.trim().length <= 0) {
        continue;
      }

      const defaultFileName = `${namePrefix}-${index}`;
      const extracted = this._extractFileNameFromSection(section, defaultFileName);

      const result = new TemplateResult(
        Template.prepareExportPath(this._settings, extracted.fileName, model),
        extracted.section,
        this._settings.appendToExisting
      );

      this._result.push(result);
    }
  }

  /**
   * Generates output from the template using the provided model.
   * @param {object} model - The data model to use for generation.
   * @returns {{skipped: boolean, reason?: string}|void} Returns skip info if template was skipped.
   */
  generate(model) {
    this._result = [];
    this._errors = [];
    this._skippedItems = [];

    if (!this._isLoaded) {
      throw new Error(
        `Template "${this._name || 'unknown'}" is not loaded. Check errors property for details.`
      );
    }

    // Check if template is enabled
    if (!this._settings.enabled) {
      this._isGenerated = false;
      return { skipped: true, reason: 'Template is disabled' };
    }

    const targetProperty = this._settings.targetProperty || 'target';
    const modelProperty = this._settings.modelProperty || 'model';
    const itemModelProperty = this._settings.targetItem || 'item';

    if (this._script && this._script.prepareModel) {
      model = this._script.prepareModel(model);
      if (model === null) {
        throw new Error('Prepare Model script did not return a valid model.');
      }
    }

    let target = model;

    if (!Helpers.isEmpty(this._settings.target) && this._settings.target !== 'Model') {
      target = model[this._settings.target];
    }

    if (this._script && this._script.prepareTarget) {
      target = this._script.prepareTarget(target);
      if (target === null) {
        throw new Error('Prepare Target script did not return a valid target.');
      }
    }

    if (!Array.isArray(target)) {
      // Check conditional generation for non-array target
      const context = { Model: model, [modelProperty]: model, [targetProperty]: target };
      if (!this._settings.shouldGenerate(context)) {
        this._isGenerated = false;
        return { skipped: true, reason: this._getSkipReason() };
      }

      const content = this._template(target);
      if (!this._settings.splitOn) {
        const result = new TemplateResult(
          Template.prepareExportPath(this._settings, null, target),
          content,
          this._settings.appendToExisting
        );
        this._result.push(result);
      } else {
        this._processSplitContent(content, target, this.name);
      }

      this._isGenerated = true;
      return;
    }

    for (const item of target) {
      let processedItem = item;

      if (this._script && this._script.prepareItem) {
        processedItem = this._script.prepareItem(processedItem);
        if (processedItem === null) {
          throw new Error('Prepare Item script did not return a valid item.');
        }
      }

      const itemModel = {
        [targetProperty]: target,
        [modelProperty]: model,
        [itemModelProperty]: processedItem,
      };

      let processedItemModel = itemModel;

      if (this._script && this._script.prepareItemModel) {
        processedItemModel = this._script.prepareItemModel(processedItemModel);
        if (processedItemModel === null) {
          throw new Error('Prepare Item Model script did not return a valid item model.');
        }
      }

      // Check conditional generation for each item
      const context = { Model: model, ...processedItemModel };
      if (!this._settings.shouldGenerate(context)) {
        this._skippedItems.push({
          item: processedItem,
          reason: this._getSkipReason(),
        });
        continue;
      }

      const content = this._template(processedItemModel);

      if (!this._settings.splitOn) {
        const result = new TemplateResult(
          Template.prepareExportPath(this._settings, null, processedItemModel),
          content,
          this._settings.appendToExisting
        );
        this._result.push(result);
      } else {
        const namePrefix = `${this.name}-${processedItem.Name || 'item'}`;
        this._processSplitContent(content, processedItemModel, namePrefix);
      }
    }

    this._isGenerated = true;
  }

  /**
   * Gets the reason for skipping generation.
   * @returns {string} The skip reason.
   * @private
   */
  _getSkipReason() {
    if (!this._settings.enabled) {
      return 'Template is disabled';
    }
    if (this._settings.generateIf) {
      return `GenerateIf condition not met: ${this._settings.generateIf}`;
    }
    if (this._settings.skipIf) {
      return `SkipIf condition met: ${this._settings.skipIf}`;
    }
    return 'Unknown';
  }

  /**
   * Gets the list of items that were skipped during generation.
   * @returns {Array<{item: object, reason: string}>}
   */
  get skippedItems() {
    return this._skippedItems || [];
  }

  /**
   * Writes all generated results to the file system.
   */
  write() {
    for (const result of this._result) {
      result.write();
    }
  }

  /**
   * Writes all generated results to the file system asynchronously.
   * @returns {Promise<void>}
   */
  async writeAsync() {
    for (const result of this._result) {
      await result.writeAsync();
    }
  }

  /**
   * Returns all results as preview objects without writing (dry-run mode).
   * @returns {Array<{filePath: string, content: string, appendToExisting: boolean}>}
   */
  getPreview() {
    return this._result.map((result) => result.toPreview());
  }

  /**
   * Validates the template without generating output.
   * Checks template syntax, settings validity, and script hooks.
   * @returns {{valid: boolean, errors: Array<{type: string, message: string}>}}
   */
  validate() {
    const errors = [];

    // Check if loaded
    if (!this._isLoaded) {
      errors.push({
        type: 'load',
        message: `Template not loaded. ${this._errors.map((e) => e.message).join('; ')}`,
      });
      return { valid: false, errors };
    }

    // Validate template content exists
    if (!this._templateContent || this._templateContent.trim().length === 0) {
      errors.push({
        type: 'template',
        message: 'Template content is empty',
      });
    }

    // Validate settings
    if (!this._settings) {
      errors.push({
        type: 'settings',
        message: 'Template settings are missing',
      });
    } else {
      if (!this._settings.exportPath) {
        errors.push({
          type: 'settings',
          message: 'ExportPath is required in template settings',
        });
      }

      if (this._settings.fileNamePattern) {
        try {
          new RegExp(this._settings.fileNamePattern);
          if (!this._settings.fileNamePattern.includes('FileName')) {
            errors.push({
              type: 'settings',
              message: 'FileNamePattern should contain a named capture group "FileName"',
            });
          }
        } catch (e) {
          errors.push({
            type: 'settings',
            message: `Invalid FileNamePattern regex: ${e.message}`,
          });
        }
      }
    }

    // Validate script hooks if present
    if (this._script) {
      const validHooks = ['prepareModel', 'prepareTarget', 'prepareItem', 'prepareItemModel'];
      for (const key of Object.keys(this._script)) {
        if (!validHooks.includes(key)) {
          errors.push({
            type: 'script',
            message: `Unknown script hook: "${key}". Valid hooks: ${validHooks.join(', ')}`,
          });
        }
        if (typeof this._script[key] !== 'function') {
          errors.push({
            type: 'script',
            message: `Script hook "${key}" must be a function`,
          });
        }
      }
    }

    // Try to compile template to check for Handlebars syntax errors
    try {
      Handlebars.compile(this._templateContent);
    } catch (e) {
      errors.push({
        type: 'syntax',
        message: `Handlebars syntax error: ${e.message}`,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Prepares the export path by applying template or replacement logic.
   * @param {TemplateSettings} settings - The template settings.
   * @param {string|null} fileName - The filename to use.
   * @param {object} model - The model for path templating.
   * @returns {string} The prepared export path.
   */
  static prepareExportPath(settings, fileName, model) {
    const itemModelProperty = settings.targetItem || 'item';
    const targetItemNameProperty = settings.targetItemNameProperty || 'Name';
    const nameReplacement = `{${itemModelProperty}.${targetItemNameProperty}}`;

    let exportPath = settings.exportPath;

    if (settings.prepareExportPathUsingReplace) {
      if (fileName && !Helpers.isEmpty(fileName)) {
        exportPath = exportPath.replace('{FileName}', fileName);
      }

      if (
        model &&
        model[targetItemNameProperty] &&
        !Helpers.isEmpty(model[targetItemNameProperty])
      ) {
        exportPath = exportPath.replace(nameReplacement, model[targetItemNameProperty]);
      }
    }

    if (settings.prepareExportPathUsingTemplate) {
      const templateModel = model || {};
      const exportPathTemplate = Handlebars.compile(exportPath);

      if (fileName && !Helpers.isEmpty(fileName)) {
        templateModel.FileName = fileName;
      }

      exportPath = exportPathTemplate(templateModel);
    }

    return exportPath;
  }
}

module.exports = Template;
