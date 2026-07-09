import MusicToggle from '../MusicToggle';
import { useState, useEffect } from 'react';
import {
  LockIcon,
  UnlockIcon,
  TopViewIcon,
  EnterFullscreenIcon,
  NewFileIcon,
  OpenFileIcon,
  InfoIcon,
} from './icons';
import PageInfoModal from './PageInfoModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCameraLock } from '@/store/cameraSlice'
import { useCameraTopView } from '@/components/CursorManager'
import GoboardPlayer from '../go/GoboardPlayer'
import Tooltip from './Tooltip'

interface RightSidebarProps {
  player: GoboardPlayer;
}

export default function RightSidebar({ player }: RightSidebarProps) {
  const dispatch = useAppDispatch();
  const isCameraLocked = useAppSelector((state) => state.camera.isLocked);
  const handleCameraTopView = useCameraTopView();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

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
    <>
    <div className="fixed right-0 top-0 h-full w-16 flex flex-col items-center gap-4 py-4 pb-24 z-20">
      <MusicToggle />
      
      <Tooltip label={isCameraLocked ? "Unlock Camera" : "Lock Camera"}>
        <button
          onClick={handleLockToggle}
          className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
            isCameraLocked 
              ? 'bg-white text-black' 
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {isCameraLocked ? <LockIcon /> : <UnlockIcon />}
        </button>
      </Tooltip>

      <Tooltip label="Top View">
        <button
          onClick={handleCameraTopView}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
        >
          <TopViewIcon />
        </button>
      </Tooltip>

      <Tooltip label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
        <button
          onClick={toggleFullscreen}
          className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
            isFullscreen 
              ? 'bg-white text-black' 
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <EnterFullscreenIcon />
        </button>
      </Tooltip>

      <Tooltip label="New File">
        <button
          onClick={handleNewFile}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
        >
          <NewFileIcon />
        </button>
      </Tooltip>

      <Tooltip label="Open File">
        <button
          onClick={handleOpenFile}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
        >
          <OpenFileIcon />
        </button>
      </Tooltip>

      <div className="mt-auto">
        <Tooltip label="关于">
          <button
            onClick={() => setInfoOpen(true)}
            className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white cursor-pointer"
            aria-label="关于"
          >
            <InfoIcon />
          </button>
        </Tooltip>
      </div>
    </div>

    <PageInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
} 