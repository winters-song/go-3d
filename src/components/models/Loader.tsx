import { useProgress, Html } from '@react-three/drei';

export default function Loader() {
  const { progress } = useProgress();
  const pct = Math.min(100, Math.round(progress));

  return (
    <Html fullscreen>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(165deg, #14110e 0%, #1c1814 45%, #121510 100%)',
          color: '#f5f0e8',
          fontSize: '1rem',
        }}
      >
        加载中 {pct}%
      </div>
    </Html>
  );
}
