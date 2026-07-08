#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// This script runs the TypeScript model converter
// Usage: node convert-models.js <input-path> [output-path]

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node convert-models.js <input-path> [output-path]');
  console.log('  input-path: Path to .bin file or directory containing .bin files');
  console.log('  output-path: Path for output .glb file or directory (optional)');
  process.exit(1);
}

// Run the TypeScript file using ts-node
const tsNodePath = path.join(__dirname, '../../node_modules/.bin/ts-node');
const modelConverterPath = path.join(__dirname, 'model-converter.ts');

const child = spawn(tsNodePath, ['--esm', modelConverterPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env, NODE_OPTIONS: '--loader ts-node/esm' }
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Failed to start converter:', error);
  process.exit(1);
}); 