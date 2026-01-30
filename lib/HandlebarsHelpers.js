/**
 * HandlebarsHelpers module - registers custom Handlebars helpers and partials.
 *
 * This module registers all custom helpers from Helpers.js with Handlebars.
 * Import this module once at application startup to enable all helpers in templates.
 *
 * @module HandlebarsHelpers
 */

const fs = require('fs');
const path = require('path');
const Helpers = require('./Helpers');
const Handlebars = require('handlebars');

// Conditional helpers
Handlebars.registerHelper('ifEquals', Helpers.ifEquals);
Handlebars.registerHelper('ifNotEquals', Helpers.ifNotEquals);
Handlebars.registerHelper('compare', Helpers.compare);

// String transformation helpers
Handlebars.registerHelper('camelCase', Helpers.camelCase);
Handlebars.registerHelper('upperCase', Helpers.upperCase);
Handlebars.registerHelper('lowerCase', Helpers.lowerCase);
Handlebars.registerHelper('replace', Helpers.replace);
Handlebars.registerHelper('concat', Helpers.concat);
Handlebars.registerHelper('pluralize', Helpers.pluralize);
Handlebars.registerHelper('singularize', Helpers.singularize);
Handlebars.registerHelper('kebabCase', Helpers.kebabCase);
Handlebars.registerHelper('snakeCase', Helpers.snakeCase);
Handlebars.registerHelper('pascalCase', Helpers.pascalCase);
Handlebars.registerHelper('capitalize', Helpers.capitalize);
Handlebars.registerHelper('truncate', Helpers.truncate);
Handlebars.registerHelper('pad', Helpers.pad);
Handlebars.registerHelper('trim', Helpers.trim);
Handlebars.registerHelper('repeat', Helpers.repeat);
Handlebars.registerHelper('startsWith', Helpers.startsWith);
Handlebars.registerHelper('endsWith', Helpers.endsWith);

// Type helpers
Handlebars.registerHelper('getType', Helpers.getType);
Handlebars.registerHelper('isSystemType', Helpers.isSystemType);
Handlebars.registerHelper('hasSystemType', Helpers.hasSystemType);
Handlebars.registerHelper('getSqlType', Helpers.getSqlType);
Handlebars.registerHelper('getSystemType', Helpers.getSystemType);
Handlebars.registerHelper('isNumber', Helpers.isNumber);
Handlebars.registerHelper('isEmpty', Helpers.isEmpty);

// Collection helpers
Handlebars.registerHelper('findIn', Helpers.findIn);
Handlebars.registerHelper('existsIn', Helpers.existsIn);
Handlebars.registerHelper('any', Helpers.any);
Handlebars.registerHelper('first', Helpers.first);
Handlebars.registerHelper('last', Helpers.last);
Handlebars.registerHelper('orderBy', Helpers.orderBy);
Handlebars.registerHelper('where', Helpers.where);
Handlebars.registerHelper('contains', Helpers.contains);
Handlebars.registerHelper('join', Helpers.join);
Handlebars.registerHelper('split', Helpers.split);
Handlebars.registerHelper('unique', Helpers.unique);
Handlebars.registerHelper('groupBy', Helpers.groupBy);
Handlebars.registerHelper('count', Helpers.count);
Handlebars.registerHelper('length', Helpers.length);
Handlebars.registerHelper('slice', Helpers.slice);
Handlebars.registerHelper('reverse', Helpers.reverse);

// Date helpers
Handlebars.registerHelper('formatDate', Helpers.formatDate);
Handlebars.registerHelper('now', Helpers.now);

// Utility helpers
Handlebars.registerHelper('write', (value) => value);
Handlebars.registerHelper('default', Helpers.defaultValue);
Handlebars.registerHelper('coalesce', Helpers.coalesce);
Handlebars.registerHelper('math', Helpers.math);
Handlebars.registerHelper('toJson', Helpers.toJson);
Handlebars.registerHelper('env', Helpers.env);
Handlebars.registerHelper('debug', Helpers.debug);

/**
 * The HandlebarsHelpers object provides access to helper and partial registration.
 */
const HandlebarsHelpers = {
  /**
   * Registers a custom helper with Handlebars.
   * @param {string} name - The helper name.
   * @param {Function} fn - The helper function.
   */
  registerHelper(name, fn) {
    Handlebars.registerHelper(name, fn);
  },

  /**
   * Registers a partial template with Handlebars.
   * @param {string} name - The partial name (used as {{> name}}).
   * @param {string} template - The partial template content.
   */
  registerPartial(name, template) {
    Handlebars.registerPartial(name, template);
  },

  /**
   * Registers a partial from a file.
   * @param {string} name - The partial name (used as {{> name}}).
   * @param {string} filePath - Path to the partial file.
   */
  registerPartialFromFile(name, filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    Handlebars.registerPartial(name, content);
  },

  /**
   * Loads and registers all partials from a directory.
   * Partials should have .hbs.partial extension.
   * The partial name is derived from the filename (without extension).
   * @param {string} directory - Path to the partials directory.
   * @returns {string[]} Array of registered partial names.
   */
  loadPartialsFromDirectory(directory) {
    const registered = [];

    if (!fs.existsSync(directory)) {
      return registered;
    }

    const files = fs.readdirSync(directory);
    for (const file of files) {
      if (file.endsWith('.hbs.partial') || file.endsWith('.partial.hbs')) {
        const filePath = path.join(directory, file);
        const name = file.replace('.hbs.partial', '').replace('.partial.hbs', '');
        const content = fs.readFileSync(filePath, 'utf8');
        Handlebars.registerPartial(name, content);
        registered.push(name);
      }
    }

    return registered;
  },

  /**
   * Unregisters a partial.
   * @param {string} name - The partial name to unregister.
   */
  unregisterPartial(name) {
    Handlebars.unregisterPartial(name);
  },

  /**
   * Gets all registered partials.
   * @returns {object} Object containing all registered partials.
   */
  getPartials() {
    return Handlebars.partials;
  },

  /**
   * Gets the Handlebars instance with registered helpers.
   * @returns {Handlebars} The Handlebars instance.
   */
  getHandlebars() {
    return Handlebars;
  },

  /**
   * Reference to the Helpers module.
   */
  Helpers,
};

module.exports = HandlebarsHelpers;
