import { useEffect, useRef } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface RiveAnimProps {
  src: string;
  stateMachineName?: string;
  artboard?: string;
  className?: string;
}

export function RiveAnim({ src, stateMachineName, artboard, className }: RiveAnimProps) {
  const { RiveComponent } = useRive({
    src,
    stateMachines: stateMachineName ? [stateMachineName] : undefined,
    artboard,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  return <RiveComponent className={className} />;
}
