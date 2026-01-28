// Type definitions for generator.handlebars
// Project: generator.handlebars
// Definitions by: generator.handlebars contributors

import * as Handlebars from 'handlebars';

export = GeneratorHandlebars;
export as namespace GeneratorHandlebars;

declare namespace GeneratorHandlebars {
  // ============================================================================
  // Template
  // ============================================================================

  /**
   * Represents a Handlebars template with settings and generation capabilities.
   */
  class Template {
    constructor(path: string, name?: string);

    /** Template name (without extension) */
    readonly name: string;

    /** Full path to the template file */
    readonly path: string;

    /** Whether the template is loaded */
    readonly isLoaded: boolean;

    /** Whether the template has been generated */
    readonly isGenerated: boolean;

    /** Array of errors encountered during processing */
    errors: string[];

    /** Template settings */
    readonly settings: TemplateSettings;

    /**
     * Validates the template.
     * @returns True if valid, false otherwise
     */
    validate(): boolean;

    /**
     * Generates output from the template using the provided model.
     * @param model - The data model
     * @returns Array of generated results
     */
    generate(model: any): TemplateResult[];

    /**
     * Writes generated results to files.
     * @param results - Results to write
     */
    write(results?: TemplateResult[]): void;

    /**
     * Writes generated results to files asynchronously.
     * @param results - Results to write
     */
    writeAsync(results?: TemplateResult[]): Promise<void>;

    /**
     * Returns preview of generated output without writing.
     * @param model - The data model
     * @returns Array of preview objects
     */
    preview(model: any): PreviewResult[];
  }

  // ============================================================================
  // TemplateLoader
  // ============================================================================

  interface GenerateOptions {
    /** Whether to write files (default: true) */
    write?: boolean;
    /** Continue processing other templates on error */
    continueOnError?: boolean;
  }

  /**
   * Loads and manages templates from a directory.
   */
  class TemplateLoader {
    constructor(path: string);

    /** Loaded templates */
    readonly templates: Template[];

    /** Loaded partial names */
    readonly partials: string[];

    /** Errors accumulated during processing */
    errors: string[];

    /**
     * Loads all templates from the directory.
     * @param callback - Optional callback after loading
     */
    load(callback?: (templates: Template[]) => void): void;

    /**
     * Generates all loaded templates.
     * @param model - The data model
     * @param options - Generation options
     */
    generate(model: any, options?: GenerateOptions | ((loader: TemplateLoader) => void)): void;

    /**
     * Generates all templates asynchronously.
     * @param model - The data model
     * @param options - Generation options
     */
    generateAsync(model: any, options?: GenerateOptions): Promise<TemplateResult[][]>;

    /**
     * Loads and generates in one call.
     * @param model - The data model
     * @param callback - Optional callback after generation
     */
    loadAndGenerate(model: any, callback?: (loader: TemplateLoader) => void): void;

    /**
     * Loads and generates asynchronously.
     * @param model - The data model
     * @param options - Generation options
     */
    loadAndGenerateAsync(model: any, options?: GenerateOptions): Promise<TemplateResult[][]>;

    /**
     * Validates all loaded templates.
     * @returns True if all templates are valid
     */
    validateAll(): boolean;

    /**
     * Returns preview of all templates without writing.
     * @param model - The data model
     */
    preview(model: any): PreviewResult[];

    /**
     * Static method to load and generate.
     */
    static loadAndGenerateAsync(
      path: string,
      model: any,
      options?: GenerateOptions
    ): Promise<TemplateResult[][]>;
  }

  // ============================================================================
  // TemplateResult
  // ============================================================================

  interface PreviewResult {
    filePath: string;
    content: string;
  }

  /**
   * Represents a generated template result.
   */
  class TemplateResult {
    constructor(fileName: string, filePath: string, content: string, append: boolean);

    /** Output file name */
    readonly fileName: string;

    /** Output file path */
    readonly filePath: string;

    /** Generated content */
    readonly content: string;

    /** Whether to append to existing file */
    readonly append: boolean;

    /**
     * Writes the result to file.
     */
    write(): void;

    /**
     * Writes the result to file asynchronously.
     */
    writeAsync(): Promise<void>;

    /**
     * Returns preview object.
     */
    preview(): PreviewResult;
  }

  // ============================================================================
  // TemplateSettings
  // ============================================================================

  interface TemplateSettingsJson {
    Target?: string;
    TargetItem?: string;
    ExportPath?: string;
    AppendToExisting?: boolean;
    SplitOn?: string;
    FileNamePattern?: string;
    RemoveFileName?: boolean;
  }

  /**
   * Template generation settings.
   */
  class TemplateSettings {
    constructor(json: TemplateSettingsJson);

    /** Model property to iterate */
    target: string;

    /** Variable name for current item */
    targetItem: string;

    /** Output path template */
    exportPath: string;

    /** Append to existing files */
    appendToExisting: boolean;

    /** Split marker */
    splitOn: string;

    /** Filename extraction pattern */
    fileNamePattern: string;

    /** Remove filename marker from output */
    removeFileName: boolean;

    /**
     * Loads settings from file.
     */
    static load(filePath: string): TemplateSettings;
  }

  // ============================================================================
  // TemplateBuilder
  // ============================================================================

  /**
   * Builds templates from multiple source files.
   */
  class TemplateBuilder {
    /**
     * Creates a template from source files.
     * @param sources - Source file paths
     * @param outputPath - Output template path
     * @param replacements - Text replacements to apply
     */
    static build(sources: string[], outputPath: string, replacements?: Replacements): void;
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  /**
   * Collection of helper functions.
   */
  namespace Helpers {
    // String helpers
    function camelCase(str: string): string;
    function upperCase(str: string): string;
    function lowerCase(str: string): string;
    function isLowerCase(str: string): boolean;
    function replace(str: string, find: string, replacement: string): string;
    function concat(a: any, b: any): string;

    // Conditional helpers (for Handlebars context)
    function ifEquals(a: any, b: any, options: Handlebars.HelperOptions): string;
    function ifNotEquals(a: any, b: any, options: Handlebars.HelperOptions): string;

    // Collection helpers
    function existsIn<T>(collection: T[], property: string, value: any): boolean;
    function findIn<T>(collection: T[], property: string, value: any): T | undefined;
    function where<T>(collection: T[], filter: string): T[];
    function first<T>(collection: T[], filter: string): T | null;
    function any<T>(collection: T[], filter: string): boolean;
    function orderBy<T>(collection: T[], orderBy: string): T[];
    function contains<T>(collection: T[], value: T): boolean;

    // Type helpers
    function isEmpty(value: any): boolean;
    function isNumber(value: any): boolean;
    function isSystemType(type: string): boolean;
    function hasSystemType(property: any): boolean;
    function getType(property: any): string;
    function getSqlType(property: any): string;
    function getSystemType(type: string): string;
  }

  // ============================================================================
  // HandlebarsHelpers
  // ============================================================================

  /**
   * Handlebars helper registration and partial management.
   */
  namespace HandlebarsHelpers {
    /**
     * Registers a custom helper.
     */
    function registerHelper(name: string, fn: Handlebars.HelperDelegate): void;

    /**
     * Registers a partial template.
     */
    function registerPartial(name: string, template: string): void;

    /**
     * Registers a partial from a file.
     */
    function registerPartialFromFile(name: string, filePath: string): void;

    /**
     * Loads all partials from a directory.
     * @returns Array of registered partial names
     */
    function loadPartialsFromDirectory(directory: string): string[];

    /**
     * Unregisters a partial.
     */
    function unregisterPartial(name: string): void;

    /**
     * Gets all registered partials.
     */
    function getPartials(): { [name: string]: Handlebars.Template };

    /**
     * Gets the Handlebars instance.
     */
    function getHandlebars(): typeof Handlebars;

    /** Reference to Helpers module */
    const Helpers: typeof GeneratorHandlebars.Helpers;
  }

  // ============================================================================
  // PluginManager
  // ============================================================================

  /**
   * Plugin definition.
   */
  interface Plugin {
    /** Plugin name */
    name: string;

    /** Plugin version */
    version?: string;

    /** Custom Handlebars helpers */
    helpers?: { [name: string]: Handlebars.HelperDelegate };

    /** Custom partials */
    partials?: { [name: string]: string };

    /** Hook called before generation */
    onBeforeGenerate?: (...args: any[]) => void | Promise<void>;

    /** Hook called after generation */
    onAfterGenerate?: (...args: any[]) => void | Promise<void>;

    /** Hook called before writing files */
    onBeforeWrite?: (...args: any[]) => void | Promise<void>;

    /** Hook called after writing files */
    onAfterWrite?: (...args: any[]) => void | Promise<void>;

    /** Transform model before processing */
    transformModel?: (model: any) => any;

    /** Transform result before writing */
    transformResult?: (result: any) => any;
  }

  /**
   * Manages plugins for the generator.
   */
  class PluginManager {
    /** Registered plugin names */
    readonly plugins: string[];

    /** Number of registered plugins */
    readonly count: number;

    /**
     * Registers a plugin.
     */
    register(plugin: Plugin): void;

    /**
     * Unregisters a plugin.
     */
    unregister(name: string): boolean;

    /**
     * Checks if a plugin is registered.
     */
    has(name: string): boolean;

    /**
     * Gets a plugin by name.
     */
    get(name: string): Plugin | undefined;

    /**
     * Executes hooks asynchronously.
     */
    executeHooks(hookName: string, ...args: any[]): Promise<void>;

    /**
     * Executes hooks synchronously.
     */
    executeHooksSync(hookName: string, ...args: any[]): void;

    /**
     * Transforms data through registered transformers.
     */
    transform(hookName: string, data: any): any;

    /**
     * Clears all registered plugins.
     */
    clear(): void;

    /**
     * Creates a helper plugin.
     */
    static createHelperPlugin(
      name: string,
      helpers: { [name: string]: Handlebars.HelperDelegate }
    ): Plugin;

    /**
     * Creates a partial plugin.
     */
    static createPartialPlugin(name: string, partials: { [name: string]: string }): Plugin;
  }

  /** Singleton plugin manager instance */
  const pluginManager: PluginManager;

  // ============================================================================
  // File Utilities
  // ============================================================================

  /**
   * File system helper utilities.
   */
  namespace FileHelper {
    function getFiles(path: string, recursive?: boolean): Promise<string[]>;
    function getFilesSync(path: string, recursive?: boolean): string[];
    function getFileInformation(path: string, recursive?: boolean): Promise<FileInformation[]>;
    function getFileInformationSync(path: string, recursive?: boolean): FileInformation[];
    function exists(path: string): Promise<boolean>;
    function existsSync(path: string): boolean;
    function readFile(path: string): Promise<string>;
    function readFileSync(path: string): string;
    function writeFile(path: string, content: string): Promise<void>;
    function writeFileSync(path: string, content: string): void;
    function normalizePath(path: string): string;
  }

  /**
   * File information container.
   */
  class FileInformation {
    readonly filePath: string;
    readonly fullName: string;
    readonly name: string;
    readonly extension: string;
    readonly directory: string;
  }

  /**
   * Regular expression helper utilities.
   */
  namespace RegexHelper {
    function escape(str: string): string;
    function match(str: string, pattern: string): RegExpMatchArray | null;
    function matchAll(str: string, pattern: string): RegExpMatchArray[];
  }

  /**
   * Text replacement definition.
   */
  class Replacement {
    constructor(find: string | RegExp, replace: string);
    readonly find: string | RegExp;
    readonly replace: string;
    apply(content: string): string;
  }

  /**
   * Collection of text replacements.
   */
  class Replacements {
    constructor();
    add(find: string | RegExp, replace: string): Replacements;
    apply(content: string): string;
    readonly items: Replacement[];
  }
}
