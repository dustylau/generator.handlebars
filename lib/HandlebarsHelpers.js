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

// String transformation helpers
Handlebars.registerHelper('camelCase', Helpers.camelCase);
Handlebars.registerHelper('upperCase', Helpers.upperCase);
Handlebars.registerHelper('lowerCase', Helpers.lowerCase);
Handlebars.registerHelper('replace', Helpers.replace);
Handlebars.registerHelper('concat', Helpers.concat);

// Type helpers
Handlebars.registerHelper('getType', Helpers.getType);
Handlebars.registerHelper('isSystemType', Helpers.isSystemType);
Handlebars.registerHelper('hasSystemType', Helpers.hasSystemType);
Handlebars.registerHelper('getSqlType', Helpers.getSqlType);
Handlebars.registerHelper('getSystemType', Helpers.getSystemType);
Handlebars.registerHelper('isNumber', Helpers.isNumber);

// Collection helpers
Handlebars.registerHelper('findIn', Helpers.findIn);
Handlebars.registerHelper('existsIn', Helpers.existsIn);
Handlebars.registerHelper('any', Helpers.any);
Handlebars.registerHelper('first', Helpers.first);
Handlebars.registerHelper('orderBy', Helpers.orderBy);
Handlebars.registerHelper('where', Helpers.where);
Handlebars.registerHelper('contains', Helpers.contains);

// Utility helpers
Handlebars.registerHelper('write', (value) => value);

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
