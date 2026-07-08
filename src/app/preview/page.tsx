'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface FileItem {
  file: File;
  id: string;
}

interface StatusMessage {
  message: string;
  type: 'info' | 'success' | 'error' | 'progress';
  progress?: number;
}

// Custom DRACO Loader from summer.ts
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

interface AttributeData {
  [key: string]: number;
}

interface AttributeTypes {
  [key: string]: string;
}

interface GeometryMetadata {
  attributes: Array<[string, number]>;
  userData?: any;
  materials?: MaterialData[];
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

class CustomDRACOLoader extends DRACOLoader {
  constructor() {
    // We'll use the built-in DRACOLoader from Three.js
    super();
    this.setDecoderPath('/draco/');
    this.preload();
  }

  async loadFromFile(file: File): Promise<{ geometry: THREE.BufferGeometry; materials?: MaterialData[] }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
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

      // For now, create a placeholder geometry since full Draco decoding is complex
      // In a real implementation, you would decode the actual geometry data
      // const geometry = new THREE.BoxGeometry(1, 1, 1);
      const geometry = await (this as any).decodeGeometry(geometryData, {
        attributeIDs,
        attributeTypes,
        useUniqueIDs: true
      });
      
      // Add metadata to userData for debugging
      geometry.userData = {
        isPlaceholder: true,
        originalDataSize: geometryData.byteLength,
        attributeIDs,
        attributeTypes,
        metadata
      };

      return { 
        geometry,
        materials: metadata.materials || undefined
      };
    } catch (error) {
      throw new Error(`Could not load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Model Component
function Model({ geometry, materials }: { geometry: THREE.BufferGeometry; materials?: MaterialData[] }) {
  // Use the first material from the file, or fall back to default
  const materialData = materials && materials.length > 0 ? materials[0] : null;
  
  // const material = new THREE.MeshStandardMaterial({ 
  //   color: materialData?.color ?? 0x888888,
  //   roughness: materialData?.roughness ?? 0.5,
  //   metalness: materialData?.metalness ?? 0.1,
  //   opacity: materialData?.opacity ?? 1.0,
  //   transparent: materialData?.transparent ?? false,
  //   side: materialData?.side === 'double' ? THREE.DoubleSide : 
  //         materialData?.side === 'back' ? THREE.BackSide : THREE.FrontSide
  // });
  const material = new THREE.MeshNormalMaterial();

  return (
    <mesh geometry={geometry} material={material}>
      {/* <meshStandardMaterial /> */}
    </mesh>
  );
}

// Scene Component
function Scene({ geometry, materials }: { geometry: THREE.BufferGeometry | null; materials?: MaterialData[] }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[1, 1, 1]} intensity={0.8} />
      <Environment preset="city" />
      {geometry && <Model geometry={geometry} materials={materials} />}
    </>
  );
}

export default function PreviewPage() {
  const [file, setFile] = useState<FileItem | null>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [materials, setMaterials] = useState<MaterialData[] | undefined>(undefined);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<CustomDRACOLoader | null>(null);

  const updateStatus = useCallback((message: string, type: StatusMessage['type'] = 'info', progress?: number) => {
    setStatus({ message, type, progress });
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loadFile = async (selectedFile: File) => {
    setIsLoading(true);
    setGeometry(null);
    setMaterials(undefined);
    
    try {
      updateStatus(`Loading ${selectedFile.name}...`, 'progress', 10);
      
      if (!loaderRef.current) {
        loaderRef.current = new CustomDRACOLoader();
      }
      
      updateStatus(`Parsing geometry data...`, 'progress', 50);
      const { geometry: loadedGeometry, materials: loadedMaterials } = await loaderRef.current.loadFromFile(selectedFile);
      
      updateStatus(`Rendering model...`, 'progress', 90);
      setGeometry(loadedGeometry);
      setMaterials(loadedMaterials);
      
      updateStatus(`Successfully loaded ${selectedFile.name}`, 'success', 100);
      
    } catch (error) {
      updateStatus(`Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.bin')) {
      const fileItem: FileItem = {
        file: selectedFile,
        id: `${selectedFile.name}-${Date.now()}-${Math.random()}`
      };
      setFile(fileItem);
      loadFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const binFile = droppedFiles.find(file => file.name.endsWith('.bin'));
    
    if (binFile) {
      const fileItem: FileItem = {
        file: binFile,
        id: `${binFile.name}-${Date.now()}-${Math.random()}`
      };
      setFile(fileItem);
      loadFile(binFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setGeometry(null);
    setMaterials(undefined);
    setStatus(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Binary Model Preview
        </h1>
        <p className="text-center text-gray-600">
          Drag and drop .bin files to preview 3D models
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Try the sample file: <code className="bg-gray-100 px-2 py-1 rounded">sample-with-materials.bin</code>
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* File Upload Section */}
        <div className="lg:w-1/3 p-6">
          <div 
            ref={dropZoneRef}
            className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 bg-white"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-4">📁</div>
            <div className="text-lg text-gray-700 mb-2">Drop .bin file here or click to browse</div>
            <div className="text-sm text-gray-500">Single file preview only</div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".bin"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File Info */}
          {file && (
            <div className="mt-6 bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-800 mb-2">File Info</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {file.file.name}</div>
                <div><span className="font-medium">Size:</span> {formatFileSize(file.file.size)}</div>
                {geometry?.userData && (
                  <div><span className="font-medium">Data Size:</span> {formatFileSize(geometry.userData.originalDataSize || 0)}</div>
                )}
                {materials && materials.length > 0 && (
                  <div>
                    <div><span className="font-medium">Materials:</span> {materials.length}</div>
                    <div className="mt-2 space-y-1">
                      {materials.map((mat, index) => (
                        <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: `#${mat.color?.toString(16).padStart(6, '0')}` }}
                            ></div>
                            <span className="font-medium">{mat.name || `Material ${index + 1}`}</span>
                          </div>
                          <div className="text-gray-600 mt-1">
                            Roughness: {mat.roughness?.toFixed(2)}, Metalness: {mat.metalness?.toFixed(2)}
                            {mat.transparent && <span className="ml-2 text-blue-600">Transparent</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={clearFile}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Clear File
              </button>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className={`mt-6 p-4 rounded-lg ${
              status.type === 'info' ? 'bg-blue-100 text-blue-800' :
              status.type === 'success' ? 'bg-green-100 text-green-800' :
              status.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              <div className="font-medium">{status.message}</div>
              {status.progress !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3D Preview Section */}
        <div className="lg:w-2/3 flex-1">
          <div className="w-full h-full min-h-[500px] bg-gray-900 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div>Loading model...</div>
                </div>
              </div>
            ) : geometry ? (
              <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                <Scene geometry={geometry} materials={materials} />
                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={1}
                  maxDistance={10}
                />
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎯</div>
                  <div className="text-xl">Drop a .bin file to preview</div>
                  <div className="text-sm text-gray-300 mt-2">3D model will appear here</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 