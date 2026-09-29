interface WaveDividerProps {
  className?: string;
  color?: string;
  flip?: boolean;
  speed?: 'slow' | 'normal';
}

export function WaveDivider({
  className = '',
  color = '#ffffff',
  flip = false,
  speed = 'normal',
}: WaveDividerProps) {
  const animClass = speed === 'slow' ? 'animate-wave-move-slow' : 'animate-wave-move';

  return (
    <div
      className={`pointer-events-none relative w-full overflow-hidden leading-[0] ${className}`}
      style={{ transform: flip ? 'rotate(180deg)' : undefined }}
      aria-hidden="true"
    >
      <svg
        className={`relative block h-[60px] w-[200%] ${animClass}`}
        viewBox="0 0 2880 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,40 C240,70 480,10 720,35 C960,60 1200,20 1440,45 C1680,70 1920,15 2160,40 C2400,65 2640,25 2880,45 L2880,80 L0,80 Z"
          fill={color}
          opacity="0.5"
        />
      </svg>
      <svg
        className={`absolute inset-0 block h-[60px] w-[200%] ${animClass}`}
        viewBox="0 0 2880 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDelay: '3s' }}
      >
        <path
          d="M0,50 C240,25 480,65 720,45 C960,25 1200,60 1440,40 C1680,20 1920,55 2160,35 C2400,15 2640,50 2880,35 L2880,80 L0,80 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
