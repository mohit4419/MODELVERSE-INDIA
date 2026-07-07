/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: number | string;
  className?: string;
  variant?: 'icon' | 'full' | 'compact';
}

export default function Logo({ size = 44, className = '', variant = 'icon' }: LogoProps) {
  const gradId = "gold-gradient-svg";

  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBA6B" />
            <stop offset="25%" stopColor="#F9E4B7" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="75%" stopColor="#A67C1E" />
            <stop offset="100%" stopColor="#DFBA6B" />
          </linearGradient>
        </defs>

        {/* Crown Base Curve */}
        <path
          d="M 28 34 C 40 37, 60 37, 72 34 L 70 37 L 30 37 Z"
          fill={`url(#${gradId})`}
        />
        {/* Crown Spikes */}
        <path
          d="M 28 34 L 20 15 L 36 24 L 50 4 L 64 24 L 80 15 L 72 34 Z"
          fill={`url(#${gradId})`}
        />
        {/* Star/Sparkle atop central spike */}
        <path
          d="M 50 -3 L 52 1 L 56 1 L 53 3 L 54 7 L 50 5 L 46 7 L 47 3 L 44 1 L 48 1 Z"
          fill={`url(#${gradId})`}
        />
        {/* Decorative beads on the tips of spikes */}
        <circle cx="20" cy="15" r="1.5" fill={`url(#${gradId})`} />
        <circle cx="80" cy="15" r="1.5" fill={`url(#${gradId})`} />
        <circle cx="36" cy="24" r="1.2" fill={`url(#${gradId})`} />
        <circle cx="64" cy="24" r="1.2" fill={`url(#${gradId})`} />

        {/* Stylized Serif "M" */}
        <text
          x="50%"
          y="88"
          textAnchor="middle"
          fontFamily="Cinzel, Playfair Display, Georgia, serif"
          fontSize="56"
          fontWeight="800"
          fill={`url(#${gradId})`}
          letterSpacing="-0.02em"
        >
          M
        </text>
      </svg>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-3 select-none ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFBA6B" />
              <stop offset="25%" stopColor="#F9E4B7" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="75%" stopColor="#A67C1E" />
              <stop offset="100%" stopColor="#DFBA6B" />
            </linearGradient>
          </defs>

          <path
            d="M 28 34 C 40 37, 60 37, 72 34 L 70 37 L 30 37 Z"
            fill={`url(#${gradId})`}
          />
          <path
            d="M 28 34 L 20 15 L 36 24 L 50 4 L 64 24 L 80 15 L 72 34 Z"
            fill={`url(#${gradId})`}
          />
          <path
            d="M 50 -3 L 52 1 L 56 1 L 53 3 L 54 7 L 50 5 L 46 7 L 47 3 L 44 1 L 48 1 Z"
            fill={`url(#${gradId})`}
          />
          <circle cx="20" cy="15" r="1.5" fill={`url(#${gradId})`} />
          <circle cx="80" cy="15" r="1.5" fill={`url(#${gradId})`} />
          <circle cx="36" cy="24" r="1.2" fill={`url(#${gradId})`} />
          <circle cx="64" cy="24" r="1.2" fill={`url(#${gradId})`} />

          <text
            x="50%"
            y="88"
            textAnchor="middle"
            fontFamily="Cinzel, Playfair Display, Georgia, serif"
            fontSize="56"
            fontWeight="800"
            fill={`url(#${gradId})`}
          >
            M
          </text>
        </svg>
        <div className="flex flex-col text-left">
          <span 
            className="text-sm font-extrabold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA6B] via-[#F9E4B7] to-[#A67C1E]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            MODELVERSEINDIA
          </span>
          <span 
            className="text-[8px] font-medium tracking-[0.1em] text-zinc-400"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            MODELS • INFLUENCERS • BRAND COLLABORATIONS
          </span>
        </div>
      </div>
    );
  }

  // Full Screen branding variant
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <svg
        width={typeof size === 'number' ? size : 80}
        height={typeof size === 'number' ? size : 80}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBA6B" />
            <stop offset="25%" stopColor="#F9E4B7" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="75%" stopColor="#A67C1E" />
            <stop offset="100%" stopColor="#DFBA6B" />
          </linearGradient>
        </defs>

        <path
          d="M 28 34 C 40 37, 60 37, 72 34 L 70 37 L 30 37 Z"
          fill={`url(#${gradId})`}
        />
        <path
          d="M 28 34 L 20 15 L 36 24 L 50 4 L 64 24 L 80 15 L 72 34 Z"
          fill={`url(#${gradId})`}
        />
        <path
          d="M 50 -3 L 52 1 L 56 1 L 53 3 L 54 7 L 50 5 L 46 7 L 47 3 L 44 1 L 48 1 Z"
          fill={`url(#${gradId})`}
        />
        <circle cx="20" cy="15" r="1.5" fill={`url(#${gradId})`} />
        <circle cx="80" cy="15" r="1.5" fill={`url(#${gradId})`} />
        <circle cx="36" cy="24" r="1.2" fill={`url(#${gradId})`} />
        <circle cx="64" cy="24" r="1.2" fill={`url(#${gradId})`} />

        <text
          x="50%"
          y="88"
          textAnchor="middle"
          fontFamily="Cinzel, Playfair Display, Georgia, serif"
          fontSize="56"
          fontWeight="800"
          fill={`url(#${gradId})`}
        >
          M
        </text>
      </svg>
      <div className="flex flex-col items-center">
        <h1 
          className="text-2xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA6B] via-[#F9E4B7] to-[#A67C1E] uppercase"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          MODELVERSEINDIA
        </h1>
        <p 
          className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase mt-2"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Models • Influencers • Brand Collaborations
        </p>
      </div>
    </div>
  );
}
