import MusicToggle from '../MusicToggle';
import { useState, useEffect } from 'react';
import {
  LockIcon,
  UnlockIcon,
  TopViewIcon,
  EnterFullscreenIcon,
  NewFileIcon,
  OpenFileIcon,
} from './icons';

interface RightSidebarProps {
  onNewFile?: () => void;
  onOpenFile?: () => void;
  onLockToggle?: (locked: boolean) => void;
  onCameraTopView?: () => void;
}

export default function RightSidebar({ onNewFile, onOpenFile, onLockToggle, onCameraTopView }: RightSidebarProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLockToggle = () => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    onLockToggle?.(newLockState);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-16 flex flex-col items-center gap-4 py-4 z-10">
      <MusicToggle />
      
      <button
        onClick={handleLockToggle}
        className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
          isLocked 
            ? 'bg-white text-black' 
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title={isLocked ? "Unlock Camera" : "Lock Camera"}
      >
        {isLocked ? <LockIcon /> : <UnlockIcon />}
      </button>

      <button
        onClick={onCameraTopView}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
        title="Top View"
      >
        <TopViewIcon />
      </button>

      <button
        onClick={toggleFullscreen}
        className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
          isFullscreen 
            ? 'bg-white text-black' 
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        <EnterFullscreenIcon />
      </button>

      <button
        onClick={onNewFile}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
        title="New File"
      >
        <NewFileIcon />
      </button>

      <button
        onClick={onOpenFile}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
        title="Open File"
      >
        <OpenFileIcon />
      </button>
    </div>
  );
} 