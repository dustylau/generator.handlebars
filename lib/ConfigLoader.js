const fs = require('fs');
const path = require('path');

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG = {
  templateDirectory: './templates',
  outputDirectory: './output',
  modelPath: null,
  extension: '.hbs',
  recurse: true,
  verbose: false,
  dryRun: false,
  continueOnError: false,
  watch: false,
  watchDebounce: 300,
  helpers: {},
  partials: {},
  plugins: [],
  environment: {},
};

/**
 * Configuration file names to search for (in order of priority).
 */
const CONFIG_FILE_NAMES = [
  '.generatorrc.json',
  '.generatorrc',
  'generator.config.json',
  'generator.config.js',
];

/**
 * Configuration loader and manager for generator.handlebars.
 * Supports .generatorrc.json configuration files with defaults.
 */
class ConfigLoader {
  /**
   * Creates a new ConfigLoader instance.
   * @param {string} [basePath=process.cwd()] - Base path to search for config files.
   */
  constructor(basePath = process.cwd()) {
    this._basePath = basePath;
    this._config = { ...DEFAULT_CONFIG };
    this._configPath = null;
    this._isLoaded = false;
  }

  /**
   * Gets the base path for config file search.
   * @returns {string}
   */
  get basePath() {
    return this._basePath;
  }

  /**
   * Gets the loaded configuration.
   * @returns {object}
   */
  get config() {
    return this._config;
  }

  /**
   * Gets the path to the loaded config file (if any).
   * @returns {string|null}
   */
  get configPath() {
    return this._configPath;
  }

  /**
   * Checks if a config file was loaded.
   * @returns {boolean}
   */
  get isLoaded() {
    return this._isLoaded;
  }

  /**
   * Finds a configuration file in the base path or parent directories.
   * @param {boolean} [searchParents=true] - Whether to search parent directories.
   * @returns {string|null} Path to found config file, or null if not found.
   */
  findConfigFile(searchParents = true) {
    let currentDir = this._basePath;

    while (currentDir) {
      for (const fileName of CONFIG_FILE_NAMES) {
        const configPath = path.join(currentDir, fileName);
        if (fs.existsSync(configPath)) {
          return configPath;
        }
      }

      if (!searchParents) {
        break;
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break; // Reached root
      }
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * Loads configuration from a file or uses defaults.
   * @param {string} [configPath] - Explicit path to config file. If not provided, searches for one.
   * @returns {object} The loaded configuration.
   */
  load(configPath = null) {
    this._configPath = configPath || this.findConfigFile();

    if (!this._configPath) {
      this._isLoaded = false;
      return this._config;
    }

    try {
      let fileConfig;

      if (this._configPath.endsWith('.js')) {
        // JavaScript config file
        fileConfig = require(path.resolve(this._configPath));
        if (typeof fileConfig === 'function') {
          fileConfig = fileConfig();
        }
      } else {
        // JSON config file
        const content = fs.readFileSync(this._configPath, 'utf8');
        fileConfig = JSON.parse(content);
      }

      // Merge with defaults
      this._config = this._mergeConfig(DEFAULT_CONFIG, fileConfig);
      this._isLoaded = true;
    } catch (error) {
      throw new Error(`Failed to load config from "${this._configPath}": ${error.message}`);
    }

    return this._config;
  }

  /**
   * Deep merges configuration objects.
   * @param {object} defaults - Default configuration.
   * @param {object} overrides - Override values.
   * @returns {object} Merged configuration.
   * @private
   */
  _mergeConfig(defaults, overrides) {
    const result = { ...defaults };

    for (const key of Object.keys(overrides)) {
      const value = overrides[key];

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this._mergeConfig(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Applies CLI options as overrides to the loaded config.
   * @param {object} cliOptions - CLI options to apply.
   * @returns {object} The merged configuration.
   */
  applyCliOptions(cliOptions) {
    const overrides = {};

    // Map CLI options to config properties
    if (cliOptions.templates) overrides.templateDirectory = cliOptions.templates;
    if (cliOptions.model) overrides.modelPath = cliOptions.model;
    if (cliOptions.output) overrides.outputDirectory = cliOptions.output;
    if (cliOptions.verbose !== undefined) overrides.verbose = cliOptions.verbose;
    if (cliOptions.dryRun !== undefined) overrides.dryRun = cliOptions.dryRun;
    if (cliOptions.watch !== undefined) overrides.watch = cliOptions.watch;

    this._config = this._mergeConfig(this._config, overrides);
    return this._config;
  }

  /**
   * Gets a configuration value by path (dot notation).
   * @param {string} keyPath - The configuration key path (e.g., 'helpers.myHelper').
   * @param {*} [defaultValue] - Default value if not found.
   * @returns {*} The configuration value.
   */
  get(keyPath, defaultValue = undefined) {
    const keys = keyPath.split('.');
    let value = this._config;

    for (const key of keys) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return defaultValue;
      }
      value = value[key];
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Sets a configuration value by path (dot notation).
   * @param {string} keyPath - The configuration key path.
   * @param {*} value - The value to set.
   */
  set(keyPath, value) {
    const keys = keyPath.split('.');
    let target = this._config;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (target[key] === undefined || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }

    target[keys[keys.length - 1]] = value;
  }

  /**
   * Resolves a path relative to the config file location.
   * @param {string} relativePath - The relative path to resolve.
   * @returns {string} The resolved absolute path.
   */
  resolvePath(relativePath) {
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }

    const basePath = this._configPath ? path.dirname(this._configPath) : this._basePath;

    return path.resolve(basePath, relativePath);
  }

  /**
   * Creates a default configuration file.
   * @param {string} [filePath] - Path to create the file. Defaults to .generatorrc.json in base path.
   * @param {object} [config] - Configuration to write. Defaults to DEFAULT_CONFIG.
   * @returns {string} Path to created file.
   */
  static createConfigFile(filePath, config = null) {
    const targetPath = filePath || path.join(process.cwd(), '.generatorrc.json');
    const configToWrite = config || {
      templateDirectory: './templates',
      outputDirectory: './output',
      modelPath: './model.json',
      extension: '.hbs',
      recurse: true,
      verbose: false,
      dryRun: false,
      continueOnError: false,
    };

    fs.writeFileSync(targetPath, JSON.stringify(configToWrite, null, 2), 'utf8');
    return targetPath;
  }

  /**
   * Gets the default configuration object.
   * @returns {object}
   */
  static getDefaults() {
    return { ...DEFAULT_CONFIG };
  }
}

module.exports = { ConfigLoader, DEFAULT_CONFIG, CONFIG_FILE_NAMES };
