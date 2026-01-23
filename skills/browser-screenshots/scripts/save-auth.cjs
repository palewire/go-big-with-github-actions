#!/usr/bin/env node

/**
 * save-auth.js - Save browser authentication state for screenshot capture
 *
 * Usage:
 *   node save-auth.js --url URL --output path.json
 *
 * This script opens a browser window where you can manually log in to a site.
 * After you log in and close the browser, it saves the authentication state
 * (cookies, localStorage, etc.) to a file that can be used with capture.js.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Parse command line arguments
function parseArgs(args) {
  const options = {
    url: null,
    output: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--url':
        options.url = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
    }
  }

  return options;
}

async function saveAuthState(options) {
  // Validate required options
  if (!options.url) {
    console.error('Error: --url is required');
    process.exit(1);
  }
  if (!options.output) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(options.output);
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('\n=== Browser Authentication State Saver ===\n');
  console.log('This will open a browser window where you can log in.');
  console.log('After logging in, press ENTER in this terminal to save the auth state.\n');

  // Launch browser in non-headless mode so user can interact
  const browser = await chromium.launch({
    headless: false,
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to URL
    console.log(`Opening: ${options.url}`);
    await page.goto(options.url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('\nBrowser window opened. Please log in now.');
    console.log('When finished, press ENTER here to save the authentication state...');

    // Wait for user to press Enter
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await new Promise((resolve) => {
      rl.question('', () => {
        rl.close();
        resolve();
      });
    });

    // Save authentication state
    console.log('\nSaving authentication state...');
    await context.storageState({ path: options.output });

    console.log(`\n✓ Authentication state saved to: ${options.output}`);
    console.log('\nYou can now use this with capture.js:');
    console.log(`  node capture.js --url ${options.url} --storageState ${options.output} --output screenshot.png`);
  } finally {
    await browser.close();
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
Browser Authentication State Saver

Usage:
  node save-auth.js --url URL --output path.json

Options:
  --url           URL to navigate to for login (required)
  --output        Path to save authentication state JSON (required)

Examples:
  # Save GitHub authentication
  node save-auth.js --url https://github.com/login --output ~/.playwright/github-auth.json

  # Save local dev server authentication
  node save-auth.js --url http://localhost:3000/login --output auth/local.json

After saving:
  Use the saved state with capture.js using the --storageState option:
  node capture.js --url https://github.com/new --storageState ~/.playwright/github-auth.json --output screenshot.png
`);
  process.exit(0);
}

const options = parseArgs(args);
saveAuthState(options).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
