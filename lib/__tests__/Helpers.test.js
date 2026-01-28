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
        expect(getSqlType({ Type: 'string', Length: 100 })).toBe(
          '[nvarchar](100)',
        );
      });

      it('should map decimal with precision/scale', () => {
        expect(getSqlType({ Type: 'decimal', Precision: 10, Scale: 2 })).toBe(
          '[decimal](10, 2)',
        );
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
});
