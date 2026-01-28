// post-install.js

/**
 * Script to run after npm install
 *
 * Copy selected files to user's directory when installed as a dependency.
 * Skips when running in development mode (INIT_CWD matches package directory).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const filesToCopy = ['generate.js', 'sample-templates'];

// User's local directory (where npm install was run)
const userPath = process.env.INIT_CWD;
const packagePath = __dirname;

// Skip if we're in development mode (installing in the package itself)
if (userPath === packagePath) {
  console.log('Development mode - skipping postinstall copy.');
  process.exit(0);
}

/**
 * Recursively copies a directory.
 * @param {string} src - Source path.
 * @param {string} dest - Destination path.
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      // Only copy if destination doesn't exist (gentle copy)
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${entry.name}`);
      } else {
        console.log(`Skipped (exists): ${entry.name}`);
      }
    }
  }
}

// Copy files to user's directory
for (const file of filesToCopy) {
  const srcPath = path.join(packagePath, file);
  const destPath = path.join(userPath, file);

  if (!fs.existsSync(srcPath)) {
    console.log(`Source not found: ${file}`);
    continue;
  }

  const stat = fs.statSync(srcPath);

  if (stat.isDirectory()) {
    copyDir(srcPath, destPath);
    console.log(`Copied directory: ${file}`);
  } else {
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${file}`);
    } else {
      console.log(`Skipped (exists): ${file}`);
    }
  }
}

console.log('Postinstall completed.');
