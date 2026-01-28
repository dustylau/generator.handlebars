const { FileInformation } = require('./FileInformation');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

/**
 * File system helper utilities for template loading and writing.
 */
class FileHelper {
  /**
   * Gets all file paths in a directory synchronously.
   * @param {string} directoryPath - Directory to scan.
   * @param {boolean} recurse - Whether to recurse into subdirectories.
   * @param {object} [options] - Filter options.
   * @param {Array} [options.ignoreList] - Patterns to ignore.
   * @param {Array} [options.includeList] - Patterns to include.
   * @returns {string[]} Array of file paths.
   */
  static getFilesSync(directoryPath, recurse, options) {
    const ignoreList =
      options && options.ignoreList && Array.isArray(options.ignoreList) ? options.ignoreList : [];
    const includeList =
      options && options.includeList && Array.isArray(options.includeList)
        ? options.includeList
        : [];

    directoryPath = FileHelper.normalizePath(directoryPath);

    const files = [];
    const contents = fs.readdirSync(directoryPath, { withFileTypes: true });

    for (const item of contents) {
      if (FileHelper._shouldIgnore(item.name, ignoreList)) {
        continue;
      }

      if (item.isFile() && !FileHelper._shouldInclude(item.name, includeList)) {
        continue;
      }

      if (item.isFile()) {
        files.push(directoryPath + item.name);
      }

      if (item.isDirectory() && recurse) {
        const subdirectoryFiles = FileHelper.getFilesSync(
          directoryPath + item.name + '/',
          recurse,
          options
        );
        files.push(...subdirectoryFiles);
      }
    }
    return files;
  }

  /**
   * Gets all file paths in a directory asynchronously.
   * @param {string} directoryPath - Directory to scan.
   * @param {boolean} recurse - Whether to recurse into subdirectories.
   * @param {object} [options] - Filter options.
   * @returns {Promise<string[]>} Array of file paths.
   */
  static async getFiles(directoryPath, recurse, options) {
    const ignoreList =
      options && options.ignoreList && Array.isArray(options.ignoreList) ? options.ignoreList : [];
    const includeList =
      options && options.includeList && Array.isArray(options.includeList)
        ? options.includeList
        : [];

    directoryPath = FileHelper.normalizePath(directoryPath);

    const files = [];
    const contents = await fsPromises.readdir(directoryPath, {
      withFileTypes: true,
    });

    for (const item of contents) {
      if (FileHelper._shouldIgnore(item.name, ignoreList)) {
        continue;
      }

      if (item.isFile() && !FileHelper._shouldInclude(item.name, includeList)) {
        continue;
      }

      if (item.isFile()) {
        files.push(directoryPath + item.name);
      }

      if (item.isDirectory() && recurse) {
        const subdirectoryFiles = await FileHelper.getFiles(
          directoryPath + item.name + '/',
          recurse,
          options
        );
        files.push(...subdirectoryFiles);
      }
    }
    return files;
  }

  /**
   * Gets file information for all files in a directory synchronously.
   * @param {string} directoryPath - Directory to scan.
   * @param {boolean} recurse - Whether to recurse.
   * @param {object} [options] - Filter options.
   * @returns {FileInformation[]} Array of file information objects.
   */
  static getFileInformationSync(directoryPath, recurse, options) {
    const filePaths = FileHelper.getFilesSync(directoryPath, recurse, options);
    return filePaths.map((filePath) => new FileInformation(filePath));
  }

  /**
   * Gets file information for all files in a directory asynchronously.
   * @param {string} directoryPath - Directory to scan.
   * @param {boolean} recurse - Whether to recurse.
   * @param {object} [options] - Filter options.
   * @returns {Promise<FileInformation[]>} Array of file information objects.
   */
  static async getFileInformation(directoryPath, recurse, options) {
    const filePaths = await FileHelper.getFiles(directoryPath, recurse, options);
    return filePaths.map((filePath) => new FileInformation(filePath));
  }

  /**
   * Loads file contents synchronously.
   * @param {string[]} filePaths - Paths to load.
   * @returns {FileInformation[]} Loaded file information.
   */
  static loadFilesSync(filePaths) {
    const files = filePaths.map((filePath) => new FileInformation(filePath));
    for (const file of files) {
      file.load();
    }
    return files;
  }

  /**
   * Loads file contents asynchronously.
   * @param {string[]} filePaths - Paths to load.
   * @returns {Promise<FileInformation[]>} Loaded file information.
   */
  static async loadFiles(filePaths) {
    const files = filePaths.map((filePath) => new FileInformation(filePath));
    await Promise.all(files.map((file) => file.loadAsync()));
    return files;
  }

  /**
   * Ensures a directory exists, creating it recursively if needed.
   * @param {string} directory - Directory path.
   */
  static ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
      FileHelper.ensureDirectoryExists(path.dirname(directory));
      console.log(`Creating Directory: ${directory}...`);
      fs.mkdirSync(directory);
    }
  }

  /**
   * Ensures a directory exists asynchronously.
   * @param {string} directory - Directory path.
   * @returns {Promise<void>}
   */
  static async ensureDirectoryExistsAsync(directory) {
    try {
      await fsPromises.access(directory);
    } catch {
      await fsPromises.mkdir(directory, { recursive: true });
      console.log(`Creating Directory: ${directory}...`);
    }
  }

  /**
   * Writes content to a file synchronously.
   * @param {string} filePath - File path.
   * @param {string} content - Content to write.
   */
  static writeFile(filePath, content) {
    FileHelper.ensureDirectoryExists(path.dirname(filePath));
    console.log(`Writing File: ${filePath}...`);
    fs.writeFileSync(filePath, content);
  }

  /**
   * Writes content to a file asynchronously.
   * @param {string} filePath - File path.
   * @param {string} content - Content to write.
   * @returns {Promise<void>}
   */
  static async writeFileAsync(filePath, content) {
    await FileHelper.ensureDirectoryExistsAsync(path.dirname(filePath));
    console.log(`Writing File: ${filePath}...`);
    await fsPromises.writeFile(filePath, content);
  }

  /**
   * Reads a file synchronously.
   * @param {string} filePath - File path.
   * @param {string} [encoding='utf8'] - File encoding.
   * @returns {string} File content.
   */
  static readFileSync(filePath, encoding = 'utf8') {
    return fs.readFileSync(filePath, { encoding });
  }

  /**
   * Reads a file asynchronously.
   * @param {string} filePath - File path.
   * @param {string} [encoding='utf8'] - File encoding.
   * @returns {Promise<string>} File content.
   */
  static async readFile(filePath, encoding = 'utf8') {
    return fsPromises.readFile(filePath, { encoding });
  }

  /**
   * Checks if a file exists.
   * @param {string} filePath - File path.
   * @returns {boolean} True if exists.
   */
  static existsSync(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Checks if a file exists asynchronously.
   * @param {string} filePath - File path.
   * @returns {Promise<boolean>} True if exists.
   */
  static async exists(filePath) {
    try {
      await fsPromises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalizes a directory path to end with '/'.
   * @param {string} directoryPath - Path to normalize.
   * @returns {string} Normalized path.
   */
  static normalizePath(directoryPath) {
    const lastChar = directoryPath.substring(directoryPath.length - 1);
    if (lastChar !== '/' && lastChar !== '\\') {
      return directoryPath + '/';
    }
    return directoryPath;
  }

  /**
   * Checks if item should be ignored based on ignore list.
   * @private
   */
  static _shouldIgnore(name, ignoreList) {
    if (!ignoreList || ignoreList.length === 0) return false;
    return ignoreList.some(
      (pattern) => pattern === name || (pattern instanceof RegExp && pattern.test(name))
    );
  }

  /**
   * Checks if item should be included based on include list.
   * @private
   */
  static _shouldInclude(name, includeList) {
    if (!includeList || includeList.length === 0) return true;
    return includeList.some(
      (pattern) => pattern === name || (pattern instanceof RegExp && pattern.test(name))
    );
  }
}

exports.FileHelper = FileHelper;
