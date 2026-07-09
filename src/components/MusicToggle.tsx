import { useState, useRef, useEffect, useCallback } from 'react';
import { MusicNoteIcon, MusicNoteOffIcon } from './ui/icons';
import Tooltip from './ui/Tooltip';
import { useSceneEntry } from '@/contexts/SceneEntryContext';

// Music toggle button component
export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { registerMusicHandlers } = useSceneEntry();

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/music/rainy.m4a');
      audioRef.current.loop = true;
    }
    return audioRef.current;
  }, []);

  useEffect(() => {
    registerMusicHandlers({
      prime: () => {
        ensureAudio().load();
      },
      play: () => {
        ensureAudio()
          .play()
          .then(() => setPlaying(true))
          .catch(err => {
            console.warn('Play prevented:', err);
          });
      },
    });
  }, [registerMusicHandlers, ensureAudio]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    const audio = ensureAudio();

    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.warn('Play prevented:', err);
      });
    }
    setPlaying(!playing);
  };

  return (
    <Tooltip label={playing ? 'Pause music' : 'Play music'}>
      <button
        onClick={toggleMusic}
        className="bg-black/30 backdrop-blur-sm p-2 rounded-full hover:bg-black/50 transition-colors cursor-pointer"
        aria-label={playing ? 'Pause music' : 'Play music'}
      >
        <div className={playing ? 'animate-[spin_6s_linear_infinite]' : ''}>
          {playing ? (
            <MusicNoteOffIcon className="text-white" />
          ) : (
            <MusicNoteIcon className="text-white" />
          )}
        </div>
      </button>
    </Tooltip>
  );
}
