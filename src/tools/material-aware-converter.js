const fs = require('fs');
const path = require('path');

const encoder = new TextEncoder();
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

class MaterialAwareConverter {
  async createSampleBinary(outputPath) {
    console.log('Creating sample binary with material data...');
    
    // Create a simple cube geometry
    const vertices = new Float32Array([
      // Front face
      -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1,
      // Back face
      -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1, -1,
      // Top face
      -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1,
      // Bottom face
      -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1,
      // Right face
       1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,
      // Left face
      -1, -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1,
    ]);
    
    const indices = new Uint16Array([
      0,  1,  2,    0,  2,  3,   // front
      4,  5,  6,    4,  6,  7,   // back
      8,  9,  10,   8,  10, 11,  // top
      12, 13, 14,   12, 14, 15,  // bottom
      16, 17, 18,   16, 18, 19,  // right
      20, 21, 22,   20, 22, 23,  // left
    ]);
    
    // Create materials with different properties
    const materials = [
      {
        name: 'blue_metal',
        color: 0x4a90e2,
        roughness: 0.2,
        metalness: 0.8,
        opacity: 1.0,
        transparent: false,
        side: 'front'
      },
      {
        name: 'red_plastic',
        color: 0xe24a4a,
        roughness: 0.8,
        metalness: 0.1,
        opacity: 0.9,
        transparent: true,
        side: 'double'
      }
    ];
    
    // Create metadata
    const metadata = {
      attributes: [['position', 8], ['normal', 8]], // Float32Array index
      materials,
      userData: { name: 'sample_cube' }
    };
    
    const metadataStr = JSON.stringify(metadata);
    const metadataBytes = encoder.encode(metadataStr);
    
    // Create geometry data (simplified)
    const geometryData = new ArrayBuffer(vertices.byteLength + indices.byteLength);
    const dataView = new Uint8Array(geometryData);
    dataView.set(new Uint8Array(vertices.buffer), 0);
    dataView.set(new Uint8Array(indices.buffer), vertices.byteLength);
    
    // Create binary file
    const metadataLength = metadataBytes.length;
    const lengthBytes = encoder.encode(metadataLength.toString().padStart(10, '0'));
    
    const totalLength = 10 + metadataLength + geometryData.byteLength;
    const result = new ArrayBuffer(totalLength);
    const resultView = new Uint8Array(result);
    
    resultView.set(lengthBytes, 0);
    resultView.set(metadataBytes, 10);
    resultView.set(new Uint8Array(geometryData), 10 + metadataLength);
    
    fs.writeFileSync(outputPath, Buffer.from(result));
    
    console.log(`Sample binary created: ${outputPath}`);
    console.log(`Materials included: ${materials.length}`);
    materials.forEach((mat, index) => {
      console.log(`  Material ${index + 1}: ${mat.name} (color: #${mat.color?.toString(16).padStart(6, '0')})`);
    });
  }
}

// CLI usage
if (require.main === module) {
  const converter = new MaterialAwareConverter();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'sample') {
    const outputPath = args[1] || 'sample-with-materials.bin';
    converter.createSampleBinary(outputPath)
      .then(() => console.log('Sample binary created successfully'))
      .catch(error => {
        console.error('Failed to create sample:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  node material-aware-converter.js sample [output-path]  - Create sample binary with materials');
  }
}

module.exports = { MaterialAwareConverter }; 