const {
  camelCase,
  upperCase,
  lowerCase,
  isLowerCase,
  ifEquals,
  ifNotEquals,
  getType,
  existsIn,
  findIn,
  first,
  any,
  orderBy,
  where,
  isSystemType,
  hasSystemType,
  getSqlType,
  getSystemType,
  isNumber,
  isEmpty,
  contains,
  replace,
  concat,
  // New helpers
  pluralize,
  singularize,
  join,
  split,
  defaultValue,
  truncate,
  pad,
  kebabCase,
  snakeCase,
  pascalCase,
  capitalize,
  formatDate,
  now,
  repeat,
  startsWith,
  endsWith,
  trim,
  length,
  slice,
  reverse,
  unique,
  groupBy,
  last,
  count,
  math,
  toJson,
  compare,
  env,
  coalesce,
  debug,
} = require('../Helpers');

describe('Helpers', () => {
  describe('String Helpers', () => {
    describe('camelCase', () => {
      it('should convert PascalCase to camelCase', () => {
        expect(camelCase('HelloWorld')).toBe('helloWorld');
      });

      it('should convert UPPERCASE to lowercase', () => {
        expect(camelCase('HELLO')).toBe('hello');
      });

      it('should handle already camelCase', () => {
        expect(camelCase('helloWorld')).toBe('helloWorld');
      });

      it('should handle single character', () => {
        expect(camelCase('A')).toBe('a');
      });

      it('should return empty string for null/undefined', () => {
        expect(camelCase(null)).toBe('');
        expect(camelCase(undefined)).toBe('');
        expect(camelCase('')).toBe('');
      });

      it('should handle acronyms', () => {
        expect(camelCase('XMLParser')).toBe('xmlParser');
        expect(camelCase('IOStream')).toBe('ioStream');
      });
    });

    describe('upperCase', () => {
      it('should convert to uppercase', () => {
        expect(upperCase('hello')).toBe('HELLO');
      });

      it('should return empty string for non-strings', () => {
        expect(upperCase(null)).toBe('');
        expect(upperCase(123)).toBe('');
      });
    });

    describe('lowerCase', () => {
      it('should convert to lowercase', () => {
        expect(lowerCase('HELLO')).toBe('hello');
      });

      it('should return empty string for non-strings', () => {
        expect(lowerCase(null)).toBe('');
      });
    });

    describe('isLowerCase', () => {
      it('should return true for lowercase', () => {
        expect(isLowerCase('a')).toBe(true);
      });

      it('should return false for uppercase', () => {
        expect(isLowerCase('A')).toBe(false);
      });
    });

    describe('replace', () => {
      it('should replace substring', () => {
        expect(replace('hello world', 'world', 'there')).toBe('hello there');
      });

      it('should return empty string for non-string input', () => {
        expect(replace(null, 'a', 'b')).toBe('');
      });
    });

    describe('concat', () => {
      it('should concatenate two strings', () => {
        expect(concat('hello', 'world')).toBe('helloworld');
      });

      it('should convert non-strings', () => {
        expect(concat('count: ', 5)).toBe('count: 5');
      });
    });
  });

  describe('Conditional Helpers', () => {
    describe('ifEquals', () => {
      const mockOptions = {
        fn: () => 'true-block',
        inverse: () => 'false-block',
      };

      it('should return fn() when equal', () => {
        expect(ifEquals('a', 'a', mockOptions)).toBe('true-block');
      });

      it('should return inverse() when not equal', () => {
        expect(ifEquals('a', 'b', mockOptions)).toBe('false-block');
      });

      it('should use loose equality', () => {
        expect(ifEquals(1, '1', mockOptions)).toBe('true-block');
      });
    });

    describe('ifNotEquals', () => {
      const mockOptions = {
        fn: () => 'true-block',
        inverse: () => 'false-block',
      };

      it('should return fn() when not equal', () => {
        expect(ifNotEquals('a', 'b', mockOptions)).toBe('true-block');
      });

      it('should return inverse() when equal', () => {
        expect(ifNotEquals('a', 'a', mockOptions)).toBe('false-block');
      });
    });
  });

  describe('Collection Helpers', () => {
    const testCollection = [
      { id: 1, name: 'Alice', active: true },
      { id: 2, name: 'Bob', active: false },
      { id: 3, name: 'Charlie', active: true },
    ];

    describe('existsIn', () => {
      it('should return true when item exists', () => {
        expect(existsIn(testCollection, 'name', 'Alice')).toBe(true);
      });

      it('should return false when item does not exist', () => {
        expect(existsIn(testCollection, 'name', 'Dave')).toBe(false);
      });

      it('should return false for null collection', () => {
        expect(existsIn(null, 'name', 'Alice')).toBe(false);
      });
    });

    describe('findIn', () => {
      it('should return matching item', () => {
        expect(findIn(testCollection, 'id', 2)).toEqual({
          id: 2,
          name: 'Bob',
          active: false,
        });
      });

      it('should return undefined when not found', () => {
        expect(findIn(testCollection, 'id', 99)).toBeUndefined();
      });

      it('should return undefined for non-array', () => {
        expect(findIn(null, 'id', 1)).toBeUndefined();
      });
    });

    describe('where', () => {
      it('should filter with eq operator', () => {
        const result = where(testCollection, 'active eq true');
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Alice');
      });

      it('should filter with ne operator', () => {
        const result = where(testCollection, 'active ne true');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Bob');
      });

      it('should handle multiple filters', () => {
        const result = where(testCollection, 'active eq true;id ne 1');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Charlie');
      });

      it('should return empty array for null collection', () => {
        expect(where(null, 'active eq true')).toEqual([]);
      });

      it('should return copy for null filter', () => {
        expect(where(testCollection, null)).toHaveLength(3);
      });
    });

    describe('first', () => {
      it('should return first matching item', () => {
        const result = first(testCollection, 'active eq true');
        expect(result.name).toBe('Alice');
      });

      it('should return null when no match', () => {
        expect(first(testCollection, 'id eq 99')).toBeNull();
      });

      it('should return null for null collection', () => {
        expect(first(null, 'active eq true')).toBeNull();
      });
    });

    describe('any', () => {
      it('should return true when matches exist', () => {
        expect(any(testCollection, 'active eq true')).toBe(true);
      });

      it('should return false when no matches', () => {
        expect(any(testCollection, 'id eq 99')).toBe(false);
      });

      it('should return false for null collection', () => {
        expect(any(null, 'active eq true')).toBe(false);
      });
    });

    describe('orderBy', () => {
      it('should sort by property ascending', () => {
        const result = orderBy(testCollection, 'name');
        expect(result[0].name).toBe('Alice');
        expect(result[2].name).toBe('Charlie');
      });

      it('should not mutate original array', () => {
        const original = [...testCollection];
        orderBy(testCollection, 'name');
        expect(testCollection).toEqual(original);
      });

      it('should return collection for null orderBy', () => {
        const result = orderBy(testCollection, null);
        expect(result).toHaveLength(3);
      });
    });

    describe('contains', () => {
      it('should return true when value exists', () => {
        expect(contains(['a', 'b', 'c'], 'b')).toBe(true);
      });

      it('should return false when value does not exist', () => {
        expect(contains(['a', 'b', 'c'], 'd')).toBe(false);
      });

      it('should return false for non-array', () => {
        expect(contains(null, 'a')).toBe(false);
      });
    });
  });

  describe('Type Helpers', () => {
    describe('isEmpty', () => {
      it('should return true for null', () => {
        expect(isEmpty(null)).toBe(true);
      });

      it('should return true for undefined', () => {
        expect(isEmpty(undefined)).toBe(true);
      });

      it('should return true for empty string', () => {
        expect(isEmpty('')).toBe(true);
      });

      it('should return true for empty array', () => {
        expect(isEmpty([])).toBe(true);
      });

      it('should return false for non-empty string', () => {
        expect(isEmpty('hello')).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('should return true for numbers', () => {
        expect(isNumber(42)).toBe(true);
        expect(isNumber(3.14)).toBe(true);
        expect(isNumber(0)).toBe(true);
      });

      it('should return true for numeric strings', () => {
        expect(isNumber('42')).toBe(true);
      });

      it('should return false for non-numbers', () => {
        expect(isNumber('hello')).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(NaN)).toBe(false);
      });
    });

    describe('isSystemType', () => {
      it('should return true for known types', () => {
        expect(isSystemType('int')).toBe(true);
        expect(isSystemType('string')).toBe(true);
        expect(isSystemType('Guid')).toBe(true);
      });

      it('should return false for unknown types', () => {
        expect(isSystemType('CustomType')).toBe(false);
      });
    });

    describe('hasSystemType', () => {
      it('should return true for property with system type', () => {
        expect(hasSystemType({ Type: 'int' })).toBe(true);
      });

      it('should return true for enum (maps to int)', () => {
        expect(hasSystemType({ IsEnum: true, Enum: 'MyEnum' })).toBe(true);
      });

      it('should return false for null', () => {
        expect(hasSystemType(null)).toBe(false);
      });
    });

    describe('getType', () => {
      it('should return type from property', () => {
        expect(getType({ Type: 'string' })).toBe('string');
      });

      it('should return enum name when IsEnum', () => {
        expect(getType({ IsEnum: true, Enum: 'MyEnum' })).toBe('MyEnum');
      });

      it('should add ? for nullable non-nullable types', () => {
        expect(getType({ Type: 'int', IsNullable: true })).toBe('int?');
      });

      it('should return empty string for null', () => {
        expect(getType(null)).toBe('');
      });
    });

    describe('getSqlType', () => {
      it('should map int to [int]', () => {
        expect(getSqlType({ Type: 'int' })).toBe('[int]');
      });

      it('should map string with length', () => {
        expect(getSqlType({ Type: 'string', Length: 100 })).toBe('[nvarchar](100)');
      });

      it('should map decimal with precision/scale', () => {
        expect(getSqlType({ Type: 'decimal', Precision: 10, Scale: 2 })).toBe('[decimal](10, 2)');
      });

      it('should map Guid to uniqueidentifier', () => {
        expect(getSqlType({ Type: 'Guid' })).toBe('[uniqueidentifier]');
      });

      it('should handle unknown types', () => {
        expect(getSqlType({ Type: 'CustomType' })).toBe('[CustomType]');
      });

      it('should return default for null', () => {
        expect(getSqlType(null)).toBe('[unknown]');
      });
    });

    describe('getSystemType', () => {
      it('should map int to Int32', () => {
        expect(getSystemType({ Type: 'int' })).toBe('Int32');
      });

      it('should map string to String', () => {
        expect(getSystemType({ Type: 'string' })).toBe('String');
      });

      it('should return Object for unknown', () => {
        expect(getSystemType({ Type: 'CustomType' })).toBe('Object');
      });

      it('should return Object for null', () => {
        expect(getSystemType(null)).toBe('Object');
      });
    });
  });

  // ============================================================
  // New Helpers Tests (Phase 5A)
  // ============================================================

  describe('New String Helpers', () => {
    describe('pluralize', () => {
      it('should pluralize regular words', () => {
        expect(pluralize('cat')).toBe('cats');
        expect(pluralize('dog')).toBe('dogs');
      });

      it('should handle words ending in s, x, z', () => {
        expect(pluralize('bus')).toBe('buses');
        expect(pluralize('box')).toBe('boxes');
        expect(pluralize('quiz')).toBe('quizzes');
      });

      it('should handle words ending in consonant+y', () => {
        expect(pluralize('city')).toBe('cities');
        expect(pluralize('baby')).toBe('babies');
      });

      it('should handle words ending in vowel+y', () => {
        expect(pluralize('day')).toBe('days');
        expect(pluralize('key')).toBe('keys');
      });

      it('should handle irregular plurals', () => {
        expect(pluralize('child')).toBe('children');
        expect(pluralize('person')).toBe('people');
        expect(pluralize('mouse')).toBe('mice');
      });

      it('should preserve case for irregular plurals', () => {
        expect(pluralize('Child')).toBe('Children');
        expect(pluralize('Person')).toBe('People');
      });

      it('should return singular when count is 1', () => {
        expect(pluralize('cat', 1)).toBe('cat');
        expect(pluralize('cat', 2)).toBe('cats');
      });

      it('should return empty string for invalid input', () => {
        expect(pluralize(null)).toBe('');
        expect(pluralize('')).toBe('');
      });
    });

    describe('singularize', () => {
      it('should singularize regular words', () => {
        expect(singularize('cats')).toBe('cat');
        expect(singularize('dogs')).toBe('dog');
      });

      it('should handle words ending in ies', () => {
        expect(singularize('cities')).toBe('city');
        expect(singularize('babies')).toBe('baby');
      });

      it('should handle irregular singulars', () => {
        expect(singularize('children')).toBe('child');
        expect(singularize('people')).toBe('person');
      });

      it('should return empty string for invalid input', () => {
        expect(singularize(null)).toBe('');
      });
    });

    describe('kebabCase', () => {
      it('should convert camelCase to kebab-case', () => {
        expect(kebabCase('helloWorld')).toBe('hello-world');
      });

      it('should convert PascalCase to kebab-case', () => {
        expect(kebabCase('HelloWorld')).toBe('hello-world');
      });

      it('should convert spaces to hyphens', () => {
        expect(kebabCase('hello world')).toBe('hello-world');
      });

      it('should return empty string for invalid input', () => {
        expect(kebabCase(null)).toBe('');
      });
    });

    describe('snakeCase', () => {
      it('should convert camelCase to snake_case', () => {
        expect(snakeCase('helloWorld')).toBe('hello_world');
      });

      it('should convert PascalCase to snake_case', () => {
        expect(snakeCase('HelloWorld')).toBe('hello_world');
      });

      it('should return empty string for invalid input', () => {
        expect(snakeCase(null)).toBe('');
      });
    });

    describe('pascalCase', () => {
      it('should convert camelCase to PascalCase', () => {
        expect(pascalCase('helloWorld')).toBe('HelloWorld');
      });

      it('should convert kebab-case to PascalCase', () => {
        expect(pascalCase('hello-world')).toBe('HelloWorld');
      });

      it('should return empty string for invalid input', () => {
        expect(pascalCase(null)).toBe('');
      });
    });

    describe('capitalize', () => {
      it('should capitalize first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
      });

      it('should return empty string for invalid input', () => {
        expect(capitalize(null)).toBe('');
      });
    });

    describe('truncate', () => {
      it('should truncate long strings', () => {
        expect(truncate('hello world', 8)).toBe('hello...');
      });

      it('should not truncate short strings', () => {
        expect(truncate('hello', 10)).toBe('hello');
      });

      it('should use custom suffix', () => {
        expect(truncate('hello world', 8, '!')).toBe('hello w!');
      });

      it('should return empty string for invalid input', () => {
        expect(truncate(null, 5)).toBe('');
      });
    });

    describe('pad', () => {
      it('should pad right by default', () => {
        expect(pad('hi', 5)).toBe('hi   ');
      });

      it('should pad left', () => {
        expect(pad('hi', 5, ' ', 'left')).toBe('   hi');
      });

      it('should pad both sides', () => {
        expect(pad('hi', 6, ' ', 'both')).toBe('  hi  ');
      });

      it('should use custom character', () => {
        expect(pad('5', 3, '0', 'left')).toBe('005');
      });
    });

    describe('trim', () => {
      it('should trim whitespace', () => {
        expect(trim('  hello  ')).toBe('hello');
      });

      it('should return empty string for invalid input', () => {
        expect(trim(null)).toBe('');
      });
    });

    describe('repeat', () => {
      it('should repeat string', () => {
        expect(repeat('ab', 3)).toBe('ababab');
      });

      it('should return empty for count < 1', () => {
        expect(repeat('ab', 0)).toBe('');
      });
    });

    describe('startsWith', () => {
      it('should return true when starts with prefix', () => {
        expect(startsWith('hello', 'he')).toBe(true);
      });

      it('should return false when does not start with prefix', () => {
        expect(startsWith('hello', 'lo')).toBe(false);
      });
    });

    describe('endsWith', () => {
      it('should return true when ends with suffix', () => {
        expect(endsWith('hello', 'lo')).toBe(true);
      });

      it('should return false when does not end with suffix', () => {
        expect(endsWith('hello', 'he')).toBe(false);
      });
    });
  });

  describe('New Collection Helpers', () => {
    describe('join', () => {
      it('should join array with default separator', () => {
        expect(join(['a', 'b', 'c'])).toBe('a, b, c');
      });

      it('should join array with custom separator', () => {
        expect(join(['a', 'b', 'c'], '-')).toBe('a-b-c');
      });

      it('should return empty string for invalid input', () => {
        expect(join(null)).toBe('');
      });
    });

    describe('split', () => {
      it('should split string with default separator', () => {
        expect(split('a,b,c')).toEqual(['a', 'b', 'c']);
      });

      it('should split string with custom separator', () => {
        expect(split('a-b-c', '-')).toEqual(['a', 'b', 'c']);
      });

      it('should return empty array for invalid input', () => {
        expect(split(null)).toEqual([]);
      });
    });

    describe('unique', () => {
      it('should return unique values', () => {
        expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      });

      it('should dedupe by property', () => {
        const items = [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
          { id: 1, name: 'c' },
        ];
        expect(unique(items, 'id')).toHaveLength(2);
      });

      it('should return empty array for invalid input', () => {
        expect(unique(null)).toEqual([]);
      });
    });

    describe('groupBy', () => {
      it('should group by property', () => {
        const items = [
          { type: 'a', value: 1 },
          { type: 'b', value: 2 },
          { type: 'a', value: 3 },
        ];
        const result = groupBy(items, 'type');
        expect(result.a).toHaveLength(2);
        expect(result.b).toHaveLength(1);
      });

      it('should return empty object for invalid input', () => {
        expect(groupBy(null, 'type')).toEqual({});
      });
    });

    describe('last', () => {
      it('should return last item', () => {
        expect(last([1, 2, 3])).toBe(3);
      });

      it('should return null for empty array', () => {
        expect(last([])).toBe(null);
      });

      it('should return null for invalid input', () => {
        expect(last(null)).toBe(null);
      });
    });

    describe('count', () => {
      it('should count all items', () => {
        expect(count([1, 2, 3])).toBe(3);
      });

      it('should count filtered items', () => {
        const items = [{ active: true }, { active: false }, { active: true }];
        expect(count(items, 'active eq true')).toBe(2);
      });

      it('should return 0 for invalid input', () => {
        expect(count(null)).toBe(0);
      });
    });

    describe('length', () => {
      it('should return array length', () => {
        expect(length([1, 2, 3])).toBe(3);
      });

      it('should return string length', () => {
        expect(length('hello')).toBe(5);
      });

      it('should return 0 for invalid input', () => {
        expect(length(null)).toBe(0);
      });
    });

    describe('slice', () => {
      it('should slice array', () => {
        expect(slice([1, 2, 3, 4], 1, 3)).toEqual([2, 3]);
      });

      it('should slice string', () => {
        expect(slice('hello', 1, 4)).toBe('ell');
      });
    });

    describe('reverse', () => {
      it('should reverse array', () => {
        expect(reverse([1, 2, 3])).toEqual([3, 2, 1]);
      });

      it('should reverse string', () => {
        expect(reverse('hello')).toBe('olleh');
      });
    });
  });

  describe('Date Helpers', () => {
    describe('formatDate', () => {
      const testDate = new Date('2024-06-15T10:30:45.000Z');

      it('should format as ISO', () => {
        expect(formatDate(testDate, 'ISO')).toBe(testDate.toISOString());
      });

      it('should format as date only', () => {
        expect(formatDate(testDate, 'date')).toBe('2024-06-15');
      });

      it('should format as custom pattern', () => {
        // Note: result depends on timezone, so we just check format
        const result = formatDate(testDate, 'YYYY/MM/DD');
        expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
      });

      it('should return empty string for invalid date', () => {
        expect(formatDate('invalid')).toBe('');
      });
    });

    describe('now', () => {
      it('should return current date in ISO format', () => {
        const result = now('ISO');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it('should return current date in date format', () => {
        const result = now('date');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe('Utility Helpers', () => {
    describe('defaultValue', () => {
      it('should return value when truthy', () => {
        expect(defaultValue('hello', 'default')).toBe('hello');
      });

      it('should return default when null', () => {
        expect(defaultValue(null, 'default')).toBe('default');
      });

      it('should return default when undefined', () => {
        expect(defaultValue(undefined, 'default')).toBe('default');
      });

      it('should return default when empty string', () => {
        expect(defaultValue('', 'default')).toBe('default');
      });
    });

    describe('coalesce', () => {
      it('should return first non-null value', () => {
        expect(coalesce(null, undefined, 'hello', 'world')).toBe('hello');
      });

      it('should return null if all null/undefined', () => {
        expect(coalesce(null, undefined)).toBe(null);
      });
    });

    describe('math', () => {
      it('should add numbers', () => {
        expect(math(5, 'add', 3)).toBe(8);
        expect(math(5, '+', 3)).toBe(8);
      });

      it('should subtract numbers', () => {
        expect(math(5, 'sub', 3)).toBe(2);
        expect(math(5, '-', 3)).toBe(2);
      });

      it('should multiply numbers', () => {
        expect(math(5, 'mul', 3)).toBe(15);
        expect(math(5, '*', 3)).toBe(15);
      });

      it('should divide numbers', () => {
        expect(math(6, 'div', 3)).toBe(2);
        expect(math(6, '/', 3)).toBe(2);
      });

      it('should handle modulo', () => {
        expect(math(7, 'mod', 3)).toBe(1);
        expect(math(7, '%', 3)).toBe(1);
      });

      it('should return 0 for division by zero', () => {
        expect(math(5, '/', 0)).toBe(0);
      });
    });

    describe('toJson', () => {
      it('should stringify object', () => {
        expect(toJson({ a: 1 })).toBe('{\n  "a": 1\n}');
      });

      it('should use custom indent', () => {
        expect(toJson({ a: 1 }, 0)).toBe('{"a":1}');
      });
    });

    describe('compare', () => {
      const mockOptions = {
        fn: () => 'true-block',
        inverse: () => 'false-block',
      };

      it('should compare with eq operator', () => {
        expect(compare(5, 'eq', 5, mockOptions)).toBe('true-block');
        expect(compare(5, 'eq', 6, mockOptions)).toBe('false-block');
      });

      it('should compare with lt operator', () => {
        expect(compare(5, 'lt', 10, mockOptions)).toBe('true-block');
        expect(compare(10, 'lt', 5, mockOptions)).toBe('false-block');
      });

      it('should compare with gt operator', () => {
        expect(compare(10, 'gt', 5, mockOptions)).toBe('true-block');
      });

      it('should handle and operator', () => {
        expect(compare(true, 'and', true, mockOptions)).toBe('true-block');
        expect(compare(true, 'and', false, mockOptions)).toBe('false-block');
      });

      it('should handle or operator', () => {
        expect(compare(false, 'or', true, mockOptions)).toBe('true-block');
        expect(compare(false, 'or', false, mockOptions)).toBe('false-block');
      });
    });

    describe('env', () => {
      it('should return environment variable', () => {
        process.env.TEST_VAR = 'test_value';
        expect(env('TEST_VAR')).toBe('test_value');
        delete process.env.TEST_VAR;
      });

      it('should return default when not set', () => {
        expect(env('NONEXISTENT_VAR', 'default')).toBe('default');
      });
    });

    describe('debug', () => {
      it('should log and return empty string', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const result = debug({ test: 1 }, 'TestLabel');
        expect(result).toBe('');
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });
  });
});
