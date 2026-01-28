const {
  GeneratorError,
  TemplateLoadError,
  TemplateCompileError,
  TemplateGenerateError,
  SettingsError,
  FileError,
  PluginError,
  formatErrorSummary,
} = require('../GeneratorError');

describe('GeneratorError', () => {
  describe('GeneratorError base class', () => {
    it('should create error with message', () => {
      const error = new GeneratorError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('GeneratorError');
      expect(error.code).toBe('GENERATOR_ERROR');
    });

    it('should accept context options', () => {
      const error = new GeneratorError('Test error', {
        template: 'myTemplate',
        file: '/path/to/file.hbs',
        line: 42,
        code: 'CUSTOM_CODE',
      });

      expect(error.template).toBe('myTemplate');
      expect(error.file).toBe('/path/to/file.hbs');
      expect(error.line).toBe(42);
      expect(error.code).toBe('CUSTOM_CODE');
    });

    it('should include timestamp', () => {
      const error = new GeneratorError('Test');
      expect(error.timestamp).toBeDefined();
      expect(() => new Date(error.timestamp)).not.toThrow();
    });

    it('should produce detailed string', () => {
      const error = new GeneratorError('Test error', {
        template: 'sample',
        file: 'sample.hbs',
        line: 10,
      });

      const detailed = error.toDetailedString();
      expect(detailed).toContain('Test error');
      expect(detailed).toContain('Template: sample');
      expect(detailed).toContain('File: sample.hbs');
      expect(detailed).toContain('Line: 10');
    });

    it('should convert to JSON', () => {
      const error = new GeneratorError('Test', {
        template: 'test',
        code: 'TEST_CODE',
      });

      const json = error.toJSON();
      expect(json.name).toBe('GeneratorError');
      expect(json.code).toBe('TEST_CODE');
      expect(json.template).toBe('test');
      expect(json.timestamp).toBeDefined();
    });

    it('should include cause in detailed string', () => {
      const cause = new Error('Original error');
      const error = new GeneratorError('Wrapper error', { cause });

      const detailed = error.toDetailedString();
      expect(detailed).toContain('Caused by: Original error');
    });
  });

  describe('TemplateLoadError', () => {
    it('should have correct name and code', () => {
      const error = new TemplateLoadError('Failed to load');
      expect(error.name).toBe('TemplateLoadError');
      expect(error.code).toBe('TEMPLATE_LOAD_ERROR');
    });
  });

  describe('TemplateCompileError', () => {
    it('should have correct name and code', () => {
      const error = new TemplateCompileError('Syntax error');
      expect(error.name).toBe('TemplateCompileError');
      expect(error.code).toBe('TEMPLATE_COMPILE_ERROR');
    });

    it('should create from Handlebars error', () => {
      const hbsError = new Error('Parse error on line 5');
      const error = TemplateCompileError.fromHandlebarsError(hbsError, 'myTemplate', 'my.hbs');

      expect(error.template).toBe('myTemplate');
      expect(error.file).toBe('my.hbs');
      expect(error.line).toBe(5);
      expect(error.cause).toBe(hbsError);
    });

    it('should handle Handlebars error without line number', () => {
      const hbsError = new Error('Unknown error');
      const error = TemplateCompileError.fromHandlebarsError(hbsError, 'test', 'test.hbs');

      expect(error.line).toBeNull();
    });
  });

  describe('TemplateGenerateError', () => {
    it('should have correct name and code', () => {
      const error = new TemplateGenerateError('Generation failed');
      expect(error.name).toBe('TemplateGenerateError');
      expect(error.code).toBe('TEMPLATE_GENERATE_ERROR');
    });
  });

  describe('SettingsError', () => {
    it('should have correct name and code', () => {
      const error = new SettingsError('Invalid settings');
      expect(error.name).toBe('SettingsError');
      expect(error.code).toBe('SETTINGS_ERROR');
    });

    it('should create missing required error', () => {
      const error = SettingsError.missingRequired('ExportPath', 'myTemplate');
      expect(error.message).toContain('Missing required setting: ExportPath');
      expect(error.template).toBe('myTemplate');
      expect(error.code).toBe('SETTINGS_MISSING_REQUIRED');
    });

    it('should create invalid value error', () => {
      const error = SettingsError.invalidValue('Target', 123, 'string');
      expect(error.message).toContain('Invalid value');
      expect(error.message).toContain('Target');
      expect(error.code).toBe('SETTINGS_INVALID_VALUE');
    });
  });

  describe('FileError', () => {
    it('should have correct name and code', () => {
      const error = new FileError('File operation failed');
      expect(error.name).toBe('FileError');
      expect(error.code).toBe('FILE_ERROR');
    });

    it('should create not found error', () => {
      const error = FileError.notFound('/path/to/missing.hbs');
      expect(error.message).toContain('File not found');
      expect(error.file).toBe('/path/to/missing.hbs');
      expect(error.code).toBe('FILE_NOT_FOUND');
    });

    it('should create write failed error', () => {
      const cause = new Error('EACCES');
      const error = FileError.writeFailed('/path/to/file.txt', cause);
      expect(error.message).toContain('Failed to write');
      expect(error.code).toBe('FILE_WRITE_FAILED');
      expect(error.cause).toBe(cause);
    });
  });

  describe('PluginError', () => {
    it('should have correct name and code', () => {
      const error = new PluginError('Plugin failed');
      expect(error.name).toBe('PluginError');
      expect(error.code).toBe('PLUGIN_ERROR');
    });

    it('should include plugin name in detailed string', () => {
      const error = new PluginError('Failed', { pluginName: 'my-plugin' });
      const detailed = error.toDetailedString();
      expect(detailed).toContain('Plugin: my-plugin');
    });
  });

  describe('formatErrorSummary', () => {
    it('should return "No errors" for empty array', () => {
      expect(formatErrorSummary([])).toBe('No errors');
      expect(formatErrorSummary(null)).toBe('No errors');
    });

    it('should format mixed errors', () => {
      const errors = [
        new GeneratorError('Error 1', { template: 'a' }),
        new Error('Error 2'),
        'Error 3 string',
      ];

      const summary = formatErrorSummary(errors);
      expect(summary).toContain('3 error(s) occurred');
      expect(summary).toContain('Error 1');
      expect(summary).toContain('Template: a');
      expect(summary).toContain('Error 2');
      expect(summary).toContain('Error 3 string');
    });
  });
});
