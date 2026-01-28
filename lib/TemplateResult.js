const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { FileHelper } = require('./FileHelper');

/**
 * Represents the result of a template generation, holding content and file path.
 */
class TemplateResult {
  /**
   * Creates a new TemplateResult.
   * @param {string} filePath - The output file path.
   * @param {string} content - The generated content.
   * @param {boolean} appendToExisting - Whether to append to existing files.
   */
  constructor(filePath, content, appendToExisting) {
    this._filePath = filePath;
    this._directoryPath = path.dirname(this._filePath);
    this._content = content;
    this._appendToExisting = appendToExisting;
  }

  get filePath() {
    return this._filePath;
  }

  get directoryPath() {
    return this._directoryPath;
  }

  get content() {
    return this._content;
  }

  get appendToExisting() {
    return this._appendToExisting;
  }

  /**
   * Writes the generated content to the file system synchronously.
   */
  write() {
    FileHelper.ensureDirectoryExists(this._directoryPath);

    if (this._appendToExisting && fs.existsSync(this._filePath)) {
      fs.appendFileSync(this._filePath, this._content);
      return;
    }

    console.log(`Writing File: ${this._filePath}...`);
    fs.writeFileSync(this._filePath, this._content);
  }

  /**
   * Writes the generated content to the file system asynchronously.
   * @returns {Promise<void>}
   */
  async writeAsync() {
    await FileHelper.ensureDirectoryExistsAsync(this._directoryPath);

    if (this._appendToExisting && (await FileHelper.exists(this._filePath))) {
      await fsPromises.appendFile(this._filePath, this._content);
      return;
    }

    console.log(`Writing File: ${this._filePath}...`);
    await fsPromises.writeFile(this._filePath, this._content);
  }

  /**
   * Returns the result as a preview object (for dry-run mode).
   * @returns {{filePath: string, content: string, appendToExisting: boolean}}
   */
  toPreview() {
    return {
      filePath: this._filePath,
      content: this._content,
      appendToExisting: this._appendToExisting,
    };
  }
}

exports.TemplateResult = TemplateResult;
