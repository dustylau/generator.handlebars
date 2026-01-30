/**
 * Tests for TemplateSettings conditional generation features
 */
const { TemplateSettings } = require('../TemplateSettings');

describe('TemplateSettings', () => {
  describe('constructor', () => {
    test('should set default values', () => {
      const settings = new TemplateSettings({});

      expect(settings.target).toBe('Model');
      expect(settings.targetItem).toBe('item');
      expect(settings.enabled).toBe(true);
      expect(settings.generateIf).toBeNull();
      expect(settings.skipIf).toBeNull();
      expect(settings.description).toBeNull();
    });

    test('should accept GenerateIf condition', () => {
      const settings = new TemplateSettings({
        GenerateIf: 'Model.type eq entity',
      });

      expect(settings.generateIf).toBe('Model.type eq entity');
    });

    test('should accept SkipIf condition', () => {
      const settings = new TemplateSettings({
        SkipIf: 'item.IsAbstract eq true',
      });

      expect(settings.skipIf).toBe('item.IsAbstract eq true');
    });

    test('should accept Enabled flag', () => {
      const settings = new TemplateSettings({
        Enabled: false,
      });

      expect(settings.enabled).toBe(false);
    });

    test('should accept Description', () => {
      const settings = new TemplateSettings({
        Description: 'Generates entity classes',
      });

      expect(settings.description).toBe('Generates entity classes');
    });
  });

  describe('getValueByPath', () => {
    test('should get simple property', () => {
      const obj = { name: 'test' };
      expect(TemplateSettings.getValueByPath(obj, 'name')).toBe('test');
    });

    test('should get nested property', () => {
      const obj = { user: { name: { first: 'John' } } };
      expect(TemplateSettings.getValueByPath(obj, 'user.name.first')).toBe('John');
    });

    test('should return undefined for missing path', () => {
      const obj = { name: 'test' };
      expect(TemplateSettings.getValueByPath(obj, 'missing.path')).toBeUndefined();
    });

    test('should handle null object', () => {
      expect(TemplateSettings.getValueByPath(null, 'name')).toBeUndefined();
    });

    test('should handle empty path', () => {
      const obj = { name: 'test' };
      expect(TemplateSettings.getValueByPath(obj, '')).toBeUndefined();
    });
  });

  describe('evaluateCondition', () => {
    const context = {
      Model: { type: 'entity', count: 5 },
      item: { Name: 'User', IsActive: true, IsAbstract: false },
    };

    describe('equality operators', () => {
      test('eq - should match equal string values', () => {
        expect(TemplateSettings.evaluateCondition('Model.type eq entity', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.type eq service', context)).toBe(false);
      });

      test('eq - should match equal boolean values', () => {
        expect(TemplateSettings.evaluateCondition('item.IsActive eq true', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('item.IsActive eq false', context)).toBe(false);
      });

      test('eq - should match equal numeric values', () => {
        expect(TemplateSettings.evaluateCondition('Model.count eq 5', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.count eq 10', context)).toBe(false);
      });

      test('ne - should match not equal values', () => {
        expect(TemplateSettings.evaluateCondition('Model.type ne service', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.type ne entity', context)).toBe(false);
      });

      test('== and != operators', () => {
        expect(TemplateSettings.evaluateCondition('Model.type == entity', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.type != entity', context)).toBe(false);
      });
    });

    describe('comparison operators', () => {
      test('gt - greater than', () => {
        expect(TemplateSettings.evaluateCondition('Model.count gt 3', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.count gt 5', context)).toBe(false);
      });

      test('lt - less than', () => {
        expect(TemplateSettings.evaluateCondition('Model.count lt 10', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.count lt 5', context)).toBe(false);
      });

      test('gte - greater than or equal', () => {
        expect(TemplateSettings.evaluateCondition('Model.count gte 5', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.count gte 6', context)).toBe(false);
      });

      test('lte - less than or equal', () => {
        expect(TemplateSettings.evaluateCondition('Model.count lte 5', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.count lte 4', context)).toBe(false);
      });

      test('> < >= <= operators', () => {
        expect(TemplateSettings.evaluateCondition('Model.count > 4', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.count < 6', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.count >= 5', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('Model.count <= 5', context)).toBe(true);
      });
    });

    describe('string operators', () => {
      test('contains - should check if string contains value', () => {
        expect(TemplateSettings.evaluateCondition('item.Name contains User', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('item.Name contains Admin', context)).toBe(false);
      });

      test('startswith - should check if string starts with value', () => {
        expect(TemplateSettings.evaluateCondition('item.Name startswith Us', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('item.Name startswith Ad', context)).toBe(false);
      });

      test('endswith - should check if string ends with value', () => {
        expect(TemplateSettings.evaluateCondition('item.Name endswith er', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('item.Name endswith ing', context)).toBe(false);
      });

      test('matches - should check regex pattern', () => {
        expect(TemplateSettings.evaluateCondition('item.Name matches ^U.*r$', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('item.Name matches ^A.*$', context)).toBe(false);
      });
    });

    describe('existence operators', () => {
      test('exists - should check if property exists', () => {
        expect(TemplateSettings.evaluateCondition('item.Name exists true', context)).toBe(true);
        expect(TemplateSettings.evaluateCondition('item.Missing exists true', context)).toBe(false);
      });

      test('empty - should check if value is empty', () => {
        const emptyContext = { ...context, empty: { arr: [], str: '' } };
        expect(TemplateSettings.evaluateCondition('empty.arr empty true', emptyContext)).toBe(true);
        expect(TemplateSettings.evaluateCondition('empty.str empty true', emptyContext)).toBe(true);
        expect(TemplateSettings.evaluateCondition('item.Name empty true', context)).toBe(false);
      });
    });

    describe('edge cases', () => {
      test('null expression returns true', () => {
        expect(TemplateSettings.evaluateCondition(null, context)).toBe(true);
      });

      test('empty expression returns true', () => {
        expect(TemplateSettings.evaluateCondition('', context)).toBe(true);
      });

      test('invalid expression returns true with warning', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        expect(TemplateSettings.evaluateCondition('invalid', context)).toBe(true);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      test('unknown operator returns true with warning', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        expect(TemplateSettings.evaluateCondition('item.Name unknown value', context)).toBe(true);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      test('value with spaces', () => {
        const ctx = { item: { description: 'Hello World' } };
        expect(TemplateSettings.evaluateCondition('item.description eq Hello World', ctx)).toBe(
          true
        );
      });
    });
  });

  describe('shouldGenerate', () => {
    test('should return false when disabled', () => {
      const settings = new TemplateSettings({ Enabled: false });
      expect(settings.shouldGenerate({})).toBe(false);
    });

    test('should return true when enabled with no conditions', () => {
      const settings = new TemplateSettings({});
      expect(settings.shouldGenerate({})).toBe(true);
    });

    test('should respect GenerateIf condition', () => {
      const settings = new TemplateSettings({
        GenerateIf: 'Model.type eq entity',
      });

      expect(settings.shouldGenerate({ Model: { type: 'entity' } })).toBe(true);
      expect(settings.shouldGenerate({ Model: { type: 'service' } })).toBe(false);
    });

    test('should respect SkipIf condition', () => {
      const settings = new TemplateSettings({
        SkipIf: 'item.IsAbstract eq true',
      });

      expect(settings.shouldGenerate({ item: { IsAbstract: false } })).toBe(true);
      expect(settings.shouldGenerate({ item: { IsAbstract: true } })).toBe(false);
    });

    test('should handle both GenerateIf and SkipIf', () => {
      const settings = new TemplateSettings({
        GenerateIf: 'Model.type eq entity',
        SkipIf: 'item.IsAbstract eq true',
      });

      // Both conditions must be satisfied
      expect(
        settings.shouldGenerate({ Model: { type: 'entity' }, item: { IsAbstract: false } })
      ).toBe(true);
      expect(
        settings.shouldGenerate({ Model: { type: 'service' }, item: { IsAbstract: false } })
      ).toBe(false);
      expect(
        settings.shouldGenerate({ Model: { type: 'entity' }, item: { IsAbstract: true } })
      ).toBe(false);
    });

    describe('environment variable conditions', () => {
      const originalEnv = process.env;

      beforeEach(() => {
        process.env = { ...originalEnv };
      });

      afterAll(() => {
        process.env = originalEnv;
      });

      test('GenerateIf with env: should check environment variable', () => {
        const settings = new TemplateSettings({
          GenerateIf: 'env:GENERATE_ENTITIES',
        });

        process.env.GENERATE_ENTITIES = 'true';
        expect(settings.shouldGenerate({})).toBe(true);

        process.env.GENERATE_ENTITIES = 'false';
        expect(settings.shouldGenerate({})).toBe(false);

        delete process.env.GENERATE_ENTITIES;
        expect(settings.shouldGenerate({})).toBe(false);
      });

      test('SkipIf with env: should check environment variable', () => {
        const settings = new TemplateSettings({
          SkipIf: 'env:SKIP_GENERATION',
        });

        delete process.env.SKIP_GENERATION;
        expect(settings.shouldGenerate({})).toBe(true);

        process.env.SKIP_GENERATION = 'true';
        expect(settings.shouldGenerate({})).toBe(false);

        process.env.SKIP_GENERATION = '0';
        expect(settings.shouldGenerate({})).toBe(true);
      });
    });
  });
});
