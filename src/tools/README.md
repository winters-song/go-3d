# Model Converter Tool

This tool converts binary model files (`.bin`) to GLB format using the same logic as the `CustomDRACOLoader` from `summer.ts`.

## Features

- Converts individual `.bin` files to `.glb` files
- Batch conversion of all `.bin` files in a directory
- Preserves geometry attributes and metadata
- Creates basic materials for the exported models
- **Full geometry export** with complete mesh data and Draco decoding

## Installation

The tool requires `ts-node` to run TypeScript files directly. Install it if not already present:

```bash
npm install --save-dev ts-node
```

## Usage

### Basic Conversion (Structure Only)

```bash
# Convert a single file (creates GLB structure without full geometry)
npm run convert-models src/tools/models/kid.bin

# Convert a single file with custom output path
npm run convert-models src/tools/models/kid.bin output/kid.glb

# Convert all .bin files in a directory
npm run convert-models src/tools/models

# Convert all .bin files with custom output directory
npm run convert-models src/tools/models output/glb-files
```

### Full Geometry Export

For complete geometry conversion with Draco decoding:

```bash
# Open browser-based converter (recommended)
npm run convert-models-full src/tools/models/kid.bin

# Convert all files in a directory
npm run convert-models-full src/tools/models

# Install Puppeteer for headless conversion
npm run convert-models-full install-puppeteer
```

### Using the script directly

```bash
# Convert a single file
node src/tools/convert-models.js src/tools/models/kid.bin

# Convert all files in a directory
node src/tools/convert-models.js src/tools/models
```

## How it works

### Basic Converter
The basic converter follows the same logic as `CustomDRACOLoader`:

1. **Reads the binary file** and extracts metadata from the first 10 bytes
2. **Parses metadata** to understand the geometry attributes and their types
3. **Creates a basic GLB structure** with metadata but without decoded geometry
4. **Exports to GLB** format (structure only)

### Full Geometry Converter
The full geometry converter provides complete conversion:

1. **Reads the binary file** and extracts metadata from the first 10 bytes
2. **Parses metadata** to understand the geometry attributes and their types
3. **Decodes the geometry** using DRACOLoader with the parsed attribute information
4. **Creates a complete mesh** with geometry, materials, and lighting
5. **Exports to GLB** format using Three.js GLTFExporter with full geometry data

## File Format

The binary files are expected to have this structure:
- **Bytes 0-9**: Metadata length (as string)
- **Bytes 10-10+metadataLength**: JSON metadata containing attribute definitions
- **Remaining bytes**: Compressed geometry data (Draco format)

## Output

- Individual files: `input.bin` → `input.glb`
- Batch conversion: Creates a `glb-exports` directory by default
- All exported files are standard GLB format compatible with Three.js and other 3D engines

## Error Handling

The tool provides detailed error messages for:
- Invalid file formats
- Missing files or directories
- DRACO decoding errors
- GLB export failures

## Example

### Basic Conversion
```bash
# Convert the terrain model (structure only)
npm run convert-models src/tools/models/terrain.bin

# Convert both models in the models directory
npm run convert-models src/tools/models
```

### Full Geometry Conversion
```bash
# Convert with full geometry (opens browser)
npm run convert-models-full src/tools/models/terrain.bin

# Convert all models with full geometry
npm run convert-models-full src/tools/models
```

This will create:
- **Basic**: `terrain.glb` (structure only)
- **Full**: `terrain.glb` (complete geometry with mesh data)
- **Batch**: `glb-exports/terrain.glb` and `glb-exports/kid.glb` 