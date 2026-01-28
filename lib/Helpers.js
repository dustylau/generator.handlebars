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
        `Invalid filter expression: "${expression}". Expected format: "property operator value"`,
      );
      continue;
    }

    const [property, comparison, ...valueParts] = expressionElements;
    const rawValue = valueParts.join(' ');
    const value =
      rawValue === 'true' ? true : rawValue === 'false' ? false : rawValue;

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
      const precision =
        property && property.Precision > 0 ? property.Precision : 18;
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

module.exports = {
  ifEquals: ifEquals,
  ifNotEquals: ifNotEquals,
  camelCase: camelCase,
  upperCase: upperCase,
  isLowerCase: isLowerCase,
  lowerCase: lowerCase,
  getType: getType,
  isSystemType: isSystemType,
  hasSystemType: hasSystemType,
  findIn: findIn,
  existsIn: existsIn,
  any: any,
  first: first,
  orderBy: orderBy,
  where: where,
  getSqlType: getSqlType,
  getSystemType: getSystemType,
  isNumber: isNumber,
  isEmpty: isEmpty,
  contains: contains,
  replace: replace,
  concat: concat,
};
