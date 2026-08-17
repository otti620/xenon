import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = false, textColor = 'text-white' }) => {
  const sizeMap = {
    sm: 'w-7 h-7 rounded-lg text-xs p-1',
    md: 'w-10 h-10 rounded-xl text-sm p-1.5',
    lg: 'w-16 h-16 rounded-2xl text-base p-2',
    xl: 'w-20 h-20 rounded-2xl text-lg p-2.5',
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative bg-gradient-to-br from-[#2a0e2a] via-[#1f0b24] to-[#120417] shadow-lg shadow-purple-900/30 border border-pink-500/30 flex flex-col items-center justify-center overflow-hidden shrink-0 ${sizeMap[size]}`}>
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#f02aa6_1px,transparent_1px),linear-gradient(to_bottom,#f02aa6_1px,transparent_1px)] bg-[size:6px_6px]" />
        
        {/* Glowing Robot / Piggy icon */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(240,42,166,0.8)]">
          {/* Antenna */}
          <circle cx="50" cy="18" r="6" fill="#f02aa6" />
          <line x1="50" y1="18" x2="50" y2="30" stroke="#f02aa6" strokeWidth="4" strokeLinecap="round" />
          {/* Head/Body */}
          <rect x="25" y="30" width="50" height="42" rx="14" fill="#ea2cb6" />
          {/* Ears */}
          <circle cx="20" cy="40" r="6" fill="#f02aa6" />
          <circle cx="80" cy="40" r="6" fill="#f02aa6" />
          {/* Eyes */}
          <circle cx="40" cy="48" r="4" fill="#ffffff" />
          <circle cx="60" cy="48" r="4" fill="#ffffff" />
          <circle cx="40" cy="48" r="2" fill="#1f0b24" />
          <circle cx="60" cy="48" r="2" fill="#1f0b24" />
          {/* Cheeks */}
          <circle cx="34" cy="56" r="3" fill="#ff7ce0" opacity="0.8" />
          <circle cx="66" cy="56" r="3" fill="#ff7ce0" opacity="0.8" />
          {/* Happy Mouth */}
          <path d="M 44 58 Q 50 65 56 58" stroke="#1f0b24" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Belly Coin slot */}
          <rect x="42" y="24" width="16" height="3" rx="1.5" fill="#fdebf6" />
        </svg>

        {/* Small brand text inside logo card if size is large */}
        {(size === 'lg' || size === 'xl') && (
          <div className="text-[7px] font-extrabold tracking-tight text-white uppercase text-center mt-0.5 leading-none z-10">
            XEN<span className="text-[#f02aa6]">OVA</span>
          </div>
        )}
      </div>

      {showText && (
        <span className={`font-bold text-lg tracking-tight ${textColor}`}>
          XEN<span className="text-[#e02db4]">OVA</span>
        </span>
      )}
    </div>
  );
};
