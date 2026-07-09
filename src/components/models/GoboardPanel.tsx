import { useEffect, useState } from 'react';
import Board from './Board';
import GoboardPlayer from '../go/GoboardPlayer';
import Goboard_3d from '../go/Goboard_3d';
import Audio from '../Audio/Audio';
import { sgf } from '@/data/sgf';

export default function GoboardPanel({ player }: { player: GoboardPlayer }) {
  const [goboard] = useState(() => new Goboard_3d({}));

  useEffect(() => {
    if (player.cb === goboard) return;
    player.cb = goboard;
    player.loadSgf(sgf, 1);
    player.toEnd();
  }, [player, goboard]);

  useEffect(() => {
    // Expose the print function to the global window
    if (typeof window !== 'undefined') {
      (window as any).printGoBoard = () => {
        goboard?.printBoard();
      };

      // 音效
      const map = new Map();
      const list = [
        'playForbidden',
        'stone1',
        'stone2',
        'stone3',
        'stone4',
        'stone5',
        'eat1',
        'eat2',
      ];
      list.forEach(item => {
        map.set(item, window.location.origin + `/sound/${item}.mp3`);
      });

      Audio.init();
      Audio.loadEffects(map);
    }
  }, [goboard]);

  return <Board goboard={goboard} player={player} />;
}
