const Helpers = require('./lib/Helpers');
const HandlebarsHelpers = require('./lib/HandlebarsHelpers');
const Template = require('./lib/Template');
const { TemplateLoader } = require('./lib/TemplateLoader');
const { TemplateResult } = require('./lib/TemplateResult');
const { TemplateSettings } = require('./lib/TemplateSettings');

const { FileHelper } = require('./lib/FileHelper');
const { FileInformation } = require('./lib/FileInformation');
const { RegexHelper } = require('./lib/RegexHelper');
const { Replacement } = require('./lib/Replacement');
const { Replacements } = require('./lib/Replacements');
const { TemplateBuilder } = require('./lib/TemplateBuilder');
const { PluginManager, pluginManager } = require('./lib/PluginManager');
const { ConfigLoader, DEFAULT_CONFIG, CONFIG_FILE_NAMES } = require('./lib/ConfigLoader');
const { GenerationStats } = require('./lib/GenerationStats');
const {
  GeneratorError,
  TemplateLoadError,
  TemplateCompileError,
  TemplateGenerateError,
  SettingsError,
  FileError,
  PluginError,
  formatErrorSummary,
} = require('./lib/GeneratorError');

module.exports = {
  HandlebarsHelpers,
  Helpers,
  Template,
  TemplateLoader,
  TemplateResult,
  TemplateSettings,
  FileHelper,
  FileInformation,
  RegexHelper,
  Replacement,
  Replacements,
  TemplateBuilder,
  PluginManager,
  pluginManager,
  // Configuration
  ConfigLoader,
  DEFAULT_CONFIG,
  CONFIG_FILE_NAMES,
  // Statistics
  GenerationStats,
  // Error classes
  GeneratorError,
  TemplateLoadError,
  TemplateCompileError,
  TemplateGenerateError,
  SettingsError,
  FileError,
  PluginError,
  formatErrorSummary,
};
