/**
 * GeneratorError module - custom error classes with improved context.
 *
 * @module GeneratorError
 */

/**
 * Base error class for generator errors with enhanced context.
 */
class GeneratorError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Object} [context] - Additional error context
   * @param {string} [context.template] - Template name
   * @param {string} [context.file] - File path
   * @param {number} [context.line] - Line number
   * @param {string} [context.code] - Error code
   * @param {Error} [context.cause] - Original error
   */
  constructor(message, context = {}) {
    super(message);
    this.name = 'GeneratorError';
    this.template = context.template || null;
    this.file = context.file || null;
    this.line = context.line || null;
    this.code = context.code || 'GENERATOR_ERROR';
    this.cause = context.cause || null;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a formatted error message with context.
   * @returns {string}
   */
  toDetailedString() {
    const parts = [`[${this.code}] ${this.message}`];

    if (this.template) {
      parts.push(`  Template: ${this.template}`);
    }
    if (this.file) {
      parts.push(`  File: ${this.file}`);
    }
    if (this.line) {
      parts.push(`  Line: ${this.line}`);
    }
    if (this.cause) {
      parts.push(`  Caused by: ${this.cause.message}`);
    }

    return parts.join('\n');
  }

  /**
   * Returns JSON representation of the error.
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      template: this.template,
      file: this.file,
      line: this.line,
      timestamp: this.timestamp,
      cause: this.cause ? this.cause.message : null,
    };
  }
}

/**
 * Error thrown when template loading fails.
 */
class TemplateLoadError extends GeneratorError {
  constructor(message, context = {}) {
    super(message, { ...context, code: context.code || 'TEMPLATE_LOAD_ERROR' });
    this.name = 'TemplateLoadError';
  }
}

/**
 * Error thrown when template compilation fails.
 */
class TemplateCompileError extends GeneratorError {
  constructor(message, context = {}) {
    super(message, { ...context, code: context.code || 'TEMPLATE_COMPILE_ERROR' });
    this.name = 'TemplateCompileError';
  }

  /**
   * Creates error from Handlebars compilation error.
   * @param {Error} hbsError - Handlebars error
   * @param {string} templateName - Template name
   * @param {string} filePath - File path
   * @returns {TemplateCompileError}
   */
  static fromHandlebarsError(hbsError, templateName, filePath) {
    // Try to extract line number from Handlebars error
    const lineMatch = hbsError.message.match(/line (\d+)/i);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : null;

    return new TemplateCompileError(`Failed to compile template: ${hbsError.message}`, {
      template: templateName,
      file: filePath,
      line,
      cause: hbsError,
    });
  }
}

/**
 * Error thrown when template generation fails.
 */
class TemplateGenerateError extends GeneratorError {
  constructor(message, context = {}) {
    super(message, { ...context, code: context.code || 'TEMPLATE_GENERATE_ERROR' });
    this.name = 'TemplateGenerateError';
  }
}

/**
 * Error thrown when settings are invalid.
 */
class SettingsError extends GeneratorError {
  constructor(message, context = {}) {
    super(message, { ...context, code: context.code || 'SETTINGS_ERROR' });
    this.name = 'SettingsError';
  }

  /**
   * Creates error for missing required setting.
   * @param {string} settingName - Setting name
   * @param {string} templateName - Template name
   * @returns {SettingsError}
   */
  static missingRequired(settingName, templateName) {
    return new SettingsError(`Missing required setting: ${settingName}`, {
      template: templateName,
      code: 'SETTINGS_MISSING_REQUIRED',
    });
  }

  /**
   * Creates error for invalid setting value.
   * @param {string} settingName - Setting name
   * @param {any} value - Invalid value
   * @param {string} expectedType - Expected type
   * @returns {SettingsError}
   */
  static invalidValue(settingName, value, expectedType) {
    return new SettingsError(
      `Invalid value for setting "${settingName}": expected ${expectedType}, got ${typeof value}`,
      {
        code: 'SETTINGS_INVALID_VALUE',
      }
    );
  }
}

/**
 * Error thrown when file operations fail.
 */
class FileError extends GeneratorError {
  constructor(message, context = {}) {
    super(message, { ...context, code: context.code || 'FILE_ERROR' });
    this.name = 'FileError';
  }

  /**
   * Creates error for file not found.
   * @param {string} filePath - File path
   * @returns {FileError}
   */
  static notFound(filePath) {
    return new FileError(`File not found: ${filePath}`, {
      file: filePath,
      code: 'FILE_NOT_FOUND',
    });
  }

  /**
   * Creates error for write failure.
   * @param {string} filePath - File path
   * @param {Error} cause - Original error
   * @returns {FileError}
   */
  static writeFailed(filePath, cause) {
    return new FileError(`Failed to write file: ${filePath}`, {
      file: filePath,
      code: 'FILE_WRITE_FAILED',
      cause,
    });
  }
}

/**
 * Error thrown when plugin operations fail.
 */
class PluginError extends GeneratorError {
  constructor(message, context = {}) {
    super(message, { ...context, code: context.code || 'PLUGIN_ERROR' });
    this.name = 'PluginError';
    this.pluginName = context.pluginName || null;
  }

  toDetailedString() {
    const base = super.toDetailedString();
    if (this.pluginName) {
      return base + `\n  Plugin: ${this.pluginName}`;
    }
    return base;
  }
}

/**
 * Utility to format multiple errors into a summary.
 * @param {(string|Error)[]} errors - Array of errors
 * @returns {string}
 */
function formatErrorSummary(errors) {
  if (!errors || errors.length === 0) {
    return 'No errors';
  }

  const lines = [`${errors.length} error(s) occurred:\n`];

  errors.forEach((err, index) => {
    const prefix = `  ${index + 1}. `;
    if (err instanceof GeneratorError) {
      lines.push(prefix + err.toDetailedString().split('\n').join('\n     '));
    } else if (err instanceof Error) {
      lines.push(prefix + err.message);
    } else {
      lines.push(prefix + String(err));
    }
    lines.push('');
  });

  return lines.join('\n');
}

module.exports = {
  GeneratorError,
  TemplateLoadError,
  TemplateCompileError,
  TemplateGenerateError,
  SettingsError,
  FileError,
  PluginError,
  formatErrorSummary,
};
