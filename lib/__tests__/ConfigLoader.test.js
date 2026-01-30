const path = require('path');
const fs = require('fs');
const { ConfigLoader, DEFAULT_CONFIG, CONFIG_FILE_NAMES } = require('../ConfigLoader');

// Mock fs module
jest.mock('fs');

describe('ConfigLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all fs mocks
    fs.existsSync.mockReturnValue(false);
    fs.readFileSync.mockReturnValue('{}');
  });

  describe('constructor', () => {
    it('should initialize with default base path', () => {
      const loader = new ConfigLoader();
      expect(loader.basePath).toBe(process.cwd());
    });

    it('should accept custom base path', () => {
      const loader = new ConfigLoader('/custom/path');
      expect(loader.basePath).toBe('/custom/path');
    });

    it('should have default config', () => {
      const loader = new ConfigLoader();
      expect(loader.config).toEqual(DEFAULT_CONFIG);
    });

    it('should not be loaded initially', () => {
      const loader = new ConfigLoader();
      expect(loader.isLoaded).toBe(false);
      expect(loader.configPath).toBe(null);
    });
  });

  describe('findConfigFile', () => {
    it('should find .generatorrc.json in base path', () => {
      fs.existsSync.mockImplementation((p) => p.endsWith('.generatorrc.json'));

      const loader = new ConfigLoader('/project');
      const result = loader.findConfigFile();

      expect(result).toContain('.generatorrc.json');
    });

    it('should search for all config file names in order', () => {
      // First two don't exist, third one does
      fs.existsSync
        .mockReturnValueOnce(false) // .generatorrc.json
        .mockReturnValueOnce(false) // .generatorrc
        .mockReturnValueOnce(true); // generator.config.json

      const loader = new ConfigLoader('/project');
      const result = loader.findConfigFile(false);

      expect(result).toContain('generator.config.json');
    });

    it('should search parent directories', () => {
      const callPaths = [];
      fs.existsSync.mockImplementation((p) => {
        callPaths.push(p);
        return p.includes('parent') && p.endsWith('.generatorrc.json');
      });

      const loader = new ConfigLoader('/project/child');
      // Mock path.dirname behavior
      loader.findConfigFile(true);

      // Should have searched multiple directories
      expect(callPaths.length).toBeGreaterThan(CONFIG_FILE_NAMES.length);
    });

    it('should return null when no config found', () => {
      fs.existsSync.mockReturnValue(false);

      const loader = new ConfigLoader('/project');
      const result = loader.findConfigFile(false);

      expect(result).toBe(null);
    });
  });

  describe('load', () => {
    it('should load JSON config file', () => {
      const configContent = JSON.stringify({
        templateDirectory: './custom-templates',
        verbose: true,
      });

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(configContent);

      const loader = new ConfigLoader('/project');
      const config = loader.load('/project/.generatorrc.json');

      expect(config.templateDirectory).toBe('./custom-templates');
      expect(config.verbose).toBe(true);
      expect(loader.isLoaded).toBe(true);
    });

    it('should merge with defaults', () => {
      const configContent = JSON.stringify({
        verbose: true,
      });

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(configContent);

      const loader = new ConfigLoader('/project');
      const config = loader.load('/project/.generatorrc.json');

      // Should have both custom and default values
      expect(config.verbose).toBe(true);
      expect(config.templateDirectory).toBe(DEFAULT_CONFIG.templateDirectory);
      expect(config.extension).toBe(DEFAULT_CONFIG.extension);
    });

    it('should return defaults when no config file found', () => {
      fs.existsSync.mockReturnValue(false);

      const loader = new ConfigLoader('/project');
      const config = loader.load();

      expect(config).toEqual(DEFAULT_CONFIG);
      expect(loader.isLoaded).toBe(false);
    });

    it('should throw on invalid JSON', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      const loader = new ConfigLoader('/project');

      expect(() => loader.load('/project/.generatorrc.json')).toThrow();
    });
  });

  describe('applyCliOptions', () => {
    it('should apply CLI options as overrides', () => {
      const loader = new ConfigLoader('/project');

      loader.applyCliOptions({
        templates: './cli-templates',
        model: './cli-model.json',
        verbose: true,
      });

      expect(loader.config.templateDirectory).toBe('./cli-templates');
      expect(loader.config.modelPath).toBe('./cli-model.json');
      expect(loader.config.verbose).toBe(true);
    });

    it('should not override with undefined values', () => {
      const loader = new ConfigLoader('/project');
      const originalTemplate = loader.config.templateDirectory;

      loader.applyCliOptions({
        verbose: true,
      });

      expect(loader.config.templateDirectory).toBe(originalTemplate);
    });
  });

  describe('get and set', () => {
    it('should get value by key path', () => {
      const loader = new ConfigLoader('/project');
      loader._config = {
        nested: {
          deep: {
            value: 'test',
          },
        },
      };

      expect(loader.get('nested.deep.value')).toBe('test');
    });

    it('should return default for missing path', () => {
      const loader = new ConfigLoader('/project');

      expect(loader.get('nonexistent.path', 'default')).toBe('default');
    });

    it('should set value by key path', () => {
      const loader = new ConfigLoader('/project');

      loader.set('custom.nested.value', 'test');

      expect(loader.config.custom.nested.value).toBe('test');
    });
  });

  describe('resolvePath', () => {
    it('should return absolute paths unchanged', () => {
      const loader = new ConfigLoader('/project');

      const result = loader.resolvePath('/absolute/path');

      expect(result).toBe('/absolute/path');
    });

    it('should resolve relative paths from base path', () => {
      const loader = new ConfigLoader('/project');

      const result = loader.resolvePath('./relative/path');

      expect(result).toContain('relative');
      expect(path.isAbsolute(result)).toBe(true);
    });

    it('should resolve from config file directory when loaded', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('{}');

      const loader = new ConfigLoader('/project');
      loader.load('/project/config/.generatorrc.json');

      const result = loader.resolvePath('./templates');

      expect(result).toContain('config');
    });
  });

  describe('createConfigFile', () => {
    it('should write default config file', () => {
      ConfigLoader.createConfigFile('/project/.generatorrc.json');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/project/.generatorrc.json',
        expect.any(String),
        'utf8'
      );
    });

    it('should write custom config', () => {
      const customConfig = { verbose: true };

      ConfigLoader.createConfigFile('/project/.generatorrc.json', customConfig);

      const writtenContent = fs.writeFileSync.mock.calls[0][1];
      expect(JSON.parse(writtenContent)).toEqual(customConfig);
    });
  });

  describe('getDefaults', () => {
    it('should return copy of default config', () => {
      const defaults = ConfigLoader.getDefaults();

      expect(defaults).toEqual(DEFAULT_CONFIG);
      expect(defaults).not.toBe(DEFAULT_CONFIG); // Should be a copy
    });
  });

  describe('CONFIG_FILE_NAMES', () => {
    it('should have expected config file names', () => {
      expect(CONFIG_FILE_NAMES).toContain('.generatorrc.json');
      expect(CONFIG_FILE_NAMES).toContain('.generatorrc');
      expect(CONFIG_FILE_NAMES).toContain('generator.config.json');
      expect(CONFIG_FILE_NAMES).toContain('generator.config.js');
    });
  });
});
