import React from 'react';

interface NovaLogoProps {
  className?: string;
  size?: number;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="nova-grad-a" x1="2" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(40% 0.17 232.661)" />
          <stop offset="0.5" stopColor="oklch(58% 0.17 232.661)" />
          <stop offset="1" stopColor="oklch(74.6% 0.16 232.661)" />
        </linearGradient>
        <linearGradient id="nova-grad-b" x1="8" y1="4" x2="30" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(30% 0.14 232.661)" />
          <stop offset="1" stopColor="oklch(50% 0.17 232.661)" />
        </linearGradient>
        <linearGradient id="nova-accent" x1="12" y1="8" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Primary Geometric Facet - Left Column & Diagonal Blade */}
      <path
        d="M6 26V6C6 4.89543 6.89543 4 8 4H10.5C11.5 4 12.3 4.5 12.8 5.4L22 20.8V6C22 4.89543 22.8954 4 24 4H25C26.1046 4 27 4.89543 27 6V26C27 27.1046 26.1046 28 25 28H22.5C21.5 28 20.7 27.5 20.2 26.6L11 11.2V26C11 27.1046 10.1046 28 9 28H8C6.89543 28 6 27.1046 6 26Z"
        fill="url(#nova-grad-a)"
      />

      {/* High-Tech Precision Intersect Notch */}
      <circle cx="16.5" cy="16" r="2.2" fill="url(#nova-accent)" />
    </svg>
  );
};
