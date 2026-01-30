/**
 * Converts a string to camelCase.
 * @param {string} value - The string to convert.
 * @returns {string} The camelCase string.
 */
const camelCase = function (value) {
  if (!value || typeof value !== 'string' || isEmpty(value)) {
    return '';
  }

  let result = '';
  let camelCaseComplete = false;

  for (let index = 0; index < value.length; index++) {
    const character = value[index];

    if (camelCaseComplete) {
      result += character;
      continue;
    }

    const isLastCharacter = index === value.length - 1;

    if (isLastCharacter) {
      result += character.toLowerCase();
      continue;
    }

    if (isLowerCase(character)) {
      result += character;
      camelCaseComplete = true;
      continue;
    }

    const firstCharacter = index === 0;
    const nextCharacter = value[index + 1];
    const nextCharacterIsLower = isLowerCase(nextCharacter);

    if (firstCharacter && nextCharacterIsLower) {
      result += character.toLowerCase();
      camelCaseComplete = true;
      continue;
    }

    if (!nextCharacterIsLower) {
      result += character.toLowerCase();
      continue;
    }

    result += character;
    camelCaseComplete = true;
  }

  return result;
};

/**
 * Checks if a character is lowercase.
 * @param {string} value - The character to check.
 * @returns {boolean} True if lowercase.
 */
const isLowerCase = function (value) {
  return value === value.toLowerCase() && value !== value.toUpperCase();
};

/**
 * Converts a string to lowercase.
 * @param {string} value - The string to convert.
 * @returns {string} The lowercase string.
 */
const lowerCase = function (value) {
  if (typeof value !== 'string') return '';
  return value.toLowerCase();
};

/**
 * Converts a string to uppercase.
 * @param {string} value - The string to convert.
 * @returns {string} The uppercase string.
 */
const upperCase = function (value) {
  if (typeof value !== 'string') return '';
  return value.toUpperCase();
};

/**
 * Handlebars block helper for equality check.
 * @param {*} a - First value.
 * @param {*} b - Second value.
 * @param {object} options - Handlebars options.
 * @returns {string} Block content if equal, inverse otherwise.
 */
const ifEquals = function (a, b, options) {
  if (a == b) {
    return options.fn(this);
  }
  return options.inverse(this);
};

/**
 * Handlebars block helper for inequality check.
 * @param {*} a - First value.
 * @param {*} b - Second value.
 * @param {object} options - Handlebars options.
 * @returns {string} Block content if not equal, inverse otherwise.
 */
const ifNotEquals = function (a, b, options) {
  if (a != b) {
    return options.fn(this);
  }
  return options.inverse(this);
};

/**
 * Gets the type string for a property, handling enums and nullables.
 * @param {object} value - The property descriptor object.
 * @returns {string} The type string.
 */
const getType = function (value) {
  if (!value || typeof value !== 'object') {
    return '';
  }

  const type = value.IsEnum ? value.Enum : value.Type;

  if (!value.IsNullable) {
    return type || '';
  }

  const nullable = nullableTypes[type];

  if (!nullable) {
    return type || '';
  }

  if (!nullable.isNullable) {
    return type + '?';
  }

  return type || '';
};

/**
 * Checks if a value exists in a collection by property.
 * @param {Array} collection - The collection to search.
 * @param {string} property - The property name to match.
 * @param {*} value - The value to find.
 * @returns {boolean} True if found.
 */
const existsIn = function (collection, property, value) {
  if (!collection || !Array.isArray(collection)) {
    return false;
  }
  const result = collection.find((item) => item[property] == value);
  return result ? true : false;
};

/**
 * Finds an item in a collection by property value.
 * @param {Array} collection - The collection to search.
 * @param {string} property - The property name to match.
 * @param {*} value - The value to find.
 * @returns {object|undefined} The found item or undefined.
 */
const findIn = function (collection, property, value) {
  if (!collection || !Array.isArray(collection)) {
    return undefined;
  }
  return collection.find((item) => item[property] == value);
};

/**
 * Returns the first item matching a filter expression.
 * @param {Array} collection - The collection to filter.
 * @param {string} filter - The filter expression (e.g., "prop eq value").
 * @returns {object|null} The first matching item or null.
 */
const first = function (collection, filter) {
  if (!collection || !Array.isArray(collection)) {
    return null;
  }
  const result = where(collection, filter);
  return result.length > 0 ? result[0] : null;
};

/**
 * Checks if any items match a filter expression.
 * @param {Array} collection - The collection to filter.
 * @param {string} filter - The filter expression.
 * @returns {boolean} True if any items match.
 */
const any = function (collection, filter) {
  if (!collection || !Array.isArray(collection)) {
    return false;
  }
  const result = where(collection, filter);
  return result.length > 0;
};

/**
 * Orders a collection by one or more properties.
 * @param {Array} collection - The collection to sort.
 * @param {string} orderByValue - Property names separated by semicolons.
 * @returns {Array} A new sorted array.
 */
const orderBy = function (collection, orderByValue) {
  if (!collection || !Array.isArray(collection)) {
    return collection;
  }

  if (!orderByValue || typeof orderByValue !== 'string') {
    return collection.slice();
  }

  const orderByValues = orderByValue.split(';');

  const sortFunction = (a, b) => {
    for (const prop of orderByValues) {
      if (a[prop] > b[prop]) {
        return 1;
      } else if (a[prop] < b[prop]) {
        return -1;
      }
    }
    return 0;
  };

  return collection.slice().sort(sortFunction);
};

/**
 * Filters a collection using a filter expression.
 * Filter syntax: "property operator value" separated by semicolons.
 * Operators: eq (equals), ne (not equals).
 * Example: "IsActive eq true;Type ne System"
 * @param {Array} collection - The collection to filter.
 * @param {string} filter - The filter expression string.
 * @returns {Array} Filtered items.
 */
const where = function (collection, filter) {
  if (!collection || !Array.isArray(collection)) {
    return [];
  }

  if (!filter || typeof filter !== 'string') {
    return collection.slice();
  }

  const filters = [];
  const expressions = filter.split(';');

  for (const expression of expressions) {
    const expressionElements = expression.trim().split(' ');

    if (expressionElements.length < 3) {
      console.warn(
        `Invalid filter expression: "${expression}". Expected format: "property operator value"`
      );
      continue;
    }

    const [property, comparison, ...valueParts] = expressionElements;
    const rawValue = valueParts.join(' ');
    const value = rawValue === 'true' ? true : rawValue === 'false' ? false : rawValue;

    filters.push({ property, comparison, value });
  }

  const testFunctions = {
    eq: (item, f) => item[f.property] == f.value,
    ne: (item, f) => item[f.property] != f.value,
  };

  return collection.filter((item) => {
    return filters.every((f) => {
      const testFn = testFunctions[f.comparison] || testFunctions['eq'];
      return testFn(item, f);
    });
  });
};

/**
 * Default type formatter for SQL types.
 * @param {object} property - The property descriptor.
 * @param {string} leftDelimiter - Left bracket.
 * @param {string} rightDelimiter - Right bracket.
 * @returns {string} Formatted type string.
 */
const defaultFormatter = function (property, leftDelimiter, rightDelimiter) {
  return `${leftDelimiter}${this.type}${rightDelimiter}`;
};

/** Type mappings from C# types to SQL Server types */
const mappedTypes = {
  Guid: { type: 'uniqueidentifier', formatter: defaultFormatter },
  DateTime: { type: 'datetime', formatter: defaultFormatter },
  bool: { type: 'bit', formatter: defaultFormatter },
  int: { type: 'int', formatter: defaultFormatter },
  long: { type: 'bigint', formatter: defaultFormatter },
  short: { type: 'tinyint', formatter: defaultFormatter },
  string: {
    type: 'nvarchar',
    formatter: function (property, leftDelimiter, rightDelimiter) {
      const length = property && property.Length > 0 ? property.Length : 50;
      return `${leftDelimiter}${this.type}${rightDelimiter}(${length})`;
    },
  },
  double: { type: 'float', formatter: defaultFormatter },
  float: { type: 'float', formatter: defaultFormatter },
  decimal: {
    type: 'decimal',
    formatter: function (property, leftDelimiter, rightDelimiter) {
      const precision = property && property.Precision > 0 ? property.Precision : 18;
      const scale = property && property.Scale > 0 ? property.Scale : 5;
      return `${leftDelimiter}${this.type}${rightDelimiter}(${precision}, ${scale})`;
    },
  },
};

/** Type mappings from C# types to .NET System types */
const mappedSystemTypes = {
  Guid: { type: 'Guid', formatter: defaultFormatter },
  DateTime: { type: 'DateTime', formatter: defaultFormatter },
  bool: { type: 'Boolean', formatter: defaultFormatter },
  int: { type: 'Int32', formatter: defaultFormatter },
  long: { type: 'Int64', formatter: defaultFormatter },
  short: { type: 'Int16', formatter: defaultFormatter },
  string: { type: 'String', formatter: defaultFormatter },
  double: { type: 'Double', formatter: defaultFormatter },
  float: { type: 'Float', formatter: defaultFormatter },
  decimal: { type: 'Decimal', formatter: defaultFormatter },
};

/** Nullable type definitions */
const nullableTypes = {
  Guid: { isNullable: false },
  DateTime: { isNullable: false },
  bool: { isNullable: false },
  int: { isNullable: false },
  long: { isNullable: false },
  short: { isNullable: true },
  string: { isNullable: false },
  double: { isNullable: false },
  float: { isNullable: false },
  decimal: { isNullable: false },
};

/**
 * Checks if a property value has a system type mapping.
 * @param {object} value - The property descriptor.
 * @returns {boolean} True if has system type.
 */
const hasSystemType = function (value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const type = value.IsEnum ? 'int' : value.BaseType || value.Type;
  return isSystemType(type);
};

/**
 * Checks if a type name is a known system type.
 * @param {string} value - The type name.
 * @returns {boolean} True if known system type.
 */
const isSystemType = function (value) {
  const type = mappedSystemTypes[value];
  return type !== undefined && type !== null;
};

/**
 * Gets the SQL Server type for a property.
 * @param {object} value - The property descriptor with Type, IsEnum, BaseType.
 * @returns {string} The formatted SQL type.
 */
const getSqlType = function (value) {
  if (!value || typeof value !== 'object') {
    return '[unknown]';
  }
  const type = value.IsEnum ? 'int' : value.BaseType || value.Type;
  const mappedType = mappedTypes[type];

  if (!mappedType) {
    return defaultFormatter.call({ type: type || 'unknown' }, value, '[', ']');
  }

  return mappedType.formatter(value, '[', ']');
};

/**
 * Gets the .NET System type for a property.
 * @param {object} value - The property descriptor.
 * @returns {string} The System type name.
 */
const getSystemType = function (value) {
  if (!value || typeof value !== 'object') {
    return 'Object';
  }
  const type = value.IsEnum ? 'int' : value.BaseType || value.Type;
  const mappedType = mappedSystemTypes[type];
  return mappedType ? mappedType.type : 'Object';
};

/**
 * Checks if a value is numeric.
 * @param {*} value - The value to check.
 * @returns {boolean} True if numeric.
 */
const isNumber = function (value) {
  return !isNaN(value) && value !== null;
};

/**
 * Checks if a value is empty (null, undefined, or zero-length).
 * @param {*} value - The value to check.
 * @returns {boolean} True if empty.
 */
const isEmpty = function (value) {
  return !value || value.length === 0;
};

/**
 * Checks if an array contains a value.
 * @param {Array} array - The array to search.
 * @param {*} value - The value to find.
 * @returns {boolean} True if found.
 */
const contains = function (array, value) {
  if (!array || !Array.isArray(array)) {
    return false;
  }
  return array.includes(value);
};

/**
 * Replaces occurrences of a string.
 * @param {string} value - The source string.
 * @param {string} find - The string to find.
 * @param {string} replaceWith - The replacement string.
 * @returns {string} The result string.
 */
const replace = function (value, find, replaceWith) {
  if (typeof value !== 'string') return '';
  return value.replace(find, replaceWith);
};

/**
 * Concatenates two values.
 * @param {*} valueA - First value.
 * @param {*} valueB - Second value.
 * @returns {string} Concatenated result.
 */
const concat = function (valueA, valueB) {
  return String(valueA) + String(valueB);
};

// ============================================================
// New Helpers (Phase 5A)
// ============================================================

/**
 * Simple pluralization rules for common English words.
 * @type {Array<{match: RegExp, replacement: string}>}
 */
const pluralRules = [
  { match: /s$/i, replacement: 'ses' },
  { match: /x$/i, replacement: 'xes' },
  { match: /z$/i, replacement: 'zzes' },
  { match: /(sh|ch)$/i, replacement: '$1es' },
  { match: /([^aeiou])y$/i, replacement: '$1ies' },
  { match: /f$/i, replacement: 'ves' },
  { match: /fe$/i, replacement: 'ves' },
  { match: /([^aeiou])o$/i, replacement: '$1oes' },
  { match: /is$/i, replacement: 'es' },
  { match: /us$/i, replacement: 'i' },
  { match: /on$/i, replacement: 'a' },
];

/**
 * Irregular plural forms.
 * @type {Object<string, string>}
 */
const irregularPlurals = {
  child: 'children',
  person: 'people',
  man: 'men',
  woman: 'women',
  tooth: 'teeth',
  foot: 'feet',
  mouse: 'mice',
  goose: 'geese',
  ox: 'oxen',
  sheep: 'sheep',
  deer: 'deer',
  fish: 'fish',
  series: 'series',
  species: 'species',
  datum: 'data',
  criterion: 'criteria',
  analysis: 'analyses',
  basis: 'bases',
  thesis: 'theses',
  index: 'indices',
};

/**
 * Converts a singular word to its plural form.
 * @param {string} value - The word to pluralize.
 * @param {number} [count] - Optional count to determine if plural is needed.
 * @returns {string} The pluralized word.
 */
const pluralize = function (value, count) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // If count is provided and is 1, return singular
  if (count !== undefined && count === 1) {
    return value;
  }

  const lowerValue = value.toLowerCase();

  // Check for irregular plurals
  if (irregularPlurals[lowerValue]) {
    // Preserve original case
    if (value[0] === value[0].toUpperCase()) {
      return (
        irregularPlurals[lowerValue].charAt(0).toUpperCase() + irregularPlurals[lowerValue].slice(1)
      );
    }
    return irregularPlurals[lowerValue];
  }

  // Apply rules
  for (const rule of pluralRules) {
    if (rule.match.test(value)) {
      return value.replace(rule.match, rule.replacement);
    }
  }

  // Default: add 's'
  return value + 's';
};

/**
 * Reverse mapping for singularization.
 */
const irregularSingulars = Object.fromEntries(
  Object.entries(irregularPlurals).map(([k, v]) => [v, k])
);

/**
 * Converts a plural word to its singular form.
 * @param {string} value - The word to singularize.
 * @returns {string} The singular word.
 */
const singularize = function (value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const lowerValue = value.toLowerCase();

  // Check for irregular singulars
  if (irregularSingulars[lowerValue]) {
    if (value[0] === value[0].toUpperCase()) {
      return (
        irregularSingulars[lowerValue].charAt(0).toUpperCase() +
        irregularSingulars[lowerValue].slice(1)
      );
    }
    return irregularSingulars[lowerValue];
  }

  // Simple rules for common patterns
  if (lowerValue.endsWith('ies') && value.length > 3) {
    return value.slice(0, -3) + 'y';
  }
  if (lowerValue.endsWith('ves')) {
    return value.slice(0, -3) + 'f';
  }
  if (lowerValue.endsWith('ses') || lowerValue.endsWith('xes') || lowerValue.endsWith('zes')) {
    return value.slice(0, -2);
  }
  if (lowerValue.endsWith('ches') || lowerValue.endsWith('shes')) {
    return value.slice(0, -2);
  }
  if (lowerValue.endsWith('s') && !lowerValue.endsWith('ss')) {
    return value.slice(0, -1);
  }

  return value;
};

/**
 * Joins array elements with a separator.
 * @param {Array} array - The array to join.
 * @param {string} [separator=', '] - The separator string.
 * @returns {string} The joined string.
 */
const join = function (array, separator = ', ') {
  if (!array || !Array.isArray(array)) {
    return '';
  }
  return array.join(separator);
};

/**
 * Splits a string into an array.
 * @param {string} value - The string to split.
 * @param {string} [separator=','] - The separator string.
 * @returns {Array} The resulting array.
 */
const split = function (value, separator = ',') {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value.split(separator).map((s) => s.trim());
};

/**
 * Returns the value if truthy, otherwise returns the default value.
 * @param {*} value - The value to check.
 * @param {*} defaultValue - The default value to return.
 * @returns {*} The value or default.
 */
const defaultValue = function (value, defaultVal) {
  if (value === undefined || value === null || value === '') {
    return defaultVal;
  }
  return value;
};

/**
 * Truncates a string to a maximum length.
 * @param {string} value - The string to truncate.
 * @param {number} length - Maximum length.
 * @param {string} [suffix='...'] - Suffix to append if truncated.
 * @returns {string} The truncated string.
 */
const truncate = function (value, length, suffix = '...') {
  if (!value || typeof value !== 'string') {
    return '';
  }
  if (value.length <= length) {
    return value;
  }
  return value.substring(0, length - suffix.length) + suffix;
};

/**
 * Pads a string to a minimum length.
 * @param {string} value - The string to pad.
 * @param {number} length - Target length.
 * @param {string} [char=' '] - Padding character.
 * @param {string} [direction='right'] - 'left', 'right', or 'both'.
 * @returns {string} The padded string.
 */
const pad = function (value, length, char = ' ', direction = 'right') {
  if (value === undefined || value === null) {
    value = '';
  }
  const str = String(value);
  if (str.length >= length) {
    return str;
  }

  const padLength = length - str.length;
  const padChar = char[0] || ' ';

  if (direction === 'left') {
    return padChar.repeat(padLength) + str;
  }
  if (direction === 'both') {
    const leftPad = Math.floor(padLength / 2);
    const rightPad = padLength - leftPad;
    return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
  }
  // right (default)
  return str + padChar.repeat(padLength);
};

/**
 * Converts a string to kebab-case.
 * @param {string} value - The string to convert.
 * @returns {string} The kebab-case string.
 */
const kebabCase = function (value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Converts a string to snake_case.
 * @param {string} value - The string to convert.
 * @returns {string} The snake_case string.
 */
const snakeCase = function (value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * Converts a string to PascalCase.
 * @param {string} value - The string to convert.
 * @returns {string} The PascalCase string.
 */
const pascalCase = function (value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} value - The string to capitalize.
 * @returns {string} The capitalized string.
 */
const capitalize = function (value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Formats a date value.
 * @param {Date|string|number} value - The date to format.
 * @param {string} [format='ISO'] - Format string: 'ISO', 'date', 'time', 'datetime', or custom.
 * @returns {string} The formatted date string.
 */
const formatDate = function (value, format = 'ISO') {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    return '';
  }

  const pad2 = (n) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());

  switch (format) {
    case 'ISO':
      return date.toISOString();
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      // Custom format: YYYY, MM, DD, HH, mm, ss
      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
  }
};

/**
 * Gets the current timestamp.
 * @param {string} [format='ISO'] - Format string.
 * @returns {string} The formatted current date/time.
 */
const now = function (format = 'ISO') {
  return formatDate(new Date(), format);
};

/**
 * Repeats a string n times.
 * @param {string} value - The string to repeat.
 * @param {number} count - Number of repetitions.
 * @returns {string} The repeated string.
 */
const repeat = function (value, count) {
  if (!value || typeof value !== 'string' || count < 1) {
    return '';
  }
  return value.repeat(Math.floor(count));
};

/**
 * Checks if a string starts with a prefix.
 * @param {string} value - The string to check.
 * @param {string} prefix - The prefix to look for.
 * @returns {boolean} True if starts with prefix.
 */
const startsWith = function (value, prefix) {
  if (typeof value !== 'string' || typeof prefix !== 'string') {
    return false;
  }
  return value.startsWith(prefix);
};

/**
 * Checks if a string ends with a suffix.
 * @param {string} value - The string to check.
 * @param {string} suffix - The suffix to look for.
 * @returns {boolean} True if ends with suffix.
 */
const endsWith = function (value, suffix) {
  if (typeof value !== 'string' || typeof suffix !== 'string') {
    return false;
  }
  return value.endsWith(suffix);
};

/**
 * Trims whitespace from a string.
 * @param {string} value - The string to trim.
 * @returns {string} The trimmed string.
 */
const trim = function (value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

/**
 * Gets the length of a string or array.
 * @param {string|Array} value - The value to measure.
 * @returns {number} The length.
 */
const length = function (value) {
  if (!value) {
    return 0;
  }
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length;
  }
  return 0;
};

/**
 * Gets a slice of a string or array.
 * @param {string|Array} value - The value to slice.
 * @param {number} start - Start index.
 * @param {number} [end] - End index (exclusive).
 * @returns {string|Array} The sliced value.
 */
const slice = function (value, start, end) {
  if (!value || (!Array.isArray(value) && typeof value !== 'string')) {
    return typeof value === 'string' ? '' : [];
  }
  return value.slice(start, end);
};

/**
 * Reverses a string or array.
 * @param {string|Array} value - The value to reverse.
 * @returns {string|Array} The reversed value.
 */
const reverse = function (value) {
  if (!value) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice().reverse();
  }
  if (typeof value === 'string') {
    return value.split('').reverse().join('');
  }
  return value;
};

/**
 * Gets unique values from an array.
 * @param {Array} array - The array to deduplicate.
 * @param {string} [property] - Optional property to compare by.
 * @returns {Array} Array with unique values.
 */
const unique = function (array, property) {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  if (property) {
    const seen = new Set();
    return array.filter((item) => {
      const val = item[property];
      if (seen.has(val)) {
        return false;
      }
      seen.add(val);
      return true;
    });
  }
  return [...new Set(array)];
};

/**
 * Groups array items by a property value.
 * @param {Array} array - The array to group.
 * @param {string} property - The property to group by.
 * @returns {object} Object with groups.
 */
const groupBy = function (array, property) {
  if (!array || !Array.isArray(array) || !property) {
    return {};
  }
  return array.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Gets the last item from an array.
 * @param {Array} array - The array.
 * @returns {*} The last item.
 */
const last = function (array) {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return null;
  }
  return array[array.length - 1];
};

/**
 * Counts items in an array, optionally matching a filter.
 * @param {Array} array - The array to count.
 * @param {string} [filter] - Optional filter expression.
 * @returns {number} The count.
 */
const count = function (array, filter) {
  if (!array || !Array.isArray(array)) {
    return 0;
  }
  if (filter) {
    return where(array, filter).length;
  }
  return array.length;
};

/**
 * Mathematical operations helper.
 * @param {number} a - First number.
 * @param {string} op - Operation: add, sub, mul, div, mod.
 * @param {number} b - Second number.
 * @returns {number} The result.
 */
const math = function (a, op, b) {
  const numA = Number(a);
  const numB = Number(b);

  switch (op) {
    case 'add':
    case '+':
      return numA + numB;
    case 'sub':
    case '-':
      return numA - numB;
    case 'mul':
    case '*':
      return numA * numB;
    case 'div':
    case '/':
      return numB !== 0 ? numA / numB : 0;
    case 'mod':
    case '%':
      return numB !== 0 ? numA % numB : 0;
    default:
      return numA;
  }
};

/**
 * Converts a value to JSON string.
 * @param {*} value - The value to stringify.
 * @param {number} [indent=2] - Indentation spaces.
 * @returns {string} The JSON string.
 */
const toJson = function (value, indent = 2) {
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return '';
  }
};

/**
 * Compares two values for conditional templates.
 * @param {*} a - First value.
 * @param {string} operator - Comparison operator.
 * @param {*} b - Second value.
 * @param {object} options - Handlebars options.
 * @returns {string} Block result.
 */
const compare = function (a, operator, b, options) {
  let result;

  switch (operator) {
    case '==':
    case 'eq':
      result = a == b;
      break;
    case '===':
    case 'seq':
      result = a === b;
      break;
    case '!=':
    case 'ne':
      result = a != b;
      break;
    case '!==':
    case 'sne':
      result = a !== b;
      break;
    case '<':
    case 'lt':
      result = a < b;
      break;
    case '<=':
    case 'le':
    case 'lte':
      result = a <= b;
      break;
    case '>':
    case 'gt':
      result = a > b;
      break;
    case '>=':
    case 'ge':
    case 'gte':
      result = a >= b;
      break;
    case '&&':
    case 'and':
      result = a && b;
      break;
    case '||':
    case 'or':
      result = a || b;
      break;
    default:
      result = false;
  }

  if (options && options.fn) {
    return result ? options.fn(this) : options.inverse(this);
  }
  return result;
};

/**
 * Gets an environment variable value.
 * @param {string} name - The environment variable name.
 * @param {string} [defaultValue=''] - Default value if not set.
 * @returns {string} The environment variable value.
 */
const env = function (name, defaultValue = '') {
  if (!name || typeof name !== 'string') {
    return defaultValue;
  }
  return process.env[name] || defaultValue;
};

/**
 * Coalesces multiple values, returning the first non-null/undefined.
 * @param {...*} args - Values to coalesce.
 * @returns {*} The first non-null/undefined value.
 */
const coalesce = function (...args) {
  // Remove Handlebars options object if present (last arg with 'hash' property)
  const values = args.filter((arg) => {
    if (arg === null || arg === undefined) {
      return true; // Keep null/undefined to check in loop
    }
    if (typeof arg === 'object' && arg.hash !== undefined) {
      return false; // This is Handlebars options object
    }
    return true;
  });

  for (const value of values) {
    if (value !== null && value !== undefined) {
      return value;
    }
  }
  return null;
};

/**
 * Debug helper - outputs value to console and returns it.
 * @param {*} value - The value to debug.
 * @param {string} [label='Debug'] - Label for the output.
 * @returns {string} Empty string (for use in templates).
 */
const debug = function (value, label = 'Debug') {
  console.log(`[${label}]:`, JSON.stringify(value, null, 2));
  return '';
};

module.exports = {
  // Conditional helpers
  ifEquals,
  ifNotEquals,
  compare,

  // String helpers
  camelCase,
  upperCase,
  lowerCase,
  isLowerCase,
  replace,
  concat,
  pluralize,
  singularize,
  kebabCase,
  snakeCase,
  pascalCase,
  capitalize,
  truncate,
  pad,
  trim,
  repeat,
  startsWith,
  endsWith,

  // Type helpers
  getType,
  isSystemType,
  hasSystemType,
  getSqlType,
  getSystemType,
  isNumber,
  isEmpty,

  // Collection helpers
  findIn,
  existsIn,
  any,
  first,
  last,
  orderBy,
  where,
  contains,
  join,
  split,
  unique,
  groupBy,
  count,
  length,
  slice,
  reverse,

  // Date helpers
  formatDate,
  now,

  // Utility helpers
  defaultValue,
  coalesce,
  math,
  toJson,
  env,
  debug,
};
