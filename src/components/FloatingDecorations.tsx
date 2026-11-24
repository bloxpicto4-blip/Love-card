import React from 'react';

interface FloatingDecorationsProps {
  enabled: boolean;
  accentColor: string;
}

function RoseSvg({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M32 14C25 14 20 19 20 26C20 33 25 38 32 38C39 38 44 33 44 26C44 19 39 14 32 14Z"
        fill={color}
        fillOpacity="0.22"
      />
      <path
        d="M32 18C27 18 24 21 24 26C24 31 28 34 32 34C36 34 40 31 40 26C40 21 37 18 32 18Z"
        stroke={color}
        strokeOpacity="0.48"
        strokeWidth="1.6"
      />
      <path
        d="M32 22C29.5 22 28 24 28 26.5C28 29 30 30.5 32.5 30.5C35 30.5 36.5 28.5 36.5 26"
        stroke={color}
        strokeOpacity="0.58"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M32 38V54M32 45C27 44 23 41 21 37M32 48C37 47 41 44 43 40"
        stroke="#6D8B74"
        strokeOpacity="0.45"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ButterflySvg({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M32 28C26 14 10 12 12 27C13 35 24 36 32 32C40 36 51 35 52 27C54 12 38 14 32 28Z"
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeOpacity="0.45"
        strokeWidth="1.4"
      />
      <path
        d="M32 32C26 36 16 42 19 49C22 54 29 49 32 38C35 49 42 54 45 49C48 42 38 36 32 32Z"
        fill={color}
        fillOpacity="0.14"
        stroke={color}
        strokeOpacity="0.4"
        strokeWidth="1.3"
      />
      <path
        d="M32 22V44M32 22C30 18 28 16 26 15M32 22C34 18 36 16 38 15"
        stroke={color}
        strokeOpacity="0.55"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartSvg({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M24 41C24 41 7 30.2 7 17.8C7 12.2 11.4 8 16.6 8C19.8 8 22.6 9.6 24 12.1C25.4 9.6 28.2 8 31.4 8C36.6 8 41 12.2 41 17.8C41 30.2 24 41 24 41Z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const RISING_HEARTS = [
  { left: '8%', size: 16, delay: '0s', duration: '13s' },
  { left: '19%', size: 22, delay: '3.5s', duration: '15s' },
  { left: '31%', size: 14, delay: '7s', duration: '12s' },
  { left: '46%', size: 18, delay: '1.8s', duration: '16s' },
  { left: '62%', size: 20, delay: '5.2s', duration: '14s' },
  { left: '74%', size: 15, delay: '8.5s', duration: '13.5s' },
  { left: '85%', size: 24, delay: '2.4s', duration: '15.5s' },
  { left: '93%', size: 16, delay: '6.1s', duration: '12.5s' },
];

export const FloatingDecorations: React.FC<FloatingDecorationsProps> = ({
  enabled,
  accentColor,
}) => {
  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Continuous Rising Ambient Hearts */}
      {RISING_HEARTS.map((h, i) => (
        <div
          key={`rising-heart-${i}`}
          className="animate-heart-rise absolute -bottom-10"
          style={{
            left: h.left,
            width: h.size,
            height: h.size,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          <HeartSvg className="w-full h-full" color={accentColor} />
        </div>
      ))}

      {/* Top Right Rose */}
      <div
        className="animate-float-drift absolute top-20 right-[4%] w-16 h-16 opacity-65"
        style={{ animationDelay: '0s' }}
      >
        <RoseSvg className="w-full h-full" color={accentColor} />
      </div>

      {/* Top Left Butterfly */}
      <div
        className="animate-float-drift absolute top-32 left-[6%] w-14 h-14 opacity-60"
        style={{ animationDelay: '1.8s', animationDuration: '10.5s' }}
      >
        <ButterflySvg className="w-full h-full" color={accentColor} />
      </div>

      {/* Mid Right Heart */}
      <div
        className="animate-float-drift absolute top-[45%] right-[5%] w-10 h-10 opacity-55"
        style={{ animationDelay: '3.2s', animationDuration: '8.5s' }}
      >
        <HeartSvg className="w-full h-full" color={accentColor} />
      </div>

      {/* Mid Left Rose */}
      <div
        className="animate-float-drift absolute top-[58%] left-[4%] w-16 h-16 opacity-55"
        style={{ animationDelay: '2.4s', animationDuration: '11s' }}
      >
        <RoseSvg className="w-full h-full" color={accentColor} />
      </div>

      {/* Lower Right Butterfly */}
      <div
        className="animate-float-drift absolute bottom-36 right-[8%] w-12 h-12 opacity-60"
        style={{ animationDelay: '4s', animationDuration: '9.5s' }}
      >
        <ButterflySvg className="w-full h-full" color={accentColor} />
      </div>

      {/* Lower Left Heart */}
      <div
        className="animate-float-drift absolute bottom-44 left-[7%] w-11 h-11 opacity-55"
        style={{ animationDelay: '1s', animationDuration: '10s' }}
      >
        <HeartSvg className="w-full h-full" color={accentColor} />
      </div>
    </div>
  );
};
