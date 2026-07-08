#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// This is a simplified version that demonstrates the conversion logic
// For full Three.js integration, you'd need to run this in a browser environment
// or use a Node.js Three.js implementation

const decoder = new TextDecoder();
const TYPED_ARRAYS = [
  "Int8Array", 
  "Uint8Array", 
  "Uint8ClampedArray", 
  "Int16Array", 
  "Uint16Array", 
  "Int32Array", 
  "Uint32Array", 
  "Float32Array", 
  "Float64Array"
];

class ModelConverter {
  constructor() {
    // Note: This simplified version doesn't include Three.js integration
    // as it requires browser APIs or special Node.js setup
  }

  parseBinaryModel(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      
      // Parse metadata (first 10 bytes contain metadata length)
      const metadataLength = parseInt(decoder.decode(arrayBuffer.slice(0, 10)));
      const metadataStr = decoder.decode(arrayBuffer.slice(10, 10 + metadataLength));
      const geometryData = arrayBuffer.slice(10 + metadataLength);
      
      const metadata = JSON.parse(metadataStr);
      const attributeIDs = {};
      const attributeTypes = {};

      metadata.attributes.forEach((attribute, index) => {
        const [name, typeIndex] = attribute;
        attributeIDs[name] = index;
        attributeTypes[name] = TYPED_ARRAYS[typeIndex];
      });

      return {
        metadata,
        attributeIDs,
        attributeTypes,
        geometryData: Buffer.from(geometryData),
        geometryDataSize: geometryData.byteLength
      };
    } catch (error) {
      throw new Error(`${filePath} could not be parsed: ${error.message}`);
    }
  }

  generateGLBHeader(dataLength) {
    // GLB file header (12 bytes)
    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x46546C67, 0); // "glTF" magic
    header.writeUInt32LE(2, 4); // Version 2
    header.writeUInt32LE(dataLength + 12, 8); // Total length
    return header;
  }

  generateJSONChunk(jsonData) {
    const jsonString = JSON.stringify(jsonData);
    const jsonBuffer = Buffer.from(jsonString, 'utf8');
    
    // Pad to 4-byte boundary
    const padding = (4 - (jsonBuffer.length % 4)) % 4;
    const paddedJsonBuffer = Buffer.concat([jsonBuffer, Buffer.alloc(padding)]);
    
    const chunk = Buffer.alloc(8 + paddedJsonBuffer.length);
    chunk.writeUInt32LE(paddedJsonBuffer.length, 0);
    chunk.writeUInt32LE(0x4E4F534A, 4); // "JSON" chunk type
    paddedJsonBuffer.copy(chunk, 8);
    
    return chunk;
  }

  generateBINChunk(binaryData) {
    // Pad to 4-byte boundary
    const padding = (4 - (binaryData.length % 4)) % 4;
    const paddedBinaryData = Buffer.concat([binaryData, Buffer.alloc(padding)]);
    
    const chunk = Buffer.alloc(8 + paddedBinaryData.length);
    chunk.writeUInt32LE(paddedBinaryData.length, 0);
    chunk.writeUInt32LE(0x004E4942, 4); // "BIN" chunk type
    paddedBinaryData.copy(chunk, 8);
    
    return chunk;
  }

  createBasicGLTF(parsedData, modelName) {
    // Create a basic GLTF structure
    const gltf = {
      asset: {
        version: "2.0",
        generator: "ModelConverter"
      },
      scene: 0,
      scenes: [{
        nodes: [0]
      }],
      nodes: [{
        mesh: 0
      }],
      meshes: [{
        primitives: [{
          attributes: {},
          indices: 0,
          mode: 4 // TRIANGLES
        }]
      }],
      accessors: [],
      bufferViews: [],
      buffers: [{
        byteLength: 0 // Will be set later
      }],
      materials: [{
        pbrMetallicRoughness: {
          baseColorFactor: [0.5, 0.5, 0.5, 1.0],
          metallicFactor: 0.1,
          roughnessFactor: 0.8
        }
      }]
    };

    // Add metadata as extras
    if (parsedData.metadata.userData) {
      gltf.extras = parsedData.metadata.userData;
    }

    return gltf;
  }

  convertToGLB(inputPath, outputPath, modelName) {
    try {
      console.log(`Converting ${inputPath} to ${outputPath}...`);
      
      // Parse the binary model
      const parsedData = this.parseBinaryModel(inputPath);
      
      // Create basic GLTF structure
      const gltf = this.createBasicGLTF(parsedData, modelName || path.basename(inputPath, '.bin'));
      
      // For now, we'll create a minimal GLB with just the structure
      // In a full implementation, you'd decode the Draco data and create proper geometry
      
      const jsonChunk = this.generateJSONChunk(gltf);
      const binChunk = this.generateBINChunk(Buffer.alloc(0)); // Empty binary data for now
      
      const totalLength = 12 + jsonChunk.length + binChunk.length;
      const header = this.generateGLBHeader(totalLength - 12);
      
      // Combine all parts
      const glbBuffer = Buffer.concat([header, jsonChunk, binChunk]);
      
      // Write the GLB file
      fs.writeFileSync(outputPath, glbBuffer);
      
      console.log(`Successfully created GLB structure for ${inputPath}`);
      console.log(`Note: This is a basic GLB structure. For full geometry conversion,`);
      console.log(`you'll need to run this in a browser environment with Three.js.`);
      
      // Log the parsed metadata for debugging
      console.log('Parsed metadata:', JSON.stringify(parsedData.metadata, null, 2));
      console.log(`Geometry data size: ${parsedData.geometryDataSize} bytes`);
      
    } catch (error) {
      console.error(`Error converting ${inputPath}:`, error);
      throw error;
    }
  }

  convertAllModels(inputDir, outputDir) {
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
      
      for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace('.bin', '.glb'));
        const modelName = path.basename(file, '.bin');
        
        this.convertToGLB(inputPath, outputPath, modelName);
      }
      
      console.log('All models converted successfully!');
    } catch (error) {
      console.error('Error during batch conversion:', error);
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const converter = new ModelConverter();
  
  const args = process.argv.slice(2);
  const inputPath = args[0];
  const outputPath = args[1];
  
  if (!inputPath) {
    console.log('Usage: node model-converter.js <input-path> [output-path]');
    console.log('  input-path: Path to .bin file or directory containing .bin files');
    console.log('  output-path: Path for output .glb file or directory (optional)');
    process.exit(1);
  }
  
  const inputStats = fs.statSync(inputPath);
  
  if (inputStats.isDirectory()) {
    const outputDir = outputPath || path.join(path.dirname(inputPath), 'glb-exports');
    converter.convertAllModels(inputPath, outputDir);
  } else {
    const outputFile = outputPath || inputPath.replace('.bin', '.glb');
    converter.convertToGLB(inputPath, outputFile);
  }
}

module.exports = { ModelConverter }; 