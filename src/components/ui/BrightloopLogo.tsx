'use client';

import React from 'react';

export type LogoPalette =
  | 'cream'
  | 'solar'
  | 'fintech'
  | 'odoo'
  | 'emerald'
  | 'customer'
  | 'admin'
  | 'sales';

interface BrightloopLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  palette?: LogoPalette;
}

export function BrightloopLogo({
  className = '',
  size = 40,
  showWordmark = true,
  palette = 'cream',
}: BrightloopLogoProps) {
  // Palette color definitions for dynamic SVG gradient styling
  const palettes = {
    cream: {
      from: '#C89666',
      mid: '#DDB892',
      to: '#A36E43',
      glow: '#DDB892',
      dot: '#C89666',
      accentText: 'from-[#A36E43] via-[#C89666] to-[#B07D4F]',
    },
    customer: {
      from: '#C89666',
      mid: '#DDB892',
      to: '#A36E43',
      glow: '#DDB892',
      dot: '#C89666',
      accentText: 'from-[#A36E43] via-[#C89666] to-[#B07D4F]',
    },
    admin: {
      from: '#C89666',
      mid: '#DDB892',
      to: '#A36E43',
      glow: '#DDB892',
      dot: '#C89666',
      accentText: 'from-[#A36E43] via-[#C89666] to-[#B07D4F]',
    },
    sales: {
      from: '#C89666',
      mid: '#DDB892',
      to: '#A36E43',
      glow: '#DDB892',
      dot: '#C89666',
      accentText: 'from-[#A36E43] via-[#C89666] to-[#B07D4F]',
    },
    solar: {
      from: '#4F46E5', // Electric Indigo
      mid: '#7C3AED',  // Violet
      to: '#F59E0B',   // Solar Amber
      glow: '#6366F1',
      dot: '#F59E0B',
      accentText: 'from-indigo-600 via-indigo-500 to-amber-500',
    },
    fintech: {
      from: '#2563EB', // Royal Blue
      mid: '#0284C7',  // Sky Blue
      to: '#06B6D4',   // Neon Cyan
      glow: '#0284C7',
      dot: '#06B6D4',
      accentText: 'from-blue-600 via-sky-500 to-cyan-500',
    },
    odoo: {
      from: '#714B67', // Odoo Signature Plum
      mid: '#9333EA',  // Purple
      to: '#F97316',   // Coral Orange
      glow: '#714B67',
      dot: '#F97316',
      accentText: 'from-purple-800 via-purple-600 to-orange-500',
    },
    emerald: {
      from: '#059669', // Emerald
      mid: '#10B981',  // Mint Green
      to: '#34D399',   // Cyber Neon
      glow: '#10B981',
      dot: '#10B981',
      accentText: 'from-emerald-600 via-teal-500 to-emerald-400',
    },
  };

  const activeColors = palettes[palette] || palettes.solar;
  const gradientId = `bl-grad-${palette}`;
  const filterId = `bl-glow-${palette}`;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Brand New Icon: The "B-Loop" Interlocking Möbius Monogram */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Dynamic 3-Stop Linear Gradient */}
          <linearGradient id={gradientId} x1="6" y1="6" x2="46" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={activeColors.from} />
            <stop offset="50%" stopColor={activeColors.mid} />
            <stop offset="100%" stopColor={activeColors.to} />
          </linearGradient>

          {/* Ribbon Depth Shading Gradient */}
          <linearGradient id={`${gradientId}-shade`} x1="18" y1="18" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Subtle Ambient Drop Glow */}
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={activeColors.glow} floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Outer Continuous Infinity Backbone forming an iconic 'B' */}
        <path
          d="M 12 10 
             L 26 10 
             C 33 10 39 15 39 22 
             C 39 27 35 31 30 32
             C 37 33 42 38 42 44
             C 42 50 35 54 26 54
             L 12 54
             Z"
          fill="none"
        />

        {/* Precision Ribbon: Left Stem Arc */}
        <rect
          x="8"
          y="8"
          width="8"
          height="36"
          rx="4"
          fill={`url(#${gradientId})`}
          filter={`url(#${filterId})`}
        />

        {/* Upper Loop Ribbon (Forms the upper curve of B + Loop) */}
        <path
          d="M 16 12 
             C 24 10 35 12 37 19 
             C 39 26 31 30 20 28 
             L 16 27"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
        />

        {/* Lower Expanding Loop Ribbon (The Infinite Recurring Horizon) */}
        <path
          d="M 16 27 
             C 26 27 42 29 42 38 
             C 42 46 28 46 16 43"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
        />

        {/* Central Interlocking Orbit Spark */}
        <circle cx="27" cy="27" r="3.2" fill={activeColors.dot} className="animate-pulse" />

        {/* Shadow overlap for realistic 3D ribbon effect */}
        <path
          d="M 16 25 C 20 26 24 27 26 28"
          stroke={`url(#${gradientId}-shade)`}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-baseline tracking-tight">
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight font-sans">
              Bright
            </span>
            <span className={`font-black text-2xl bg-gradient-to-r ${activeColors.accentText} bg-clip-text text-transparent ml-0.5`}>
              loop
            </span>
            <span
              className="w-2 h-2 rounded-full ml-1 inline-block"
              style={{ backgroundColor: activeColors.dot }}
            />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
            Billing Platform
          </span>
        </div>
      )}
    </div>
  );
}
