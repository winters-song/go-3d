import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';
import Stone from './Stone';
import Head from './Head';
import Goboard_3d from '../go/Goboard_3d';
import GoboardPlayer from '../go/GoboardPlayer';

interface BoardProps {
  goboard: Goboard_3d;
  player?: GoboardPlayer;
}

export default function Board({ goboard, player }: BoardProps) {
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);
  const [lastPlacedStone, setLastPlacedStone] = useState<{ col: number; row: number } | null>(null);
  const [, setBoardVersion] = useState(0);
  const planeRef = useRef<THREE.Mesh>(null!);
  const { gl, controls } = useThree();
  const boardSize = 19;
  const gridScale = 2.83;
  const boardScale = 3;
  const offset = gridScale / 2;
  const unitLength = gridScale / (boardSize - 1);

  const boardToWorldPosition = (col: number, row: number): [number, number, number] => {
    return [col * unitLength - offset, 1.625, row * unitLength - offset];
  };

  const getValidBoardPosition = (intersectionPoint: THREE.Vector3) => {
    const x = Math.floor((intersectionPoint.x + offset + unitLength / 2) / unitLength);
    const y =
      boardSize - 1 - Math.floor((intersectionPoint.y + offset + unitLength / 2) / unitLength);

    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return null;

    const isOccupied = goboard.pieces[y * boardSize + x] !== 0;
    if (isOccupied) return null;

    return {
      boardX: x,
      boardY: y,
    };
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!planeRef.current) return;

    if (goboard.options.readonly || goboard.clientColor !== goboard.currentColor) {
      if (hoverCell !== null) setHoverCell(null);
      gl.domElement.style.cursor = 'default';
      return;
    }

    const intersectionPoint = event.point.clone();
    planeRef.current.worldToLocal(intersectionPoint);

    const position = getValidBoardPosition(intersectionPoint);
    const nextCell = position ? { col: position.boardX, row: position.boardY } : null;
    const cellChanged =
      (nextCell === null) !== (hoverCell === null) ||
      (nextCell !== null &&
        hoverCell !== null &&
        (nextCell.col !== hoverCell.col || nextCell.row !== hoverCell.row));

    if (!cellChanged) return;

    if (position) {
      setHoverCell(nextCell);
      gl.domElement.style.cursor = 'pointer';
    } else {
      setHoverCell(null);
      gl.domElement.style.cursor = 'default';
    }
  };

  const handlePointerLeave = () => {
    setHoverCell(null);
    gl.domElement.style.cursor = 'default';
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!planeRef.current) return;

    if (goboard.options.readonly || goboard.clientColor !== goboard.currentColor) {
      return;
    }

    const intersectionPoint = event.point.clone();
    planeRef.current.worldToLocal(intersectionPoint);

    const position = getValidBoardPosition(intersectionPoint);
    if (!position) return;

    goboard.shoot(position.boardX, position.boardY);
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (hoverCell) {
      gl.domElement.style.cursor = 'pointer';
    }

    if (controls) {
      // @ts-expect-error - disable orbit controls temporarily
      controls.enabled = false;
    }

    handleClick(event as unknown as ThreeEvent<MouseEvent>);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    gl.domElement.style.cursor = hoverCell ? 'pointer' : 'default';

    if (controls) {
      // @ts-expect-error - re-enable orbit controls
      controls.enabled = true;
    }
  };

  useEffect(() => {
    goboard.onSetHead((params: { col: number; row: number } | null) => {
      setLastPlacedStone(params);
    });
  }, [goboard]);

  useEffect(() => {
    if (!player) return;
    const onMove = () => setBoardVersion(v => v + 1);
    player.on('move', onMove);
    return () => {
      player.removeListener('move', onMove);
    };
  }, [player]);

  return (
    <>
      <mesh
        ref={planeRef}
        rotation-x={-Math.PI * 0.5}
        position-y={1.62}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        userData={{ board: true }}
      >
        <planeGeometry args={[boardScale, boardScale]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      {hoverCell && (
        <mesh position={boardToWorldPosition(hoverCell.col, hoverCell.row)} scale-y={0.4}>
          <sphereGeometry args={[0.07, 32, 32]} />
          <meshStandardMaterial
            color={goboard.currentColor === 1 ? '#000000' : '#ffffff'}
            transparent
            opacity={0.5}
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>
      )}

      {goboard.pieces.map((stoneValue: number, index: number) => {
        if (stoneValue === 0) return null;
        const row = Math.floor(index / boardSize);
        const col = index % boardSize;
        const position = boardToWorldPosition(col, row);
        const color = stoneValue === 1 ? 'black' : 'white';

        return <Stone key={index} position={position} color={color} />;
      })}

      {lastPlacedStone && (
        <Head
          position={boardToWorldPosition(lastPlacedStone.col, lastPlacedStone.row)}
          stoneColor={
            goboard.pieces[lastPlacedStone.row * boardSize + lastPlacedStone.col] === 1
              ? 'black'
              : 'white'
          }
        />
      )}
    </>
  );
}
