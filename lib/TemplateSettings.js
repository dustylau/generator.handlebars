class TemplateSettings {
  static DefaultTarget = 'Model';
  static DefaultTargetItem = 'item';
  static DefaultTargetProperty = 'target';
  static DefaultModelProperty = 'model';
  static DefaultTargetItemNameProperty = 'Name';
  static DefaultPrepareExportPathUsingTemplate = true;
  static DefaultPrepareExportPathUsingReplace = false;

  constructor(initialData) {
    this._target = initialData.Target || TemplateSettings.DefaultTarget;
    this._targetItem = initialData.TargetItem || TemplateSettings.DefaultTargetItem;
    this._targetProperty = initialData.TargetProperty || TemplateSettings.DefaultTargetProperty;
    this._modelProperty = initialData.ModelProperty || TemplateSettings.DefaultModelProperty;
    this._targetItemNameProperty =
      initialData.TargetItemNameProperty || TemplateSettings.DefaultTargetItemNameProperty;
    this._exportPath = initialData.ExportPath || null;
    this._prepareExportPathUsingTemplate =
      initialData.PrepareExportPathUsingTemplate ||
      TemplateSettings.DefaultPrepareExportPathUsingTemplate;
    this._prepareExportPathUsingReplace =
      initialData.PrepareExportPathUsingReplace ||
      TemplateSettings.DefaultPrepareExportPathUsingReplace;
    this._appendToExisting = initialData.AppendToExisting || false;
    this._fileNamePattern = initialData.FileNamePattern || null;
    this._splitOn = initialData.SplitOn || null;
    this._removeFileName = initialData.RemoveFileName || false;

    // Phase 5C: Conditional generation
    this._generateIf = initialData.GenerateIf || null;
    this._skipIf = initialData.SkipIf || null;
    this._enabled = initialData.Enabled !== false; // Default true
    this._description = initialData.Description || null;
  }

  get target() {
    return this._target;
  }

  get targetItem() {
    return this._targetItem;
  }

  get targetProperty() {
    return this._targetProperty;
  }

  get modelProperty() {
    return this._modelProperty;
  }

  get targetItemNameProperty() {
    return this._targetItemNameProperty;
  }

  get exportPath() {
    return this._exportPath;
  }

  get prepareExportPathUsingTemplate() {
    return this._prepareExportPathUsingTemplate;
  }

  get prepareExportPathUsingReplace() {
    return this._prepareExportPathUsingReplace;
  }

  get appendToExisting() {
    return this._appendToExisting;
  }

  get fileNamePattern() {
    return this._fileNamePattern;
  }

  get removeFileName() {
    return this._removeFileName;
  }

  get splitOn() {
    return this._splitOn;
  }

  /**
   * Condition expression for when to generate.
   * If specified, the template only generates when this evaluates to true.
   * Format: "propertyPath operator value" (e.g., "Model.type eq entity")
   * @returns {string|null}
   */
  get generateIf() {
    return this._generateIf;
  }

  /**
   * Condition expression for when to skip generation.
   * If specified, the template is skipped when this evaluates to true.
   * Format: "propertyPath operator value" (e.g., "item.IsAbstract eq true")
   * @returns {string|null}
   */
  get skipIf() {
    return this._skipIf;
  }

  /**
   * Whether this template is enabled for generation.
   * Defaults to true.
   * @returns {boolean}
   */
  get enabled() {
    return this._enabled;
  }

  /**
   * Optional description of what this template generates.
   * @returns {string|null}
   */
  get description() {
    return this._description;
  }

  /**
   * Evaluates a condition expression against a context.
   * @param {string} expression - The condition expression.
   * @param {object} context - The context object to evaluate against.
   * @returns {boolean} True if condition is met.
   */
  static evaluateCondition(expression, context) {
    if (!expression || typeof expression !== 'string') {
      return true; // No condition = always true
    }

    const parts = expression.trim().split(/\s+/);
    if (parts.length < 3) {
      console.warn(
        `Invalid condition expression: "${expression}". Expected format: "path operator value"`
      );
      return true;
    }

    const [path, operator, ...valueParts] = parts;
    const expectedValue = valueParts.join(' ');

    // Get the actual value from the context using dot notation
    const actualValue = TemplateSettings.getValueByPath(context, path);

    // Parse expected value
    let parsedExpected = expectedValue;
    if (expectedValue === 'true') parsedExpected = true;
    else if (expectedValue === 'false') parsedExpected = false;
    else if (expectedValue === 'null') parsedExpected = null;
    else if (expectedValue === 'undefined') parsedExpected = undefined;
    else if (!isNaN(expectedValue) && expectedValue !== '') parsedExpected = Number(expectedValue);

    // Evaluate based on operator
    switch (operator.toLowerCase()) {
      case 'eq':
      case '==':
      case '===':
        return actualValue == parsedExpected;
      case 'ne':
      case '!=':
      case '!==':
        return actualValue != parsedExpected;
      case 'gt':
      case '>':
        return actualValue > parsedExpected;
      case 'lt':
      case '<':
        return actualValue < parsedExpected;
      case 'gte':
      case 'ge':
      case '>=':
        return actualValue >= parsedExpected;
      case 'lte':
      case 'le':
      case '<=':
        return actualValue <= parsedExpected;
      case 'contains':
        return String(actualValue).includes(String(parsedExpected));
      case 'startswith':
        return String(actualValue).startsWith(String(parsedExpected));
      case 'endswith':
        return String(actualValue).endsWith(String(parsedExpected));
      case 'matches':
        try {
          return new RegExp(parsedExpected).test(String(actualValue));
        } catch {
          return false;
        }
      case 'exists':
        return actualValue !== undefined && actualValue !== null;
      case 'empty':
        return !actualValue || (Array.isArray(actualValue) && actualValue.length === 0);
      default:
        console.warn(`Unknown operator: "${operator}"`);
        return true;
    }
  }

  /**
   * Gets a value from an object using dot-notation path.
   * @param {object} obj - The object to traverse.
   * @param {string} path - The dot-notation path.
   * @returns {*} The value at the path.
   */
  static getValueByPath(obj, path) {
    if (!obj || !path) return undefined;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Checks if this template should generate based on conditions.
   * @param {object} context - The context containing Model and item.
   * @returns {boolean} True if should generate.
   */
  shouldGenerate(context) {
    // Check if disabled
    if (!this._enabled) {
      return false;
    }

    // Check environment variable condition
    if (this._generateIf && this._generateIf.startsWith('env:')) {
      const envVar = this._generateIf.slice(4);
      const envValue = process.env[envVar];
      if (!envValue || envValue === 'false' || envValue === '0') {
        return false;
      }
    }
    // Check model condition
    else if (this._generateIf) {
      if (!TemplateSettings.evaluateCondition(this._generateIf, context)) {
        return false;
      }
    }

    // Check skip condition
    if (this._skipIf) {
      if (this._skipIf.startsWith('env:')) {
        const envVar = this._skipIf.slice(4);
        const envValue = process.env[envVar];
        if (envValue && envValue !== 'false' && envValue !== '0') {
          return false;
        }
      } else if (TemplateSettings.evaluateCondition(this._skipIf, context)) {
        return false;
      }
    }

    return true;
  }
}

exports.TemplateSettings = TemplateSettings;
