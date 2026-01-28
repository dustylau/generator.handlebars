const { PluginManager } = require('../PluginManager');
const HandlebarsHelpers = require('../HandlebarsHelpers');

describe('PluginManager', () => {
  let manager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  afterEach(() => {
    manager.clear();
  });

  describe('register', () => {
    it('should register a plugin with name', () => {
      const plugin = { name: 'test-plugin' };
      manager.register(plugin);

      expect(manager.has('test-plugin')).toBe(true);
      expect(manager.count).toBe(1);
    });

    it('should throw if plugin has no name', () => {
      expect(() => manager.register({})).toThrow('Plugin must have a name property');
      expect(() => manager.register(null)).toThrow('Plugin must have a name property');
    });

    it('should throw if plugin is already registered', () => {
      manager.register({ name: 'duplicate' });
      expect(() => manager.register({ name: 'duplicate' })).toThrow(
        'Plugin "duplicate" is already registered'
      );
    });

    it('should register plugin helpers', () => {
      const plugin = {
        name: 'helper-plugin',
        helpers: {
          double: (n) => n * 2,
          triple: (n) => n * 3,
        },
      };
      manager.register(plugin);

      const Handlebars = HandlebarsHelpers.getHandlebars();
      const template = Handlebars.compile('{{double 5}}');
      expect(template({})).toBe('10');
    });

    it('should register plugin partials', () => {
      const plugin = {
        name: 'partial-plugin',
        partials: {
          pluginPartial: '<span>{{content}}</span>',
        },
      };
      manager.register(plugin);

      const Handlebars = HandlebarsHelpers.getHandlebars();
      const template = Handlebars.compile('{{> pluginPartial content="hello"}}');
      expect(template({})).toBe('<span>hello</span>');
    });

    it('should register lifecycle hooks', () => {
      const beforeGenerate = jest.fn();
      const afterGenerate = jest.fn();

      const plugin = {
        name: 'hook-plugin',
        onBeforeGenerate: beforeGenerate,
        onAfterGenerate: afterGenerate,
      };
      manager.register(plugin);

      manager.executeHooksSync('onBeforeGenerate', { data: 'test' });
      expect(beforeGenerate).toHaveBeenCalledWith({ data: 'test' });

      manager.executeHooksSync('onAfterGenerate', { results: [] });
      expect(afterGenerate).toHaveBeenCalledWith({ results: [] });
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin', () => {
      manager.register({ name: 'to-remove' });
      expect(manager.has('to-remove')).toBe(true);

      const result = manager.unregister('to-remove');
      expect(result).toBe(true);
      expect(manager.has('to-remove')).toBe(false);
    });

    it('should return false for non-existent plugin', () => {
      const result = manager.unregister('non-existent');
      expect(result).toBe(false);
    });

    it('should remove hooks when unregistering', () => {
      const hook = jest.fn();
      manager.register({
        name: 'hook-to-remove',
        onBeforeGenerate: hook,
      });

      manager.unregister('hook-to-remove');
      manager.executeHooksSync('onBeforeGenerate');

      expect(hook).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return plugin by name', () => {
      const plugin = { name: 'get-test', version: '1.0.0' };
      manager.register(plugin);

      const retrieved = manager.get('get-test');
      expect(retrieved).toBe(plugin);
      expect(retrieved.version).toBe('1.0.0');
    });

    it('should return undefined for non-existent plugin', () => {
      expect(manager.get('non-existent')).toBeUndefined();
    });
  });

  describe('plugins property', () => {
    it('should return array of plugin names', () => {
      manager.register({ name: 'plugin-a' });
      manager.register({ name: 'plugin-b' });
      manager.register({ name: 'plugin-c' });

      const names = manager.plugins;
      expect(names).toHaveLength(3);
      expect(names).toContain('plugin-a');
      expect(names).toContain('plugin-b');
      expect(names).toContain('plugin-c');
    });
  });

  describe('executeHooks', () => {
    it('should execute async hooks in order', async () => {
      const order = [];

      manager.register({
        name: 'async-1',
        onBeforeGenerate: async () => {
          await new Promise((r) => setTimeout(r, 10));
          order.push(1);
        },
      });

      manager.register({
        name: 'async-2',
        onBeforeGenerate: async () => {
          order.push(2);
        },
      });

      await manager.executeHooks('onBeforeGenerate');
      expect(order).toEqual([1, 2]);
    });
  });

  describe('transform', () => {
    it('should transform data through all registered handlers', () => {
      manager.register({
        name: 'transform-1',
        transformModel: (model) => ({ ...model, extra1: true }),
      });

      manager.register({
        name: 'transform-2',
        transformModel: (model) => ({ ...model, extra2: true }),
      });

      const result = manager.transform('transformModel', { original: true });

      expect(result).toEqual({
        original: true,
        extra1: true,
        extra2: true,
      });
    });

    it('should return original data if no transforms registered', () => {
      const data = { unchanged: true };
      const result = manager.transform('transformModel', data);
      expect(result).toBe(data);
    });
  });

  describe('clear', () => {
    it('should remove all plugins', () => {
      manager.register({ name: 'plugin-1' });
      manager.register({ name: 'plugin-2' });

      manager.clear();

      expect(manager.count).toBe(0);
      expect(manager.plugins).toHaveLength(0);
    });

    it('should clear all hooks', () => {
      const hook = jest.fn();
      manager.register({
        name: 'to-clear',
        onBeforeGenerate: hook,
      });

      manager.clear();
      manager.executeHooksSync('onBeforeGenerate');

      expect(hook).not.toHaveBeenCalled();
    });
  });

  describe('static factory methods', () => {
    it('should create helper plugin', () => {
      const plugin = PluginManager.createHelperPlugin('my-helpers', {
        square: (n) => n * n,
      });

      expect(plugin.name).toBe('my-helpers');
      expect(plugin.helpers.square(4)).toBe(16);
    });

    it('should create partial plugin', () => {
      const plugin = PluginManager.createPartialPlugin('my-partials', {
        footer: '<footer>{{text}}</footer>',
      });

      expect(plugin.name).toBe('my-partials');
      expect(plugin.partials.footer).toBe('<footer>{{text}}</footer>');
    });
  });
});
