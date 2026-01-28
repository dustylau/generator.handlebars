/**
 * PluginManager module - manages plugins for extending generator functionality.
 *
 * Plugins can register custom Handlebars helpers, partials, and lifecycle hooks.
 *
 * @module PluginManager
 */

const HandlebarsHelpers = require('./HandlebarsHelpers');

/**
 * @typedef {Object} Plugin
 * @property {string} name - Plugin name for identification
 * @property {string} [version] - Plugin version
 * @property {Object.<string, Function>} [helpers] - Custom Handlebars helpers
 * @property {Object.<string, string>} [partials] - Custom partials (name → template)
 * @property {Function} [onBeforeGenerate] - Hook called before generation
 * @property {Function} [onAfterGenerate] - Hook called after generation
 * @property {Function} [onBeforeWrite] - Hook called before writing files
 * @property {Function} [onAfterWrite] - Hook called after writing files
 * @property {Function} [transformModel] - Transform model before template processing
 * @property {Function} [transformResult] - Transform result before writing
 */

/**
 * Manages plugins for the generator system.
 */
class PluginManager {
  constructor() {
    this._plugins = new Map();
    this._hooks = {
      onBeforeGenerate: [],
      onAfterGenerate: [],
      onBeforeWrite: [],
      onAfterWrite: [],
      transformModel: [],
      transformResult: [],
    };
  }

  /**
   * Gets all registered plugin names.
   * @returns {string[]}
   */
  get plugins() {
    return Array.from(this._plugins.keys());
  }

  /**
   * Gets the count of registered plugins.
   * @returns {number}
   */
  get count() {
    return this._plugins.size;
  }

  /**
   * Registers a plugin.
   * @param {Plugin} plugin - The plugin to register.
   * @throws {Error} If plugin name is missing or already registered.
   */
  register(plugin) {
    if (!plugin || !plugin.name) {
      throw new Error('Plugin must have a name property');
    }

    if (this._plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Register helpers
    if (plugin.helpers) {
      for (const [name, fn] of Object.entries(plugin.helpers)) {
        if (typeof fn === 'function') {
          HandlebarsHelpers.registerHelper(name, fn);
        }
      }
    }

    // Register partials
    if (plugin.partials) {
      for (const [name, template] of Object.entries(plugin.partials)) {
        if (typeof template === 'string') {
          HandlebarsHelpers.registerPartial(name, template);
        }
      }
    }

    // Register hooks
    for (const hookName of Object.keys(this._hooks)) {
      if (typeof plugin[hookName] === 'function') {
        this._hooks[hookName].push({
          pluginName: plugin.name,
          handler: plugin[hookName],
        });
      }
    }

    this._plugins.set(plugin.name, plugin);
  }

  /**
   * Unregisters a plugin by name.
   * @param {string} name - The plugin name.
   * @returns {boolean} True if plugin was removed.
   */
  unregister(name) {
    const plugin = this._plugins.get(name);
    if (!plugin) {
      return false;
    }

    // Remove hooks
    for (const hookName of Object.keys(this._hooks)) {
      this._hooks[hookName] = this._hooks[hookName].filter((h) => h.pluginName !== name);
    }

    // Note: We cannot easily unregister helpers from Handlebars
    // as there's no official API for it

    this._plugins.delete(name);
    return true;
  }

  /**
   * Checks if a plugin is registered.
   * @param {string} name - The plugin name.
   * @returns {boolean}
   */
  has(name) {
    return this._plugins.has(name);
  }

  /**
   * Gets a plugin by name.
   * @param {string} name - The plugin name.
   * @returns {Plugin|undefined}
   */
  get(name) {
    return this._plugins.get(name);
  }

  /**
   * Executes all registered hooks of a given type.
   * @param {string} hookName - The hook name.
   * @param {...any} args - Arguments to pass to hooks.
   * @returns {Promise<void>}
   */
  async executeHooks(hookName, ...args) {
    const hooks = this._hooks[hookName] || [];
    for (const { handler } of hooks) {
      await handler(...args);
    }
  }

  /**
   * Executes all registered hooks of a given type synchronously.
   * @param {string} hookName - The hook name.
   * @param {...any} args - Arguments to pass to hooks.
   */
  executeHooksSync(hookName, ...args) {
    const hooks = this._hooks[hookName] || [];
    for (const { handler } of hooks) {
      handler(...args);
    }
  }

  /**
   * Transforms data through all registered transform hooks.
   * @param {string} hookName - The hook name (transformModel or transformResult).
   * @param {any} data - The data to transform.
   * @returns {any} The transformed data.
   */
  transform(hookName, data) {
    const hooks = this._hooks[hookName] || [];
    let result = data;
    for (const { handler } of hooks) {
      result = handler(result);
    }
    return result;
  }

  /**
   * Clears all registered plugins.
   */
  clear() {
    for (const hookName of Object.keys(this._hooks)) {
      this._hooks[hookName] = [];
    }
    this._plugins.clear();
  }

  /**
   * Creates a plugin from a simple helper object.
   * Convenience method for registering helpers without full plugin structure.
   * @param {string} name - Plugin name.
   * @param {Object.<string, Function>} helpers - Helper functions.
   * @returns {Plugin} The created plugin.
   */
  static createHelperPlugin(name, helpers) {
    return {
      name,
      helpers,
    };
  }

  /**
   * Creates a plugin from partial templates.
   * @param {string} name - Plugin name.
   * @param {Object.<string, string>} partials - Partial templates.
   * @returns {Plugin} The created plugin.
   */
  static createPartialPlugin(name, partials) {
    return {
      name,
      partials,
    };
  }
}

// Export a singleton instance
const pluginManager = new PluginManager();

module.exports = {
  PluginManager,
  pluginManager,
};
