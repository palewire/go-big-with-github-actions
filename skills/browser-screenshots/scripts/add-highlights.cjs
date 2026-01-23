#!/usr/bin/env node

/**
 * add-highlights.js - Add red highlight boxes to screenshots
 *
 * Usage:
 *   node add-highlights.js --input image.png --output highlighted.png --boxes "x,y,w,h" [--boxes "x,y,w,h" ...]
 *
 * This script takes an existing screenshot and draws red boxes around specified areas.
 * Coordinates are in pixels: x (left), y (top), width, height.
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// Parse command line arguments
function parseArgs(args) {
  const options = {
    input: null,
    output: null,
    boxes: [],
    color: '#FF0000',
    lineWidth: 3,
    padding: 2,
    cornerRadius: 4,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--input':
        options.input = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--boxes':
        options.boxes.push(args[++i]);
        break;
      case '--color':
        options.color = args[++i];
        break;
      case '--lineWidth':
        options.lineWidth = parseInt(args[++i], 10);
        break;
      case '--padding':
        options.padding = parseInt(args[++i], 10);
        break;
      case '--cornerRadius':
        options.cornerRadius = parseInt(args[++i], 10);
        break;
    }
  }

  return options;
}

function parseBox(boxString) {
  const parts = boxString.split(',').map(p => parseInt(p.trim(), 10));
  if (parts.length !== 4) {
    throw new Error(`Invalid box format: ${boxString}. Expected: x,y,width,height`);
  }
  return {
    x: parts[0],
    y: parts[1],
    width: parts[2],
    height: parts[3],
  };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function addHighlights(options) {
  // Validate required options
  if (!options.input) {
    console.error('Error: --input is required');
    process.exit(1);
  }
  if (!options.output) {
    console.error('Error: --output is required');
    process.exit(1);
  }
  if (options.boxes.length === 0) {
    console.error('Error: At least one --boxes specification is required');
    process.exit(1);
  }

  // Check input file exists
  if (!fs.existsSync(options.input)) {
    console.error(`Error: Input file not found: ${options.input}`);
    process.exit(1);
  }

  console.log(`Loading image: ${options.input}`);
  const image = await loadImage(options.input);

  // Create canvas with same dimensions as image
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Draw original image
  ctx.drawImage(image, 0, 0);

  // Parse and draw boxes
  const boxes = options.boxes.map(parseBox);
  console.log(`Drawing ${boxes.length} highlight box(es)...`);

  ctx.strokeStyle = options.color;
  ctx.lineWidth = options.lineWidth;

  boxes.forEach((box, index) => {
    console.log(`  Box ${index + 1}: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);

    // Apply padding
    const x = box.x - options.padding;
    const y = box.y - options.padding;
    const width = box.width + (options.padding * 2);
    const height = box.height + (options.padding * 2);

    // Draw rounded rectangle
    drawRoundedRect(ctx, x, y, width, height, options.cornerRadius);
    ctx.stroke();
  });

  // Save output
  console.log(`Saving to: ${options.output}`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(options.output, buffer);

  console.log('✓ Done!');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
Screenshot Highlight Tool

Usage:
  node add-highlights.js --input image.png --output highlighted.png --boxes "x,y,w,h" [options]

Required Options:
  --input         Input image file path
  --output        Output image file path
  --boxes         Box coordinates as "x,y,width,height" (can be specified multiple times)

Optional:
  --color         Highlight color (default: #FF0000 red)
  --lineWidth     Line width in pixels (default: 3)
  --padding       Extra padding around boxes (default: 2)
  --cornerRadius  Corner radius for rounded boxes (default: 4)

Examples:
  # Highlight one area
  node add-highlights.js \\
    --input screenshot.png \\
    --output highlighted.png \\
    --boxes "100,200,400,300"

  # Highlight multiple areas
  node add-highlights.js \\
    --input screenshot.png \\
    --output highlighted.png \\
    --boxes "100,200,400,300" \\
    --boxes "600,150,350,200"

  # Custom styling
  node add-highlights.js \\
    --input screenshot.png \\
    --output highlighted.png \\
    --boxes "100,200,400,300" \\
    --color "#00FF00" \\
    --lineWidth 5 \\
    --padding 5

Tips:
  - Use browser dev tools to find coordinates: right-click element, Inspect, check dimensions
  - Coordinates are from top-left corner of image (0,0)
  - Multiple --boxes can be added to highlight several areas
`);
  process.exit(0);
}

const options = parseArgs(args);
addHighlights(options).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
