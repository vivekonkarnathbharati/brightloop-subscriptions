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
}: BrightloopLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Golden B Monogram Logo */}
      <img
        src="/logo.png"
        alt="Brightloop"
        width={size}
        height={size}
        className="shrink-0 object-contain transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size }}
      />

      {/* Brand Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-baseline tracking-tight">
            <span className="font-extrabold text-2xl text-[#2C2621] tracking-tight font-sans">
              Bright
            </span>
            <span className="font-black text-2xl bg-gradient-to-r from-[#C29367] via-[#B88457] to-[#8A5626] bg-clip-text text-transparent ml-0.5">
              loop
            </span>
            <span className="w-1.5 h-1.5 rounded-full ml-1 inline-block bg-[#C29367]" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7D70] mt-0.5">
            Billing Platform
          </span>
        </div>
      )}
    </div>
  );
}
