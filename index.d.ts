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

  interface SkippedItem {
    item: any;
    reason: string;
  }

  interface GenerateResult {
    skipped: boolean;
    reason?: string;
  }

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

    /** Array of items skipped during generation */
    readonly skippedItems: SkippedItem[];

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
     * @returns Skip info if template was skipped, void otherwise
     */
    generate(model: any): GenerateResult | void;

    /**
     * Gets the generated results.
     */
    readonly result: TemplateResult[];

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
    TargetProperty?: string;
    ModelProperty?: string;
    TargetItemNameProperty?: string;
    ExportPath?: string;
    PrepareExportPathUsingTemplate?: boolean;
    PrepareExportPathUsingReplace?: boolean;
    AppendToExisting?: boolean;
    SplitOn?: string;
    FileNamePattern?: string;
    RemoveFileName?: boolean;
    /** Condition expression for when to generate */
    GenerateIf?: string;
    /** Condition expression for when to skip */
    SkipIf?: string;
    /** Whether this template is enabled */
    Enabled?: boolean;
    /** Description of what this template generates */
    Description?: string;
  }

  /**
   * Template generation settings.
   */
  class TemplateSettings {
    constructor(json: TemplateSettingsJson);

    static DefaultTarget: string;
    static DefaultTargetItem: string;
    static DefaultTargetProperty: string;
    static DefaultModelProperty: string;
    static DefaultTargetItemNameProperty: string;
    static DefaultPrepareExportPathUsingTemplate: boolean;
    static DefaultPrepareExportPathUsingReplace: boolean;

    /** Model property to iterate */
    readonly target: string;

    /** Variable name for current item */
    readonly targetItem: string;

    /** Property name for target in item model */
    readonly targetProperty: string;

    /** Property name for model in item model */
    readonly modelProperty: string;

    /** Property name for item name */
    readonly targetItemNameProperty: string;

    /** Output path template */
    readonly exportPath: string | null;

    /** Use template for export path */
    readonly prepareExportPathUsingTemplate: boolean;

    /** Use replace for export path */
    readonly prepareExportPathUsingReplace: boolean;

    /** Append to existing files */
    readonly appendToExisting: boolean;

    /** Split marker */
    readonly splitOn: string | null;

    /** Filename extraction pattern */
    readonly fileNamePattern: string | null;

    /** Remove filename marker from output */
    readonly removeFileName: boolean;

    /** Condition expression for when to generate */
    readonly generateIf: string | null;

    /** Condition expression for when to skip */
    readonly skipIf: string | null;

    /** Whether this template is enabled */
    readonly enabled: boolean;

    /** Description of what this template generates */
    readonly description: string | null;

    /**
     * Evaluates a condition expression against a context.
     * @param expression - The condition expression
     * @param context - The context object
     * @returns True if condition is met
     */
    static evaluateCondition(expression: string | null, context: object): boolean;

    /**
     * Gets a value from an object using dot-notation path.
     * @param obj - The object to traverse
     * @param path - The dot-notation path
     * @returns The value at the path
     */
    static getValueByPath(obj: object, path: string): any;

    /**
     * Checks if this template should generate based on conditions.
     * @param context - The context containing Model and item
     * @returns True if should generate
     */
    shouldGenerate(context: object): boolean;

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
    // Conditional helpers
    function ifEquals(a: any, b: any, options: Handlebars.HelperOptions): string;
    function ifNotEquals(a: any, b: any, options: Handlebars.HelperOptions): string;
    function compare(
      a: any,
      operator: string,
      b: any,
      options?: Handlebars.HelperOptions
    ): string | boolean;

    // String helpers
    function camelCase(str: string): string;
    function upperCase(str: string): string;
    function lowerCase(str: string): string;
    function isLowerCase(str: string): boolean;
    function replace(str: string, find: string, replacement: string): string;
    function concat(a: any, b: any): string;
    function pluralize(str: string, count?: number): string;
    function singularize(str: string): string;
    function kebabCase(str: string): string;
    function snakeCase(str: string): string;
    function pascalCase(str: string): string;
    function capitalize(str: string): string;
    function truncate(str: string, length: number, suffix?: string): string;
    function pad(
      str: string,
      length: number,
      char?: string,
      direction?: 'left' | 'right' | 'both'
    ): string;
    function trim(str: string): string;
    function repeat(str: string, count: number): string;
    function startsWith(str: string, prefix: string): boolean;
    function endsWith(str: string, suffix: string): boolean;

    // Type helpers
    function isEmpty(value: any): boolean;
    function isNumber(value: any): boolean;
    function isSystemType(type: string): boolean;
    function hasSystemType(property: any): boolean;
    function getType(property: any): string;
    function getSqlType(property: any): string;
    function getSystemType(type: string): string;

    // Collection helpers
    function existsIn<T>(collection: T[], property: string, value: any): boolean;
    function findIn<T>(collection: T[], property: string, value: any): T | undefined;
    function where<T>(collection: T[], filter: string): T[];
    function first<T>(collection: T[], filter?: string): T | null;
    function last<T>(collection: T[]): T | null;
    function any<T>(collection: T[], filter?: string): boolean;
    function orderBy<T>(collection: T[], orderBy: string): T[];
    function contains<T>(collection: T[], value: T): boolean;
    function join(array: any[], separator?: string): string;
    function split(str: string, separator?: string): string[];
    function unique<T>(array: T[], property?: string): T[];
    function groupBy<T>(array: T[], property: string): { [key: string]: T[] };
    function count<T>(array: T[], filter?: string): number;
    function length(value: string | any[]): number;
    function slice<T>(value: T[] | string, start: number, end?: number): T[] | string;
    function reverse<T>(value: T[] | string): T[] | string;

    // Date helpers
    function formatDate(value: Date | string | number, format?: string): string;
    function now(format?: string): string;

    // Utility helpers
    function defaultValue<T>(value: T | null | undefined, defaultVal: T): T;
    function coalesce<T>(...args: (T | null | undefined)[]): T | null;
    function math(
      a: number,
      op: 'add' | 'sub' | 'mul' | 'div' | 'mod' | '+' | '-' | '*' | '/' | '%',
      b: number
    ): number;
    function toJson(value: any, indent?: number): string;
    function env(name: string, defaultValue?: string): string;
    function debug(value: any, label?: string): string;
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
  // ConfigLoader
  // ============================================================================

  /**
   * Configuration options for generator.
   */
  interface GeneratorConfig {
    /** Template directory path */
    templateDirectory?: string;
    /** Output directory path */
    outputDirectory?: string;
    /** Model file path */
    modelPath?: string | null;
    /** Template file extension */
    extension?: string;
    /** Recurse into subdirectories */
    recurse?: boolean;
    /** Enable verbose output */
    verbose?: boolean;
    /** Dry run mode (no file writes) */
    dryRun?: boolean;
    /** Continue on error */
    continueOnError?: boolean;
    /** Watch mode */
    watch?: boolean;
    /** Watch debounce delay in ms */
    watchDebounce?: number;
    /** Custom helpers to register */
    helpers?: { [name: string]: Function };
    /** Custom partials to register */
    partials?: { [name: string]: string };
    /** Plugin names or paths to load */
    plugins?: string[];
    /** Environment variables */
    environment?: { [name: string]: string };
  }

  /**
   * CLI options that can be applied to config.
   */
  interface CliOptions {
    templates?: string;
    model?: string;
    output?: string;
    verbose?: boolean;
    dryRun?: boolean;
    watch?: boolean;
  }

  /**
   * Configuration loader and manager.
   */
  class ConfigLoader {
    constructor(basePath?: string);

    /** Base path for config file search */
    readonly basePath: string;

    /** Loaded configuration */
    readonly config: GeneratorConfig;

    /** Path to loaded config file */
    readonly configPath: string | null;

    /** Whether a config file was loaded */
    readonly isLoaded: boolean;

    /**
     * Finds a configuration file.
     * @param searchParents - Whether to search parent directories
     */
    findConfigFile(searchParents?: boolean): string | null;

    /**
     * Loads configuration from file or uses defaults.
     * @param configPath - Explicit path to config file
     */
    load(configPath?: string | null): GeneratorConfig;

    /**
     * Applies CLI options as overrides.
     */
    applyCliOptions(cliOptions: CliOptions): GeneratorConfig;

    /**
     * Gets a config value by dot-notation path.
     */
    get<T = any>(keyPath: string, defaultValue?: T): T;

    /**
     * Sets a config value by dot-notation path.
     */
    set(keyPath: string, value: any): void;

    /**
     * Resolves a path relative to config file location.
     */
    resolvePath(relativePath: string): string;

    /**
     * Creates a default configuration file.
     */
    static createConfigFile(filePath?: string, config?: GeneratorConfig | null): string;

    /**
     * Gets default configuration.
     */
    static getDefaults(): GeneratorConfig;
  }

  /** Default configuration values */
  const DEFAULT_CONFIG: GeneratorConfig;

  /** Configuration file names to search for */
  const CONFIG_FILE_NAMES: string[];

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
