import { useProgress, Html } from "@react-three/drei"

export default function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{ color: 'black', fontSize: '1.2em' }}>
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  )
} 