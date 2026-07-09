import * as fs from 'fs';
import * as path from 'path';
import * as THREE from 'three';
import { BufferGeometry, Mesh, Scene, Material, MeshStandardMaterial } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const encoder = new TextEncoder();
const TYPED_ARRAYS = [
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
];

interface AttributeData {
  [key: string]: number;
}

interface AttributeTypes {
  [key: string]: string;
}

interface MaterialData {
  name?: string;
  color?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
  side?: 'front' | 'back' | 'double';
}

interface GeometryMetadata {
  attributes: Array<[string, number]>;
  userData?: any;
  materials?: MaterialData[];
}

class MaterialAwareConverter {
  private dracoLoader: DRACOLoader;

  constructor() {
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  }

  private extractMaterialData(material: Material): MaterialData {
    if (material instanceof MeshStandardMaterial) {
      return {
        name: material.name || undefined,
        color: material.color?.getHex(),
        roughness: material.roughness,
        metalness: material.metalness,
        opacity: material.opacity,
        transparent: material.transparent,
        side: material.side === 2 ? 'double' : material.side === 1 ? 'back' : 'front',
      };
    }

    // Fallback for other material types
    return {
      name: material.name || undefined,
      color: 0x888888,
      roughness: 0.5,
      metalness: 0.1,
      opacity: 1.0,
      transparent: false,
      side: 'front',
    };
  }

  private async loadGLTFModel(
    filePath: string
  ): Promise<{ geometry: BufferGeometry; materials: MaterialData[] }> {
    // This is a placeholder - in a real implementation, you would load GLTF/GLB files
    // For now, we'll create a simple geometry with material data
    const geometry = new BufferGeometry();
    const materials: MaterialData[] = [
      {
        name: 'default',
        color: 0x4a90e2,
        roughness: 0.3,
        metalness: 0.2,
        opacity: 1.0,
        transparent: false,
        side: 'front',
      },
    ];

    return { geometry, materials };
  }

  private createMetadata(geometry: BufferGeometry, materials: MaterialData[]): GeometryMetadata {
    const attributes: Array<[string, number]> = [];

    // Extract attribute information
    for (const [name, attribute] of Object.entries(geometry.attributes)) {
      const arrayType = attribute.array.constructor.name;
      const typeIndex = TYPED_ARRAYS.indexOf(arrayType);
      if (typeIndex !== -1) {
        attributes.push([name, typeIndex]);
      }
    }

    return {
      attributes,
      materials,
      userData: geometry.userData,
    };
  }

  private async encodeGeometry(geometry: BufferGeometry): Promise<ArrayBuffer> {
    // This is a simplified version - in a real implementation, you would use Draco encoding
    // For now, we'll create a placeholder encoded geometry
    const vertices =
      geometry.attributes.position?.array || new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const indices = geometry.index?.array || new Uint16Array([0, 1, 2]);

    // Create a simple binary representation
    const buffer = new ArrayBuffer(vertices.byteLength + indices.byteLength);
    const view = new DataView(buffer);

    // Write vertices
    const floatArray = new Float32Array(buffer, 0, vertices.length);
    floatArray.set(vertices);

    // Write indices
    const uintArray = new Uint16Array(buffer, vertices.byteLength, indices.length);
    uintArray.set(indices);

    return buffer;
  }

  public async convertToBinary(inputPath: string, outputPath: string): Promise<void> {
    try {
      console.log(`Converting ${inputPath} to binary format...`);

      // Load the model (this would be GLTF/GLB in a real implementation)
      const { geometry, materials } = await this.loadGLTFModel(inputPath);

      // Create metadata
      const metadata = this.createMetadata(geometry, materials);
      const metadataStr = JSON.stringify(metadata);
      const metadataBytes = encoder.encode(metadataStr);

      // Encode geometry
      const geometryData = await this.encodeGeometry(geometry);

      // Create binary file structure
      const metadataLength = metadataBytes.length;
      const lengthBytes = encoder.encode(metadataLength.toString().padStart(10, '0'));

      // Combine all parts
      const totalLength = 10 + metadataLength + geometryData.byteLength;
      const result = new ArrayBuffer(totalLength);
      const resultView = new Uint8Array(result);

      // Write metadata length (10 bytes)
      resultView.set(lengthBytes, 0);

      // Write metadata
      resultView.set(metadataBytes, 10);

      // Write geometry data
      resultView.set(new Uint8Array(geometryData), 10 + metadataLength);

      // Write to file
      fs.writeFileSync(outputPath, Buffer.from(result));

      console.log(`Successfully converted to ${outputPath}`);
      console.log(`Materials included: ${materials.length}`);
      materials.forEach((mat, index) => {
        console.log(
          `  Material ${index + 1}: ${mat.name || 'unnamed'} (color: #${mat.color?.toString(16).padStart(6, '0')})`
        );
      });
    } catch (error) {
      console.error(`Error converting ${inputPath}:`, error);
      throw error;
    }
  }

  public async createSampleBinary(outputPath: string): Promise<void> {
    console.log('Creating sample binary with material data...');

    // Create a simple cube geometry
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([
      // Front face
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
      // Back face
      -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
      // Top face
      -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
      // Bottom face
      -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
      // Right face
      1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
      // Left face
      -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
    ]);

    const indices = new Uint16Array([
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23, // left
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    // Create materials with different properties
    const materials: MaterialData[] = [
      {
        name: 'blue_metal',
        color: 0x4a90e2,
        roughness: 0.2,
        metalness: 0.8,
        opacity: 1.0,
        transparent: false,
        side: 'front',
      },
      {
        name: 'red_plastic',
        color: 0xe24a4a,
        roughness: 0.8,
        metalness: 0.1,
        opacity: 0.9,
        transparent: true,
        side: 'double',
      },
    ];

    // Create metadata
    const metadata: GeometryMetadata = {
      attributes: [
        ['position', 8],
        ['normal', 8],
      ], // Float32Array index
      materials,
      userData: { name: 'sample_cube' },
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
      console.log(
        `  Material ${index + 1}: ${mat.name} (color: #${mat.color?.toString(16).padStart(6, '0')})`
      );
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
    converter
      .createSampleBinary(outputPath)
      .then(() => console.log('Sample binary created successfully'))
      .catch(error => {
        console.error('Failed to create sample:', error);
        process.exit(1);
      });
  } else if (command === 'convert') {
    const inputPath = args[1];
    const outputPath = args[2];

    if (!inputPath) {
      console.log('Usage: node material-aware-converter.js convert <input-path> [output-path]');
      process.exit(1);
    }

    const output = outputPath || inputPath.replace(/\.[^.]+$/, '.bin');
    converter
      .convertToBinary(inputPath, output)
      .then(() => console.log('Conversion completed'))
      .catch(error => {
        console.error('Conversion failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log(
      '  node material-aware-converter.js sample [output-path]  - Create sample binary with materials'
    );
    console.log(
      '  node material-aware-converter.js convert <input> [output] - Convert model to binary'
    );
  }
}

export { MaterialAwareConverter };
