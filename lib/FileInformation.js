const fs = require('fs');
const fsPromises = require('fs').promises;

/**
 * Represents file information with path details and content loading.
 */
class FileInformation {
  constructor(filePath, content) {
    this._filePath = filePath;
    this._fullName = this._filePath.split(/\/|\\/).pop();
    this._directory = this._filePath.replace(this._fullName, '');
    this._extension = this._fullName.split('.').pop();
    this._name = this._fullName.replace('.' + this._extension, '');
    this._content = content || null;
  }

  get filePath() {
    return this._filePath;
  }

  set filePath(value) {
    this._filePath = value;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }

  get fullName() {
    return this._fullName;
  }

  set fullName(value) {
    this._fullName = value;
  }

  get directory() {
    return this._directory;
  }

  set directory(value) {
    this._directory = value;
  }

  get extension() {
    return this._extension;
  }

  set extension(value) {
    this._extension = value;
  }

  get content() {
    return this._content;
  }

  set content(value) {
    this._content = value;
  }

  /**
   * Loads file content synchronously.
   * @param {Function} [callback] - Optional callback(file, content).
   */
  load(callback) {
    this._content = fs.readFileSync(this._filePath, { encoding: 'utf8' });
    if (callback) {
      callback(this, this.content);
    }
  }

  /**
   * Loads file content asynchronously.
   * @returns {Promise<string>} The file content.
   */
  async loadAsync() {
    this._content = await fsPromises.readFile(this._filePath, {
      encoding: 'utf8',
    });
    return this._content;
  }
}

exports.FileInformation = FileInformation;
