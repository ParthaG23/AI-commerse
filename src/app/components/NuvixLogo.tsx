import React from "react";

interface NuvixLogoProps {
  size?: number;
  glow?: boolean;
  className?: string;
}

export default function NuvixLogo({ size = 32, glow = true, className = "" }: NuvixLogoProps) {
  // Unique gradient and filter IDs to prevent collisions when multiple logos are rendered on a page
  const gradientId = "nuvix-logo-gradient";
  const filterId = "nuvix-logo-glow";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        {glow && (
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      {/* N lettermark */}
      <path
        d="M10 40V12L26 36V12M26 36V12L42 40"
        stroke={`url(#${gradientId})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={glow ? `url(#${filterId})` : undefined}
      />
      {/* accent dot */}
      <circle cx="42" cy="12" r="3.5" fill="#67e8f9" opacity="0.95" />
    </svg>
  );
}
