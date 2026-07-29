import { useEffect, useState } from 'react';
import Board from './Board';
import { GoboardPlayer } from 'goboard-sdk/core';
import Goboard_3d from '../go/Goboard_3d';
import { sgf } from '@/data/sgf';

export default function GoboardPanel({ player }: { player: GoboardPlayer }) {
  const [goboard] = useState(() => new Goboard_3d({}));

  useEffect(() => {
    if (player.externalBoard === goboard && player.cb === goboard) return;
    player.setBoard(goboard);
    player.loadSgf(sgf, 1);
    player.toEnd();
  }, [player, goboard]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).printGoBoard = () => {
        goboard?.printBoard();
      };
    }
  }, [goboard]);

  return <Board goboard={goboard} player={player} />;
}
