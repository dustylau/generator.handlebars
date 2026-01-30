/**
 * GenerationStats - Tracks generation statistics and timing.
 */
class GenerationStats {
  constructor() {
    this.reset();
  }

  /**
   * Resets all statistics.
   */
  reset() {
    this._startTime = null;
    this._endTime = null;
    this._templateStats = new Map();
    this._totalTemplates = 0;
    this._successfulTemplates = 0;
    this._failedTemplates = 0;
    this._totalFiles = 0;
    this._totalBytes = 0;
    this._errors = [];
  }

  /**
   * Starts the generation timer.
   */
  start() {
    this._startTime = Date.now();
  }

  /**
   * Stops the generation timer.
   */
  stop() {
    this._endTime = Date.now();
  }

  /**
   * Records a template generation start.
   * @param {string} templateName - The template name.
   */
  startTemplate(templateName) {
    this._templateStats.set(templateName, {
      name: templateName,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      files: 0,
      bytes: 0,
      success: false,
      error: null,
    });
    this._totalTemplates++;
  }

  /**
   * Records a template generation completion.
   * @param {string} templateName - The template name.
   * @param {number} fileCount - Number of files generated.
   * @param {number} totalBytes - Total bytes generated.
   */
  endTemplate(templateName, fileCount = 0, totalBytes = 0) {
    const stats = this._templateStats.get(templateName);
    if (stats) {
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      stats.files = fileCount;
      stats.bytes = totalBytes;
      stats.success = true;
      this._successfulTemplates++;
      this._totalFiles += fileCount;
      this._totalBytes += totalBytes;
    }
  }

  /**
   * Records a template generation failure.
   * @param {string} templateName - The template name.
   * @param {Error|string} error - The error that occurred.
   */
  failTemplate(templateName, error) {
    const stats = this._templateStats.get(templateName);
    if (stats) {
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      stats.success = false;
      stats.error = error instanceof Error ? error.message : error;
      this._failedTemplates++;
    }
    this._errors.push({
      template: templateName,
      error: error instanceof Error ? error.message : error,
    });
  }

  /**
   * Gets the total duration in milliseconds.
   * @returns {number|null}
   */
  get duration() {
    if (!this._startTime) return null;
    const end = this._endTime || Date.now();
    return end - this._startTime;
  }

  /**
   * Gets the total number of templates processed.
   * @returns {number}
   */
  get totalTemplates() {
    return this._totalTemplates;
  }

  /**
   * Gets the number of successful templates.
   * @returns {number}
   */
  get successfulTemplates() {
    return this._successfulTemplates;
  }

  /**
   * Gets the number of failed templates.
   * @returns {number}
   */
  get failedTemplates() {
    return this._failedTemplates;
  }

  /**
   * Gets the total number of files generated.
   * @returns {number}
   */
  get totalFiles() {
    return this._totalFiles;
  }

  /**
   * Gets the total bytes generated.
   * @returns {number}
   */
  get totalBytes() {
    return this._totalBytes;
  }

  /**
   * Gets all template statistics.
   * @returns {Array}
   */
  get templateStats() {
    return Array.from(this._templateStats.values());
  }

  /**
   * Gets all errors.
   * @returns {Array}
   */
  get errors() {
    return this._errors;
  }

  /**
   * Formats bytes as human-readable string.
   * @param {number} bytes - The byte count.
   * @returns {string}
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  }

  /**
   * Formats duration as human-readable string.
   * @param {number} ms - Duration in milliseconds.
   * @returns {string}
   */
  static formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Returns a summary object.
   * @returns {object}
   */
  toSummary() {
    return {
      duration: this.duration,
      durationFormatted: GenerationStats.formatDuration(this.duration || 0),
      templates: {
        total: this._totalTemplates,
        successful: this._successfulTemplates,
        failed: this._failedTemplates,
      },
      files: this._totalFiles,
      bytes: this._totalBytes,
      bytesFormatted: GenerationStats.formatBytes(this._totalBytes),
      errors: this._errors,
    };
  }

  /**
   * Returns a formatted string summary.
   * @param {boolean} [verbose=false] - Include per-template details.
   * @returns {string}
   */
  toString(verbose = false) {
    const lines = [];

    lines.push('─'.repeat(50));
    lines.push('Generation Summary');
    lines.push('─'.repeat(50));
    lines.push(`Duration:   ${GenerationStats.formatDuration(this.duration || 0)}`);
    lines.push(`Templates:  ${this._successfulTemplates}/${this._totalTemplates} successful`);
    lines.push(`Files:      ${this._totalFiles}`);
    lines.push(`Size:       ${GenerationStats.formatBytes(this._totalBytes)}`);

    if (this._failedTemplates > 0) {
      lines.push(`Errors:     ${this._failedTemplates}`);
    }

    if (verbose && this._templateStats.size > 0) {
      lines.push('');
      lines.push('Template Details:');
      lines.push('─'.repeat(50));

      for (const stats of this._templateStats.values()) {
        const status = stats.success ? '✓' : '✗';
        const duration = GenerationStats.formatDuration(stats.duration || 0);
        lines.push(`  ${status} ${stats.name}`);
        lines.push(
          `    Duration: ${duration}, Files: ${stats.files}, Size: ${GenerationStats.formatBytes(stats.bytes)}`
        );

        if (stats.error) {
          lines.push(`    Error: ${stats.error}`);
        }
      }
    }

    if (this._errors.length > 0 && !verbose) {
      lines.push('');
      lines.push('Errors:');
      for (const err of this._errors) {
        lines.push(`  - ${err.template}: ${err.error}`);
      }
    }

    lines.push('─'.repeat(50));

    return lines.join('\n');
  }

  /**
   * Returns a JSON representation.
   * @returns {object}
   */
  toJSON() {
    return {
      startTime: this._startTime,
      endTime: this._endTime,
      duration: this.duration,
      templates: this.templateStats,
      summary: this.toSummary(),
    };
  }
}

module.exports = { GenerationStats };
