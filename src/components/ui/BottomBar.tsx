import React, { useEffect, useRef, useState } from 'react';
import GoboardPlayer from '../go/GoboardPlayer';
import NavigationButton from './NavigationButton';

const SVG_PATHS = {
  toStart:
    'M5.41 10l5.3-5.3a1 1 0 1 0-1.42-1.4l-6 6a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.42-1.4L5.4 10zM13.41 10l5.3-5.3a1 1 0 1 0-1.42-1.4l-6 6a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.42-1.4L13.4 10z',
  backward5:
    'M8.445 14.832A1 1 0 0 0 10 14v-2.798l5.445 3.63A1 1 0 0 0 17 14V6a1 1 0 0 0-1.555-.832L10 8.798V6a1 1 0 0 0-1.555-.832l-6 4a1 1 0 0 0 0 1.664l6 4z',
  backward1: 'M8.445 14.832A1 1 0 0 0 10 14V6a1 1 0 0 0-1.555-.832l-6 4a1 1 0 0 0 0 1.664l6 4z',
  forward1: 'M11.555 14.832l6-4a1 1 0 0 0 0-1.664l-6-4A1 1 0 0 0 10 6v8a1 1 0 0 0 1.555.832z',
  forward5:
    'M11.555 14.832l6-4a1 1 0 0 0 0-1.664l-6-4A1 1 0 0 0 10 6v8a1 1 0 0 0 1.555.832zM3.555 14.832l6-4a1 1 0 0 0 0-1.664l-6-4A1 1 0 0 0 2 6v8a1 1 0 0 0 1.555.832z',
  toEnd:
    'M14.59 10l-5.3-5.3a1 1 0 1 1 1.42-1.4l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.42-1.4L14.6 10zM6.59 10l-5.3-5.3a1 1 0 1 1 1.42-1.4l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.42-1.4L6.6 10z',
};

interface IProps {
  player?: GoboardPlayer;
}

const BottomBar = (props: IProps) => {
  const { player } = props;

  const [currentStep, setCurrentStep] = useState(0);
  const [totalStep, setTotalStep] = useState(0);

  useEffect(() => {
    if (player) {
      player.on('move', ({ currentStep }: { currentStep: number }) => {
        setCurrentStep(currentStep);
        setTotalStep(player.totalStep);
      });
    }
  }, [player]);

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 py-3 flex items-center justify-center z-10">
      <div className="flex items-center gap-8">
        <div className="text-lg text-white">第{currentStep}步</div>
        <div className="flex items-center space-x-4">
          <NavigationButton onClick={() => player?.toStart()} path={SVG_PATHS.toStart} />
          <NavigationButton onClick={() => player?.goStep(-5)} path={SVG_PATHS.backward5} />
          <NavigationButton onClick={() => player?.goStep(-1)} path={SVG_PATHS.backward1} />
          <NavigationButton onClick={() => player?.goStep(1)} path={SVG_PATHS.forward1} />
          <NavigationButton onClick={() => player?.goStep(5)} path={SVG_PATHS.forward5} />
          <NavigationButton onClick={() => player?.toEnd()} path={SVG_PATHS.toEnd} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(BottomBar);
