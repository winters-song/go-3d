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
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCameraLock } from '@/store/cameraSlice'
import { useCameraTopView } from '@/components/CursorManager'
import GoboardPlayer from '../go/GoboardPlayer'

interface RightSidebarProps {
  player: GoboardPlayer;
}

export default function RightSidebar({ player }: RightSidebarProps) {
  const dispatch = useAppDispatch();
  const isCameraLocked = useAppSelector((state) => state.camera.isLocked);
  const handleCameraTopView = useCameraTopView();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLockToggle = () => {
    dispatch(setCameraLock(!isCameraLocked));
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

  const handleNewFile = () => {
    player.newSgf();
  };

  const handleOpenFile = () => {
    const upload = (file: Blob) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const sgf = fileReader.result as string;
        player.changeData(sgf, 1)
        player.toEnd()
      };
      fileReader.readAsText(file);
      return false;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sgf';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        upload(target.files[0]);
      }
    };
    input.click();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-16 flex flex-col items-center gap-4 py-4 z-10">
      <MusicToggle />
      
      <button
        onClick={handleLockToggle}
        className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
          isCameraLocked 
            ? 'bg-white text-black' 
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title={isCameraLocked ? "Unlock Camera" : "Lock Camera"}
      >
        {isCameraLocked ? <LockIcon /> : <UnlockIcon />}
      </button>

      <button
        onClick={handleCameraTopView}
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
        onClick={handleNewFile}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
        title="New File"
      >
        <NewFileIcon />
      </button>

      <button
        onClick={handleOpenFile}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
        title="Open File"
      >
        <OpenFileIcon />
      </button>
    </div>
  );
} 