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
      const extracted = this._extractFileNameFromSection(
        section,
        defaultFileName,
      );

      const result = new TemplateResult(
        Template.prepareExportPath(this._settings, extracted.fileName, model),
        extracted.section,
        this._settings.appendToExisting,
      );

      this._result.push(result);
    }
  }

  /**
   * Generates output from the template using the provided model.
   * @param {object} model - The data model to use for generation.
   */
  generate(model) {
    this._result = [];
    this._errors = [];

    if (!this._isLoaded) {
      throw new Error(
        `Template "${this._name || 'unknown'}" is not loaded. Check errors property for details.`,
      );
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

    if (
      !Helpers.isEmpty(this._settings.target) &&
      this._settings.target !== 'Model'
    ) {
      target = model[this._settings.target];
    }

    if (this._script && this._script.prepareTarget) {
      target = this._script.prepareTarget(target);
      if (target === null) {
        throw new Error('Prepare Target script did not return a valid target.');
      }
    }

    if (!Array.isArray(target)) {
      const content = this._template(target);
      if (!this._settings.splitOn) {
        const result = new TemplateResult(
          Template.prepareExportPath(this._settings, null, target),
          content,
          this._settings.appendToExisting,
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
          throw new Error(
            'Prepare Item Model script did not return a valid item model.',
          );
        }
      }

      const content = this._template(processedItemModel);

      if (!this._settings.splitOn) {
        const result = new TemplateResult(
          Template.prepareExportPath(this._settings, null, processedItemModel),
          content,
          this._settings.appendToExisting,
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
   * Writes all generated results to the file system.
   */
  write() {
    for (const result of this._result) {
      result.write();
    }
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
        exportPath = exportPath.replace(
          nameReplacement,
          model[targetItemNameProperty],
        );
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
