import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'


export default function PlayerAvatars() {
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<number>(1.5) // Default aspect ratio (width/height)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Base dimensions for avatar planes
  const avatarWidth = 2
  const avatarHeight = avatarWidth / aspectRatio

  useEffect(() => {
    console.log("Initializing webcam...");
    
    const initCamera = async () => {
      try {
        console.log("Requesting camera permission...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 } 
          } 
        });
        
        console.log("Camera permission granted, initializing video element");
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Create texture only after video has started playing
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            
            // Get actual video dimensions and set aspect ratio
            if (videoRef.current) {
              const videoWidth = videoRef.current.videoWidth;
              const videoHeight = videoRef.current.videoHeight;
              const videoAspectRatio = videoWidth / videoHeight;
              console.log(`Video dimensions: ${videoWidth}x${videoHeight}, aspect ratio: ${videoAspectRatio}`);
              setAspectRatio(videoAspectRatio);
            }
            
            videoRef.current?.play()
              .then(() => {
                console.log("Video playback started");
                const texture = new THREE.VideoTexture(videoRef.current!);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                setVideoTexture(texture);
                console.log("Video texture created");
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setCameraError("Error playing video");
              });
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraError(err instanceof Error ? err.message : "Unknown error accessing camera");
      }
    };

    initCamera();

    // Store video element reference for cleanup
    const videoElement = videoRef.current;

    return () => {
      // Cleanup using stored reference
      if (videoElement?.srcObject) {
        console.log("Cleaning up camera stream");
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      {/* Front player plane (White player) */}
      <mesh position={[0, 2, 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[avatarWidth, avatarHeight]} />
        <meshStandardMaterial color="#ffffff" side={THREE.FrontSide} />
      </mesh>

      {/* Back player plane with webcam (Black player) */}
      <mesh position={[0, 2, -2]}>
        <planeGeometry args={[avatarWidth, avatarHeight]} />
        {videoTexture ? (
          <meshBasicMaterial 
            map={videoTexture}
            side={THREE.FrontSide}
          />
        ) : (
          <meshStandardMaterial 
            color={cameraError ? "#ff0000" : "#333333"}
            side={THREE.FrontSide}
          />
        )}
      </mesh>

      {/* Camera error message */}
      {cameraError && (
        <Html position={[0, 2, -2]} center>
          <div style={{ 
            color: 'white', 
            backgroundColor: 'rgba(255,0,0,0.7)', 
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '300px',
            textAlign: 'center'
          }}>
            Camera error: {cameraError}
          </div>
        </Html>
      )}

      {/* Hidden video element */}
      <Html>
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          autoPlay
          playsInline
          muted
          width="640"
          height="480"
        />
      </Html>
    </>
  );
}