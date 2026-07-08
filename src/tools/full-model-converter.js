#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class FullModelConverter {
    constructor() {
        this.htmlPath = path.join(__dirname, 'full-model-converter.html');
    }

    async checkDependencies() {
        try {
            // Check if we can run a simple command
            await this.runCommand('node', ['--version']);
            return true;
        } catch (error) {
            console.error('Node.js is required but not available');
            return false;
        }
    }

    runCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                stdio: 'inherit',
                ...options
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with exit code ${code}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    async openBrowserConverter() {
        console.log('Opening browser-based converter...');
        console.log('Please use the web interface to convert your models.');
        console.log(`HTML file location: ${this.htmlPath}`);
        
        // Try to open the HTML file in the default browser
        const platform = process.platform;
        let command;
        
        switch (platform) {
            case 'darwin':
                command = 'open';
                break;
            case 'win32':
                command = 'start';
                break;
            default:
                command = 'xdg-open';
                break;
        }
        
        try {
            await this.runCommand(command, [this.htmlPath]);
            console.log('Browser opened successfully!');
        } catch (error) {
            console.log('Could not automatically open browser. Please manually open:');
            console.log(`file://${this.htmlPath}`);
        }
    }

    async convertWithPuppeteer(inputPath, outputPath) {
        try {
            // Check if puppeteer is available
            const puppeteer = require('puppeteer');
            
            console.log('Starting headless browser conversion...');
            
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            
            // Load the HTML converter
            await page.goto(`file://${this.htmlPath}`);
            
            // Wait for the page to load
            await page.waitForSelector('#fileInput');
            
            // Upload the file
            const inputElement = await page.$('#fileInput');
            await inputElement.uploadFile(inputPath);
            
            // Click convert button
            await page.click('#convertBtn');
            
            // Wait for conversion to complete
            await page.waitForFunction(() => {
                const status = document.querySelector('#status .status');
                return status && status.textContent.includes('Successfully converted');
            }, { timeout: 30000 });
            
            // Get the status
            const status = await page.$eval('#status .status', el => el.textContent);
            console.log(status);
            
            await browser.close();
            
        } catch (error) {
            if (error.message.includes('Cannot find module')) {
                console.log('Puppeteer not available. Please install it with:');
                console.log('npm install --save-dev puppeteer');
                console.log('Or use the browser-based converter directly.');
                await this.openBrowserConverter();
            } else {
                throw error;
            }
        }
    }

    async convertFile(inputPath, outputPath) {
        try {
            console.log(`Converting ${inputPath} to ${outputPath}...`);
            
            // First try puppeteer method
            try {
                await this.convertWithPuppeteer(inputPath, outputPath);
                return true;
            } catch (error) {
                console.log('Puppeteer conversion failed, falling back to browser method...');
                await this.openBrowserConverter();
                return false;
            }
            
        } catch (error) {
            console.error(`Error converting ${inputPath}:`, error);
            return false;
        }
    }

    async convertAllModels(inputDir, outputDir) {
        try {
            // Ensure output directory exists
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Read all .bin files in the input directory
            const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.bin'));
            
            if (files.length === 0) {
                console.log('No .bin files found in the input directory');
                return;
            }

            console.log(`Found ${files.length} model(s) to convert:`);
            console.log('Using browser-based converter for full geometry export...');
            
            // For now, just open the browser converter
            await this.openBrowserConverter();
            
            console.log('\nInstructions:');
            console.log('1. Select your .bin files in the browser');
            console.log('2. Click "Convert to GLB"');
            console.log('3. The converted files will be downloaded automatically');
            
        } catch (error) {
            console.error('Error during batch conversion:', error);
            throw error;
        }
    }

    async installPuppeteer() {
        console.log('Installing Puppeteer for headless conversion...');
        try {
            await this.runCommand('npm', ['install', '--save-dev', 'puppeteer']);
            console.log('Puppeteer installed successfully!');
            return true;
        } catch (error) {
            console.error('Failed to install Puppeteer:', error);
            return false;
        }
    }
}

// CLI usage
if (require.main === module) {
    const converter = new FullModelConverter();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'install-puppeteer') {
        converter.installPuppeteer()
            .then(() => console.log('Setup complete!'))
            .catch(error => {
                console.error('Setup failed:', error);
                process.exit(1);
            });
        return;
    }
    
    const inputPath = args[0];
    const outputPath = args[1];
    
    if (!inputPath) {
        console.log('Full Model Converter - Full Geometry Export');
        console.log('');
        console.log('Usage:');
        console.log('  node full-model-converter.js <input-path> [output-path]');
        console.log('  node full-model-converter.js install-puppeteer');
        console.log('');
        console.log('Options:');
        console.log('  input-path: Path to .bin file or directory containing .bin files');
        console.log('  output-path: Path for output .glb file or directory (optional)');
        console.log('  install-puppeteer: Install Puppeteer for headless conversion');
        console.log('');
        console.log('Note: This tool uses a browser-based converter for full geometry export.');
        console.log('For headless operation, install Puppeteer first.');
        process.exit(1);
    }
    
    converter.checkDependencies()
        .then(async () => {
            const inputStats = fs.statSync(inputPath);
            
            if (inputStats.isDirectory()) {
                const outputDir = outputPath || path.join(path.dirname(inputPath), 'glb-exports');
                await converter.convertAllModels(inputPath, outputDir);
            } else {
                const outputFile = outputPath || inputPath.replace('.bin', '.glb');
                await converter.convertFile(inputPath, outputFile);
            }
        })
        .catch(error => {
            console.error('Conversion failed:', error);
            process.exit(1);
        });
}

module.exports = { FullModelConverter }; 