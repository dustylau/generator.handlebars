#!/usr/bin/env node
/**
 * generator.handlebars CLI
 *
 * A command-line interface for generating files from Handlebars templates.
 *
 * Usage:
 *   npx generator-hbs generate -t ./templates -m ./model.json
 *   npx generator-hbs validate -t ./templates
 *   npx generator-hbs preview -t ./templates -m ./model.json
 *   npx generator-hbs watch -t ./templates -m ./model.json
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { TemplateLoader } = require('./lib/TemplateLoader');

const packageJson = require('./package.json');

/**
 * Load model from file path
 * @param {string} modelPath - Path to model JSON file
 * @returns {object} Parsed model object
 */
function loadModel(modelPath) {
  const absolutePath = path.resolve(modelPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: Model file not found: ${absolutePath}`);
    process.exit(1);
  }
  try {
    const content = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error parsing model file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Validate template directory exists
 * @param {string} templateDir - Path to templates directory
 * @returns {string} Resolved absolute path
 */
function validateTemplateDir(templateDir) {
  const absolutePath = path.resolve(templateDir);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: Template directory not found: ${absolutePath}`);
    process.exit(1);
  }
  return absolutePath;
}

program
  .name('generator-hbs')
  .description('Handlebars-based code generation CLI')
  .version(packageJson.version);

// Generate command
program
  .command('generate')
  .alias('gen')
  .description('Generate files from templates')
  .requiredOption('-t, --templates <path>', 'Path to templates directory')
  .requiredOption('-m, --model <path>', 'Path to model JSON file')
  .option('-o, --output <path>', 'Output directory (overrides template settings)')
  .option('--dry-run', 'Preview output without writing files')
  .option('--continue-on-error', 'Continue processing if a template fails')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    const templateDir = validateTemplateDir(options.templates);
    const model = loadModel(options.model);

    if (options.verbose) {
      console.log(`Templates: ${templateDir}`);
      console.log(`Model: ${path.resolve(options.model)}`);
      if (options.output) {
        console.log(`Output: ${path.resolve(options.output)}`);
      }
      console.log('');
    }

    const loader = new TemplateLoader(templateDir);
    loader.load();

    if (options.verbose) {
      console.log(`Loaded ${loader.templates.length} template(s)`);
      console.log('');
    }

    if (options.dryRun) {
      const previews = loader.preview(model);
      console.log('Preview (dry-run mode):\n');
      let totalFiles = 0;
      for (const templatePreview of previews) {
        console.log(`📁 Template: ${templatePreview.template}`);
        if (templatePreview.error) {
          console.log(`   ❌ Error: ${templatePreview.error}\n`);
          continue;
        }
        for (const file of templatePreview.files) {
          totalFiles++;
          console.log(`   📄 ${file.filePath}`);
          if (options.verbose && file.content) {
            console.log('   ---');
            const lines = file.content.substring(0, 500).split('\n');
            lines.forEach((line) => console.log(`   ${line}`));
            if (file.content.length > 500) {
              console.log('   ...(truncated)');
            }
            console.log('   ---');
          }
        }
        console.log('');
      }
      console.log(`Total: ${totalFiles} file(s) would be generated`);
    } else {
      try {
        await loader.generateAsync(model, {
          write: true,
          continueOnError: options.continueOnError,
        });

        // Count total files generated across all templates
        let totalFiles = 0;
        for (const template of loader.templates) {
          totalFiles += template.result ? template.result.length : 0;
        }

        console.log(`✅ Generated ${totalFiles} file(s)`);

        if (loader.errors.length > 0) {
          console.log('\n⚠️  Warnings/Errors:');
          loader.errors.forEach((err) => console.log(`   - ${err.message || err}`));
        }
      } catch (error) {
        console.error(`❌ Generation failed: ${error.message}`);
        process.exit(1);
      }
    }
  });

// Validate command
program
  .command('validate')
  .alias('val')
  .description('Validate templates without generating')
  .requiredOption('-t, --templates <path>', 'Path to templates directory')
  .option('-v, --verbose', 'Show detailed validation results')
  .action((options) => {
    const templateDir = validateTemplateDir(options.templates);

    const loader = new TemplateLoader(templateDir);
    loader.load();

    console.log(`Validating ${loader.templates.length} template(s)...\n`);

    let allValid = true;
    for (const template of loader.templates) {
      const isValid = template.validate();
      const status = isValid ? '✅' : '❌';
      console.log(`${status} ${template.name}`);

      if (!isValid && options.verbose) {
        template.errors.forEach((err) => {
          console.log(`   - ${err.message || err}`);
        });
      }

      if (!isValid) {
        allValid = false;
      }
    }

    console.log('');
    if (allValid) {
      console.log('✅ All templates are valid');
    } else {
      console.log('❌ Some templates have validation errors');
      process.exit(1);
    }
  });

// Preview command
program
  .command('preview')
  .description('Preview generated output without writing files')
  .requiredOption('-t, --templates <path>', 'Path to templates directory')
  .requiredOption('-m, --model <path>', 'Path to model JSON file')
  .option('--json', 'Output preview as JSON')
  .option('-v, --verbose', 'Show full content (not truncated)')
  .action((options) => {
    const templateDir = validateTemplateDir(options.templates);
    const model = loadModel(options.model);

    const loader = new TemplateLoader(templateDir);
    loader.load();

    const previews = loader.preview(model);

    if (options.json) {
      console.log(JSON.stringify(previews, null, 2));
    } else {
      console.log(`Preview: ${previews.length} template(s)\n`);
      for (const templatePreview of previews) {
        console.log(`📁 Template: ${templatePreview.template}`);
        if (templatePreview.error) {
          console.log(`   ❌ Error: ${templatePreview.error}\n`);
          continue;
        }
        console.log('─'.repeat(60));
        for (const file of templatePreview.files) {
          console.log(`\n📄 ${file.filePath}`);
          if (options.verbose) {
            console.log(file.content);
          } else if (file.content) {
            console.log(file.content.substring(0, 300));
            if (file.content.length > 300) {
              console.log('...(truncated, use -v for full content)');
            }
          }
        }
        console.log('');
      }
    }
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List templates in a directory')
  .requiredOption('-t, --templates <path>', 'Path to templates directory')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const templateDir = validateTemplateDir(options.templates);

    const loader = new TemplateLoader(templateDir);
    loader.load();

    if (options.json) {
      const templateInfo = {
        templates: loader.templates.map((t) => ({
          name: t.name,
          path: t.file,
          settingsPath: t.settingsFile,
          settings: t.settings,
        })),
        partials: loader.partials,
      };
      console.log(JSON.stringify(templateInfo, null, 2));
    } else {
      console.log(`Templates in ${templateDir}:\n`);
      for (const template of loader.templates) {
        console.log(`  📄 ${template.name}`);
        console.log(`     Target: ${template.settings.target}`);
        console.log(`     Export: ${template.settings.exportPath}`);
        console.log('');
      }
      console.log(`Total: ${loader.templates.length} template(s)`);

      if (loader.partials.length > 0) {
        console.log(`\nPartials:`);
        for (const partial of loader.partials) {
          console.log(`  🧩 ${partial}`);
        }
        console.log(`\nTotal: ${loader.partials.length} partial(s)`);
      }
    }
  });

// Watch command
program
  .command('watch')
  .description('Watch for changes and regenerate automatically')
  .requiredOption('-t, --templates <path>', 'Path to templates directory')
  .requiredOption('-m, --model <path>', 'Path to model JSON file')
  .option('--continue-on-error', 'Continue processing if a template fails')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    const templateDir = validateTemplateDir(options.templates);
    const modelPath = path.resolve(options.model);

    if (!fs.existsSync(modelPath)) {
      console.error(`Error: Model file not found: ${modelPath}`);
      process.exit(1);
    }

    console.log('👀 Watch mode started');
    console.log(`   Templates: ${templateDir}`);
    console.log(`   Model: ${modelPath}`);
    console.log('\nWatching for changes... (Ctrl+C to stop)\n');

    /**
     * Run generation with current model and templates
     */
    async function runGeneration() {
      try {
        // Reload model each time (may have changed)
        const modelContent = fs.readFileSync(modelPath, 'utf8');
        const model = JSON.parse(modelContent);

        const loader = new TemplateLoader(templateDir);
        loader.load();

        await loader.generateAsync(model, {
          write: true,
          continueOnError: options.continueOnError,
        });

        // Count total files generated
        let totalFiles = 0;
        for (const template of loader.templates) {
          totalFiles += template.result ? template.result.length : 0;
        }

        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ✅ Generated ${totalFiles} file(s)`);

        if (loader.errors.length > 0) {
          console.log('   ⚠️  Warnings:');
          loader.errors.forEach((err) => console.log(`      - ${err.message || err}`));
        }
      } catch (error) {
        const timestamp = new Date().toLocaleTimeString();
        console.error(`[${timestamp}] ❌ Generation failed: ${error.message}`);
      }
    }

    // Initial generation
    await runGeneration();

    // Watch for changes
    const watcher = chokidar.watch(
      [
        path.join(templateDir, '**/*.hbs'),
        path.join(templateDir, '**/*.hbs.settings.json'),
        path.join(templateDir, '**/*.hbs.js'),
        modelPath,
      ],
      {
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      }
    );

    let debounceTimer = null;

    watcher.on('all', (event, filePath) => {
      if (options.verbose) {
        console.log(`   📝 ${event}: ${path.relative(process.cwd(), filePath)}`);
      }

      // Debounce to avoid multiple regenerations
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(runGeneration, 200);
    });

    watcher.on('error', (error) => {
      console.error(`Watcher error: ${error.message}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n👋 Watch mode stopped');
      watcher.close();
      process.exit(0);
    });
  });

program.parse();
