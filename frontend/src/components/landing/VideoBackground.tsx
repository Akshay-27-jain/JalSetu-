interface VideoBackgroundProps {
  videoUrl: string;
  posterUrl?: string;
  className?: string;
}

export function VideoBackground({
  videoUrl,
  posterUrl,
  className = '',
}: VideoBackgroundProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <video
        className="h-full w-full object-cover scale-105"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterUrl}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Cinematic dark tint with brand vignette for maximum readability */}
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950/80" />
    </div>
  );
}
