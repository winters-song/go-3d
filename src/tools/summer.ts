import { FileLoader, LoadingManager } from "three";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

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
const bufferLoader = new FileLoader();
// https://summer-afternoon.vlucendo.com/

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

class CustomDRACOLoader extends DRACOLoader {
  constructor(manager?: LoadingManager) {
    super(manager);
    this.setDecoderPath("assets/libs/draco/");
    this.preload();
  }

  async loadAsync(url: string): Promise<any> {
    try {
      const buffer = await bufferLoader.loadAsync(url);
      
      if (typeof buffer === 'string') {
        throw new Error('Expected ArrayBuffer, got string');
      }

      const metadataLength = parseInt(decoder.decode(buffer.slice(0, 10)));
      const metadataStr = decoder.decode(buffer.slice(10, 10 + metadataLength));
      const geometryData = buffer.slice(10 + metadataLength);
      
      const metadata: GeometryMetadata = JSON.parse(metadataStr);
      const attributeIDs: AttributeData = {};
      const attributeTypes: AttributeTypes = {};

      metadata.attributes.forEach((attribute: [string, number], index: number) => {
        const [name, typeIndex] = attribute;
        attributeIDs[name] = index;
        attributeTypes[name] = TYPED_ARRAYS[typeIndex];
      });

      const geometry = await (this as any).decodeGeometry(geometryData, {
        attributeIDs,
        attributeTypes,
        useUniqueIDs: true
      });

      if (metadata.userData) {
        geometry.userData = metadata.userData;
      }

      return geometry;
    } catch (error) {
      throw new Error(`${url} could not be loaded: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}