import { useEffect, useState } from "react";
import Board from "./Board";
import GoboardPlayer from "../go/GoboardPlayer";
import Goboard_3d from "../go/Goboard_3d";
import Audio from  '../Audio/Audio'

export default function GoboardPanel({ player }: { player: GoboardPlayer }) {
  const [goboard] = useState(() => {
    const newGoboard = new Goboard_3d({});
    player.cb = newGoboard;
    player.newSgf();
    return newGoboard;
  });

  useEffect(() => {
    // Expose the print function to the global window
    if (typeof window !== 'undefined') {
      (window as any).printGoBoard = () => {
        goboard?.printBoard();
      }


      // 音效
      const map = new Map()
      const list = [
        'playForbidden',
        'stone1',
        'stone2',
        'stone3',
        'stone4',
        'stone5',
        'eat1',
        'eat2'
      ]
      list.forEach(item => {
        map.set(item, window.location.origin + `/sound/${item}.mp3`)
      })

      Audio.init()
      Audio.loadEffects(map)
    }
  }, [goboard]);

  return (
    <Board player={goboard} />
  )
}