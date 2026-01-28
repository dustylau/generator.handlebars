/**
 * HandlebarsHelpers module - registers custom Handlebars helpers.
 *
 * This module registers all custom helpers from Helpers.js with Handlebars.
 * Import this module once at application startup to enable all helpers in templates.
 *
 * @module HandlebarsHelpers
 */

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
 * The HandlebarsHelpers object provides access to helper registration.
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
