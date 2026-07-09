import * as fs from 'fs';
import * as path from 'path';
import { BufferGeometry, Mesh, Scene, Group, Object3D } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const decoder = new TextDecoder();
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

interface GeometryMetadata {
  attributes: Array<[string, number]>;
  userData?: any;
}

class ModelConverter {
  private dracoLoader: DRACOLoader;

  constructor() {
    this.dracoLoader = new DRACOLoader();
    // Note: In a Node.js environment, you might need to set a different decoder path
    // or handle the decoder differently
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  }

  private async loadBinaryModel(filePath: string): Promise<BufferGeometry> {
    try {
      const buffer = fs.readFileSync(filePath);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );

      // Parse metadata (first 10 bytes contain metadata length)
      const metadataLength = parseInt(decoder.decode(arrayBuffer.slice(0, 10)));
      const metadataStr = decoder.decode(arrayBuffer.slice(10, 10 + metadataLength));
      const geometryData = arrayBuffer.slice(10 + metadataLength);

      const metadata: GeometryMetadata = JSON.parse(metadataStr);
      const attributeIDs: AttributeData = {};
      const attributeTypes: AttributeTypes = {};

      metadata.attributes.forEach((attribute: [string, number], index: number) => {
        const [name, typeIndex] = attribute;
        attributeIDs[name] = index;
        attributeTypes[name] = TYPED_ARRAYS[typeIndex];
      });

      const geometry = await (this.dracoLoader as any).decodeGeometry(geometryData, {
        attributeIDs,
        attributeTypes,
        useUniqueIDs: true,
      });

      if (metadata.userData) {
        geometry.userData = metadata.userData;
      }

      return geometry;
    } catch (error) {
      throw new Error(
        `${filePath} could not be loaded: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private createMeshFromGeometry(geometry: BufferGeometry, name: string = 'model'): Mesh {
    // Create a basic material - you might want to customize this
    const material = {
      color: 0x888888,
      metalness: 0.1,
      roughness: 0.8,
    };

    const mesh = new Mesh(geometry, material as any);
    mesh.name = name;
    return mesh;
  }

  private async exportToGLB(scene: Scene, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();

      const options = {
        binary: true,
        includeCustomExtensions: true,
      };

      exporter.parse(
        scene,
        result => {
          if (result instanceof ArrayBuffer) {
            fs.writeFileSync(outputPath, Buffer.from(result));
            resolve();
          } else {
            reject(new Error('Export failed - expected binary result'));
          }
        },
        error => {
          reject(error);
        },
        options
      );
    });
  }

  public async convertModelToGLB(
    inputPath: string,
    outputPath: string,
    modelName?: string
  ): Promise<void> {
    try {
      console.log(`Converting ${inputPath} to ${outputPath}...`);

      // Load the binary model
      const geometry = await this.loadBinaryModel(inputPath);

      // Create a mesh from the geometry
      const mesh = this.createMeshFromGeometry(
        geometry,
        modelName || path.basename(inputPath, '.bin')
      );

      // Create a scene and add the mesh
      const scene = new Scene();
      scene.add(mesh);

      // Export to GLB
      await this.exportToGLB(scene, outputPath);

      console.log(`Successfully converted ${inputPath} to ${outputPath}`);
    } catch (error) {
      console.error(`Error converting ${inputPath}:`, error);
      throw error;
    }
  }

  public async convertAllModels(inputDir: string, outputDir: string): Promise<void> {
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

        await this.convertModelToGLB(inputPath, outputPath, modelName);
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
    converter
      .convertAllModels(inputPath, outputDir)
      .then(() => console.log('Batch conversion completed'))
      .catch(error => {
        console.error('Batch conversion failed:', error);
        process.exit(1);
      });
  } else {
    const outputFile = outputPath || inputPath.replace('.bin', '.glb');
    converter
      .convertModelToGLB(inputPath, outputFile)
      .then(() => console.log('Conversion completed'))
      .catch(error => {
        console.error('Conversion failed:', error);
        process.exit(1);
      });
  }
}

export { ModelConverter };
