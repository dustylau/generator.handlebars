const { GenerationStats } = require('../GenerationStats');

describe('GenerationStats', () => {
  let stats;

  beforeEach(() => {
    stats = new GenerationStats();
  });

  describe('constructor', () => {
    it('should initialize with zero values', () => {
      expect(stats.totalTemplates).toBe(0);
      expect(stats.successfulTemplates).toBe(0);
      expect(stats.failedTemplates).toBe(0);
      expect(stats.totalFiles).toBe(0);
      expect(stats.totalBytes).toBe(0);
      expect(stats.errors).toEqual([]);
    });
  });

  describe('timing', () => {
    it('should track start and stop times', () => {
      stats.start();
      expect(stats.duration).toBeGreaterThanOrEqual(0);

      // Wait a bit
      const waitMs = 10;
      const startTime = Date.now();
      while (Date.now() - startTime < waitMs) {
        // busy wait
      }

      stats.stop();
      expect(stats.duration).toBeGreaterThanOrEqual(waitMs - 5); // Allow some variance
    });

    it('should return null duration before start', () => {
      expect(stats.duration).toBe(null);
    });
  });

  describe('template tracking', () => {
    it('should track template start', () => {
      stats.startTemplate('test-template');
      expect(stats.totalTemplates).toBe(1);
      expect(stats.templateStats).toHaveLength(1);
      expect(stats.templateStats[0].name).toBe('test-template');
    });

    it('should track template success', () => {
      stats.startTemplate('test-template');
      stats.endTemplate('test-template', 5, 1024);

      expect(stats.successfulTemplates).toBe(1);
      expect(stats.totalFiles).toBe(5);
      expect(stats.totalBytes).toBe(1024);

      const templateStat = stats.templateStats[0];
      expect(templateStat.success).toBe(true);
      expect(templateStat.files).toBe(5);
      expect(templateStat.bytes).toBe(1024);
    });

    it('should track template failure', () => {
      stats.startTemplate('test-template');
      stats.failTemplate('test-template', new Error('Test error'));

      expect(stats.failedTemplates).toBe(1);
      expect(stats.errors).toHaveLength(1);
      expect(stats.errors[0].error).toBe('Test error');

      const templateStat = stats.templateStats[0];
      expect(templateStat.success).toBe(false);
      expect(templateStat.error).toBe('Test error');
    });

    it('should handle string errors', () => {
      stats.startTemplate('test-template');
      stats.failTemplate('test-template', 'String error');

      expect(stats.errors[0].error).toBe('String error');
    });
  });

  describe('reset', () => {
    it('should reset all values', () => {
      stats.start();
      stats.startTemplate('test');
      stats.endTemplate('test', 1, 100);
      stats.stop();

      stats.reset();

      expect(stats.totalTemplates).toBe(0);
      expect(stats.successfulTemplates).toBe(0);
      expect(stats.totalFiles).toBe(0);
      expect(stats.duration).toBe(null);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(GenerationStats.formatBytes(0)).toBe('0 B');
      expect(GenerationStats.formatBytes(500)).toBe('500.00 B');
      expect(GenerationStats.formatBytes(1024)).toBe('1.00 KB');
      expect(GenerationStats.formatBytes(1536)).toBe('1.50 KB');
      expect(GenerationStats.formatBytes(1048576)).toBe('1.00 MB');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(GenerationStats.formatDuration(500)).toBe('500ms');
      expect(GenerationStats.formatDuration(1500)).toBe('1.50s');
      expect(GenerationStats.formatDuration(65000)).toBe('1m 5.00s');
    });
  });

  describe('toSummary', () => {
    it('should return summary object', () => {
      stats.start();
      stats.startTemplate('test');
      stats.endTemplate('test', 2, 512);
      stats.stop();

      const summary = stats.toSummary();

      expect(summary.templates.total).toBe(1);
      expect(summary.templates.successful).toBe(1);
      expect(summary.files).toBe(2);
      expect(summary.bytes).toBe(512);
      expect(summary.durationFormatted).toBeDefined();
      expect(summary.bytesFormatted).toBe('512.00 B');
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      stats.start();
      stats.startTemplate('test');
      stats.endTemplate('test', 2, 512);
      stats.stop();

      const output = stats.toString();

      expect(output).toContain('Generation Summary');
      expect(output).toContain('Templates:');
      expect(output).toContain('Files:');
      expect(output).toContain('Size:');
    });

    it('should include verbose details', () => {
      stats.start();
      stats.startTemplate('test');
      stats.endTemplate('test', 2, 512);
      stats.stop();

      const output = stats.toString(true);

      expect(output).toContain('Template Details');
      expect(output).toContain('test');
    });

    it('should show errors', () => {
      stats.start();
      stats.startTemplate('failing');
      stats.failTemplate('failing', 'Something went wrong');
      stats.stop();

      const output = stats.toString();

      expect(output).toContain('Errors');
      expect(output).toContain('Something went wrong');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      stats.start();
      stats.startTemplate('test');
      stats.endTemplate('test', 1, 100);
      stats.stop();

      const json = stats.toJSON();

      expect(json.startTime).toBeDefined();
      expect(json.endTime).toBeDefined();
      expect(json.duration).toBeGreaterThanOrEqual(0);
      expect(json.templates).toHaveLength(1);
      expect(json.summary).toBeDefined();
    });
  });

  describe('multiple templates', () => {
    it('should aggregate stats from multiple templates', () => {
      stats.start();

      stats.startTemplate('template1');
      stats.endTemplate('template1', 3, 1000);

      stats.startTemplate('template2');
      stats.endTemplate('template2', 2, 500);

      stats.startTemplate('template3');
      stats.failTemplate('template3', 'Error');

      stats.stop();

      expect(stats.totalTemplates).toBe(3);
      expect(stats.successfulTemplates).toBe(2);
      expect(stats.failedTemplates).toBe(1);
      expect(stats.totalFiles).toBe(5);
      expect(stats.totalBytes).toBe(1500);
      expect(stats.errors).toHaveLength(1);
    });
  });
});
