const path = require('path');
const Template = require('../Template');
const { TemplateLoader } = require('../TemplateLoader');
const { TemplateResult } = require('../TemplateResult');
const { FileHelper } = require('../FileHelper');

// Test fixtures path
const SAMPLE_TEMPLATES_PATH = path.join(__dirname, '../../sample-templates');

// Sample model matching sample-templates expectations
const sampleModel = {
  Description: 'Test Model',
  Items: [
    {
      Name: 'ItemA',
      Description: 'Item - A',
      Options: [
        { Id: 'A', Description: 'Option A' },
        { Id: 'B', Description: 'Option B' },
      ],
    },
    {
      Name: 'ItemB',
      Description: 'Item - B',
      Options: [
        { Id: 'C', Description: 'Option C' },
        { Id: 'D', Description: 'Option D' },
      ],
    },
  ],
  List: [
    { Id: 'ListItem1', Description: 'List Item - 1' },
    { Id: 'ListItem2', Description: 'List Item - 2' },
    { Id: 'ListItem3', Description: 'List Item - 3' },
  ],
};

describe('Integration Tests', () => {
  describe('Template', () => {
    it('should load a template from sample-templates', () => {
      const template = new Template(SAMPLE_TEMPLATES_PATH, 'sample.hbs');

      expect(template.isLoaded).toBe(true);
      expect(template.name).toBe('sample');
      expect(template.errors).toHaveLength(0);
    });

    it('should validate a valid template', () => {
      const template = new Template(SAMPLE_TEMPLATES_PATH, 'sample.hbs');
      const validation = template.validate();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should generate content from a template', () => {
      const template = new Template(SAMPLE_TEMPLATES_PATH, 'sample.hbs');
      template.generate(sampleModel);

      expect(template.isGenerated).toBe(true);
      expect(template.result).toHaveLength(2); // Two items in Items array
      expect(template.result[0].content).toContain('Item Name: ItemA');
      expect(template.result[1].content).toContain('Item Name: ItemB');
    });

    it('should handle full model template', () => {
      const template = new Template(SAMPLE_TEMPLATES_PATH, 'sample-full-model.hbs');
      template.generate(sampleModel);

      expect(template.isGenerated).toBe(true);
      expect(template.result).toHaveLength(1); // Single output for full model
      expect(template.result[0].content).toContain('Test Model');
    });

    it('should handle split template', () => {
      const template = new Template(SAMPLE_TEMPLATES_PATH, 'sample-full-model-split.hbs');
      template.generate(sampleModel);

      expect(template.isGenerated).toBe(true);
      expect(template.result.length).toBeGreaterThan(1); // Multiple split outputs
    });

    it('should return preview without writing', () => {
      const template = new Template(SAMPLE_TEMPLATES_PATH, 'sample.hbs');
      template.generate(sampleModel);

      const preview = template.getPreview();

      expect(preview).toHaveLength(2);
      expect(preview[0]).toHaveProperty('filePath');
      expect(preview[0]).toHaveProperty('content');
      expect(preview[0]).toHaveProperty('appendToExisting');
    });

    it('should collect errors for invalid template path', () => {
      const template = new Template(SAMPLE_TEMPLATES_PATH, 'nonexistent.hbs');

      expect(template.isLoaded).toBe(false);
      expect(template.errors.length).toBeGreaterThan(0);
    });
  });

  describe('TemplateLoader', () => {
    it('should load all templates from a directory', () => {
      const loader = new TemplateLoader(SAMPLE_TEMPLATES_PATH);
      loader.load();

      expect(loader.templates.length).toBeGreaterThan(0);
      expect(loader.errors).toHaveLength(0);
    });

    it('should validate all loaded templates', () => {
      const loader = new TemplateLoader(SAMPLE_TEMPLATES_PATH);
      loader.load();

      const validation = loader.validateAll();

      expect(validation.valid).toBe(true);
      expect(validation.results.length).toBe(loader.templates.length);
    });

    it('should generate preview without writing files', () => {
      const loader = new TemplateLoader(SAMPLE_TEMPLATES_PATH);
      loader.load();

      const previews = loader.preview(sampleModel);

      expect(previews.length).toBe(loader.templates.length);
      for (const preview of previews) {
        expect(preview).toHaveProperty('template');
        expect(preview).toHaveProperty('files');
        expect(Array.isArray(preview.files)).toBe(true);
      }
    });

    it('should generate without writing when write=false', () => {
      const loader = new TemplateLoader(SAMPLE_TEMPLATES_PATH);
      loader.load();
      loader.generate(sampleModel, null, { write: false });

      // Check that templates were generated
      for (const template of loader.templates) {
        expect(template.isGenerated).toBe(true);
        expect(template.result.length).toBeGreaterThan(0);
      }
    });

    it('should continue on error when continueOnError=true', () => {
      const loader = new TemplateLoader(SAMPLE_TEMPLATES_PATH);
      loader.load();

      // Generate with an invalid model that might cause errors
      // The library should continue processing other templates
      expect(() => {
        loader.generate({}, null, { continueOnError: true, write: false });
      }).not.toThrow();
    });
  });

  describe('TemplateResult', () => {
    it('should create a result with correct properties', () => {
      const result = new TemplateResult('/path/to/file.txt', 'content', false);

      expect(result.filePath).toBe('/path/to/file.txt');
      expect(result.content).toBe('content');
      expect(result.appendToExisting).toBe(false);
      expect(result.directoryPath).toBe('/path/to');
    });

    it('should return preview object', () => {
      const result = new TemplateResult('/path/to/file.txt', 'content', true);
      const preview = result.toPreview();

      expect(preview).toEqual({
        filePath: '/path/to/file.txt',
        content: 'content',
        appendToExisting: true,
      });
    });
  });

  describe('FileHelper', () => {
    it('should get files synchronously', () => {
      const files = FileHelper.getFilesSync(SAMPLE_TEMPLATES_PATH, false);

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should get files asynchronously', async () => {
      const files = await FileHelper.getFiles(SAMPLE_TEMPLATES_PATH, false);

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should get file information', () => {
      const fileInfos = FileHelper.getFileInformationSync(SAMPLE_TEMPLATES_PATH, false);

      expect(fileInfos.length).toBeGreaterThan(0);
      expect(fileInfos[0]).toHaveProperty('filePath');
      expect(fileInfos[0]).toHaveProperty('fullName');
      expect(fileInfos[0]).toHaveProperty('directory');
    });

    it('should check file existence', async () => {
      const exists = await FileHelper.exists(path.join(SAMPLE_TEMPLATES_PATH, 'sample.hbs'));
      const notExists = await FileHelper.exists(
        path.join(SAMPLE_TEMPLATES_PATH, 'nonexistent.xyz')
      );

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it('should normalize paths correctly', () => {
      expect(FileHelper.normalizePath('/path/to/dir')).toBe('/path/to/dir/');
      expect(FileHelper.normalizePath('/path/to/dir/')).toBe('/path/to/dir/');
      expect(FileHelper.normalizePath('C:\\path\\to\\dir')).toBe('C:\\path\\to\\dir/');
    });
  });

  describe('Async Operations', () => {
    it('should generate and write asynchronously', async () => {
      const loader = new TemplateLoader(SAMPLE_TEMPLATES_PATH);
      loader.load();

      // Generate without writing to test async generation path
      await loader.generateAsync(sampleModel, { write: false });

      for (const template of loader.templates) {
        expect(template.isGenerated).toBe(true);
      }
    });

    it('should load and generate asynchronously', async () => {
      const loader = new TemplateLoader(SAMPLE_TEMPLATES_PATH);

      await loader.loadAndGenerateAsync(sampleModel, { write: false });

      expect(loader.templates.length).toBeGreaterThan(0);
      for (const template of loader.templates) {
        expect(template.isGenerated).toBe(true);
      }
    });
  });

  describe('Partials', () => {
    const HandlebarsHelpers = require('../HandlebarsHelpers');

    beforeEach(() => {
      // Clear any previously registered partials for test isolation
      const partials = HandlebarsHelpers.getPartials();
      for (const name of Object.keys(partials)) {
        HandlebarsHelpers.unregisterPartial(name);
      }
    });

    it('should register a partial directly', () => {
      HandlebarsHelpers.registerPartial('testPartial', '<div>{{name}}</div>');

      const partials = HandlebarsHelpers.getPartials();
      expect(partials.testPartial).toBe('<div>{{name}}</div>');
    });

    it('should register a partial from file', () => {
      const partialPath = path.join(SAMPLE_TEMPLATES_PATH, 'header.hbs.partial');
      HandlebarsHelpers.registerPartialFromFile('header', partialPath);

      const partials = HandlebarsHelpers.getPartials();
      expect(partials.header).toBeDefined();
      expect(partials.header).toContain('{{title}}');
    });

    it('should load all partials from directory', () => {
      const registered = HandlebarsHelpers.loadPartialsFromDirectory(SAMPLE_TEMPLATES_PATH);

      expect(registered).toContain('header');
      expect(registered).toContain('itemDetails');
      expect(registered.length).toBe(2);
    });

    it('should return empty array for non-existent directory', () => {
      const registered = HandlebarsHelpers.loadPartialsFromDirectory('/nonexistent/path');
      expect(registered).toEqual([]);
    });

    it('should unregister a partial', () => {
      HandlebarsHelpers.registerPartial('toRemove', 'content');
      expect(HandlebarsHelpers.getPartials().toRemove).toBeDefined();

      HandlebarsHelpers.unregisterPartial('toRemove');
      expect(HandlebarsHelpers.getPartials().toRemove).toBeUndefined();
    });

    it('should use partials in template generation', () => {
      // Register a partial
      HandlebarsHelpers.registerPartial('greeting', 'Hello, {{name}}!');

      // Create a simple template that uses the partial
      const Handlebars = HandlebarsHelpers.getHandlebars();
      const template = Handlebars.compile('{{> greeting}}');
      const result = template({ name: 'World' });

      expect(result).toBe('Hello, World!');
    });

    it('should load partials automatically when TemplateLoader loads', () => {
      const loader = new TemplateLoader(SAMPLE_TEMPLATES_PATH);
      loader.load();

      expect(loader.partials).toContain('header');
      expect(loader.partials).toContain('itemDetails');
    });
  });
});
