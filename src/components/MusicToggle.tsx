import { useState, useRef, useEffect } from "react";
import { MusicNoteIcon, MusicNoteOffIcon } from "./ui/icons";

// Music toggle button component
export default function MusicToggle() {
  const [playing, setPlaying] = useState(false); // Start with audio not playing to avoid autoplay issues
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Setup cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear source to release memory
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    // Create audio on first interaction if needed
    if (!audioRef.current) {
      audioRef.current = new Audio('/music/rainy.m4a');
      audioRef.current.loop = true;
    }
    
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.warn('Play prevented:', err);
      });
    }
    setPlaying(!playing);
  };

  return (
    <button 
      onClick={toggleMusic}
      className="bg-black/30 backdrop-blur-sm p-2 rounded-full hover:bg-black/50 transition-colors cursor-pointer"
      aria-label={playing ? "Pause music" : "Play music"}
    >
      <div className={playing ? "animate-[spin_6s_linear_infinite]" : ""}>
        {playing ? <MusicNoteOffIcon className="text-white" /> : <MusicNoteIcon className="text-white" />}
      </div>
    </button>
  );
}