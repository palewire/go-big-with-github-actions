#!/usr/bin/env node

/**
 * capture.js - Playwright-based screenshot capture for tutorials
 *
 * Usage:
 *   node capture.js --url URL --output path.png [options]
 *
 * Options:
 *   --url           URL to capture (required)
 *   --output        Output file path (required)
 *   --width         Viewport width (default: 1280)
 *   --height        Viewport height (default: 800)
 *   --fullpage      Capture full scrollable page
 *   --element       CSS selector to capture specific element
 *   --highlight     CSS selector to highlight with red border
 *   --execute       JavaScript to run before capture
 *   --wait          Milliseconds to wait before capture (default: 500)
 *   --dark          Use dark color scheme
 *   --format        Output format: png or jpeg (default: png)
 *   --quality       JPEG quality 0-100 (default: 90)
 *   --deviceScale   Device scale factor (default: 2 for retina)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
function parseArgs(args) {
  const options = {
    url: null,
    output: null,
    width: 1280,
    height: 800,
    fullpage: false,
    element: null,
    highlight: null,
    execute: null,
    wait: 500,
    dark: false,
    format: 'png',
    quality: 90,
    deviceScale: 2,
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
      case '--width':
        options.width = parseInt(args[++i], 10);
        break;
      case '--height':
        options.height = parseInt(args[++i], 10);
        break;
      case '--fullpage':
        options.fullpage = true;
        break;
      case '--element':
        options.element = args[++i];
        break;
      case '--highlight':
        options.highlight = args[++i];
        break;
      case '--execute':
        options.execute = args[++i];
        break;
      case '--wait':
        options.wait = parseInt(args[++i], 10);
        break;
      case '--dark':
        options.dark = true;
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--quality':
        options.quality = parseInt(args[++i], 10);
        break;
      case '--deviceScale':
        options.deviceScale = parseFloat(args[++i]);
        break;
    }
  }

  return options;
}

async function captureScreenshot(options) {
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

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Create context with viewport settings
    const context = await browser.newContext({
      viewport: {
        width: options.width,
        height: options.height,
      },
      deviceScaleFactor: options.deviceScale,
      colorScheme: options.dark ? 'dark' : 'light',
    });

    const page = await context.newPage();

    // Navigate to URL
    console.log(`Navigating to: ${options.url}`);
    await page.goto(options.url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Execute custom JavaScript if provided
    if (options.execute) {
      console.log('Executing custom script...');
      await page.evaluate(options.execute);
    }

    // Wait specified time
    if (options.wait > 0) {
      console.log(`Waiting ${options.wait}ms...`);
      await page.waitForTimeout(options.wait);
    }

    // Add highlight styling if specified
    if (options.highlight) {
      console.log(`Highlighting element: ${options.highlight}`);
      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.style.outline = '3px solid #FF0000';
          element.style.outlineOffset = '2px';
          element.style.borderRadius = '4px';
        } else {
          console.warn(`Element not found: ${selector}`);
        }
      }, options.highlight);
      // Small delay for style to apply
      await page.waitForTimeout(100);
    }

    // Prepare screenshot options
    const screenshotOptions = {
      path: options.output,
      type: options.format,
      fullPage: options.fullpage,
    };

    if (options.format === 'jpeg') {
      screenshotOptions.quality = options.quality;
    }

    // Take screenshot
    if (options.element) {
      // Screenshot specific element
      console.log(`Capturing element: ${options.element}`);
      const element = await page.$(options.element);
      if (element) {
        await element.screenshot(screenshotOptions);
      } else {
        console.error(`Element not found: ${options.element}`);
        process.exit(1);
      }
    } else {
      // Screenshot full viewport or page
      console.log('Capturing screenshot...');
      await page.screenshot(screenshotOptions);
    }

    console.log(`Screenshot saved: ${options.output}`);
  } finally {
    await browser.close();
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
Tutorial Screenshot Capture Tool

Usage:
  node capture.js --url URL --output path.png [options]

Options:
  --url           URL to capture (required)
  --output        Output file path (required)
  --width         Viewport width (default: 1280)
  --height        Viewport height (default: 800)
  --fullpage      Capture full scrollable page
  --element       CSS selector to capture specific element only
  --highlight     CSS selector to highlight with red border
  --execute       JavaScript to run before capture
  --wait          Milliseconds to wait before capture (default: 500)
  --dark          Use dark color scheme preference
  --format        Output format: png or jpeg (default: png)
  --quality       JPEG quality 0-100 (default: 90)
  --deviceScale   Device scale factor for retina (default: 2)

Examples:
  # Basic screenshot
  node capture.js --url http://localhost:5173 --output screenshot.png

  # Full page with dark mode
  node capture.js --url http://localhost:5173 --fullpage --dark --output full.png

  # Highlight a button
  node capture.js --url http://localhost:5173 --highlight ".submit-btn" --output highlighted.png

  # Capture specific element
  node capture.js --url http://localhost:5173 --element ".chart" --output chart.png

  # Execute script before capture
  node capture.js --url http://localhost:5173 --execute "document.querySelector('button').click()" --wait 1000 --output after-click.png
`);
  process.exit(0);
}

const options = parseArgs(args);
captureScreenshot(options).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
