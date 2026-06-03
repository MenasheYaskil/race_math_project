import React from 'react';

// --- Asset imports ---
import carRed    from '../assets/cars/car-red.png';
import carCyan   from '../assets/cars/car-cyan.png';
import carYellow from '../assets/cars/car-yellow.png';
import carGreen  from '../assets/cars/car-green.png';
import carOrange from '../assets/cars/car-orange.png';
import carBlue   from '../assets/cars/car-blue.png';
import carPink   from '../assets/cars/car-pink.png';
import carPurple from '../assets/cars/car-purple.png';

// --- Public API: color palette (order must not change) ---
export const neonColors = [
  '#bc13fe', // PURPLE
  '#ff00ff', // PINK
  '#00f3ff', // BLUE
  '#ffaa00', // ORANGE
  '#00ff00', // GREEN
  '#ffff00', // YELLOW
  '#00ffff', // CYAN
  '#ff0000'  // RED
];

// --- Color → asset map (lowercase keys) ---
const carAssets = {
  '#bc13fe': carPurple,
  '#ff00ff': carPink,
  '#00f3ff': carBlue,
  '#ffaa00': carOrange,
  '#00ff00': carGreen,
  '#ffff00': carYellow,
  '#00ffff': carCyan,
  '#ff0000': carRed,
};

// --- Public API: color assignment helper (unchanged logic) ---
export const getParticipantColor = (participant, allParticipants = [], fallbackIndex = 0) => {
  if (!participant) return neonColors[fallbackIndex % 8];

  const getStableId = (p, idx) => {
    if (!p) return `fallback_${idx}`;
    if (p.id !== undefined && p.id !== null) return String(p.id);
    if (p.userId !== undefined && p.userId !== null) return String(p.userId);
    return `fallback_${idx}`;
  };

  const targetId = getStableId(participant, fallbackIndex);

  const validParticipants = allParticipants.map((p, idx) => ({
    original: p,
    id: getStableId(p, idx)
  })).filter(p => p.original !== null && p.original !== undefined);

  const uniqueIds = Array.from(new Set(validParticipants.map(p => p.id)));

  uniqueIds.sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });

  const colorIndex = uniqueIds.indexOf(targetId);
  if (colorIndex !== -1) {
    return neonColors[colorIndex % 8];
  }

  return neonColors[fallbackIndex % 8];
};

// --- CarIcon component ---
const CarIcon = ({ color = '#bc13fe', width = 60, height = 30, style = {} }) => {
  const normalizedColor = (color || '').toLowerCase().trim();
  const asset = carAssets[normalizedColor];

  // --- Image asset path: real Lamborghini car ---
  if (asset) {
    const glowColor = normalizedColor;
    return (
      <img
        src={asset}
        className="car-icon-asset"
        alt=""
        style={{
          width,
          height,
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
          filter: `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 12px ${glowColor})`,
          ...style,
        }}
      />
    );
  }

  // --- Fallback SVG: only for unknown / unmapped colors ---
  const cleanColor = color.replace('#', '');
  const glowId   = `neon-glow-${cleanColor}-fb`;
  const gradId   = `body-grad-${cleanColor}-fb`;
  const metalId  = `metal-grad-fb`;
  const winId    = `window-grad-${cleanColor}-fb`;

  return (
    <svg
      className="car-icon-fallback-svg"
      width={width}
      height={height}
      viewBox="0 0 160 80"
      style={{ overflow: 'visible', ...style }}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur1" />
          <feGaussianBlur stdDeviation="4" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={color} stopOpacity="0.8" />
          <stop offset="40%"  stopColor="#1a1a2e" stopOpacity="0.9" />
          <stop offset="80%"  stopColor="#0f0f1a" stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={metalId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="50%"  stopColor="#888888" />
          <stop offset="100%" stopColor="#333333" />
        </linearGradient>
        <linearGradient id={winId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#000000" stopOpacity="0.9" />
          <stop offset="40%"  stopColor="#1a1a2e" stopOpacity="0.8" />
          <stop offset="50%"  stopColor={color}   stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <g opacity="0.8">
        <line x1="-10" y1="35" x2="15"  y2="35" stroke={color} strokeWidth="1.5" strokeDasharray="10 5"  filter={`url(#${glowId})`} />
        <line x1="-30" y1="45" x2="10"  y2="45" stroke={color} strokeWidth="2.5" strokeDasharray="15 8"  filter={`url(#${glowId})`} />
        <line x1="0"   y1="58" x2="20"  y2="58" stroke={color} strokeWidth="1"   strokeDasharray="5 3"   filter={`url(#${glowId})`} />
        <line x1="-20" y1="70" x2="40"  y2="70" stroke={color} strokeWidth="2"   strokeDasharray="20 10" filter={`url(#${glowId})`} />
      </g>

      <ellipse cx="80" cy="72" rx="65" ry="6" fill={color} opacity="0.4" filter={`url(#${glowId})`} />
      <ellipse cx="80" cy="71" rx="50" ry="3" fill={color} opacity="0.7" filter={`url(#${glowId})`} />
      <path d="M 8 62 L 155 62 L 148 70 L 15 70 Z" fill="#000000" opacity="0.6" />

      <path
        d="M 12 48 L 10 38 L 18 36 L 25 35 L 40 37 L 62 25 L 75 24 L 105 38 L 135 44 L 152 54 L 148 64 L 131 55 L 127 42 L 103 42 L 99 55 L 50 64 L 49 55 L 45 42 L 21 42 L 17 55 L 12 58 Z"
        fill={`url(#${gradId})`} stroke={color} strokeWidth="1.5" strokeLinejoin="round" filter={`url(#${glowId})`}
      />
      <path d="M 62 25 L 75 24 L 105 38 L 135 44 L 152 54 L 148 57 L 130 48 L 100 42 L 72 29 Z" fill="#ffffff" opacity="0.1" />
      <path d="M 10 38 L 18 36 L 40 37 L 62 25 L 45 40 L 25 40 Z" fill="#ffffff" opacity="0.05" />
      <path d="M 52 62 L 95 56 L 90 48 L 60 48 Z" fill="#050508" stroke={color} strokeWidth="0.8" opacity="0.9" />
      <path d="M 55 52 L 45 42 L 65 42 L 85 52 Z" fill="#000000" stroke={color} strokeWidth="0.5" />
      <line x1="53" y1="45" x2="65" y2="45" stroke="#222" strokeWidth="1" />
      <line x1="51" y1="48" x2="70" y2="48" stroke="#222" strokeWidth="1" />
      <path d="M 64 27 L 76 26 L 100 37 L 85 39 L 60 39 Z" fill={`url(#${winId})`} stroke={color} strokeWidth="1"   strokeLinejoin="round" />
      <path d="M 45 38 L 57 28 L 62 27 L 57 39 Z"           fill={`url(#${winId})`} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M 66 28 L 75 27 L 90 34" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
      <path d="M 65 42 L 100 48 L 120 48" fill="none" stroke={color} strokeWidth="0.5" opacity="0.6" />
      <path d="M 30 40 L 40 44 L 60 44"  fill="none" stroke={color} strokeWidth="0.5" opacity="0.6" />
      <path d="M 130 45 L 140 48"         fill="none" stroke={color} strokeWidth="0.5" opacity="0.6" />
      <path d="M 105 38 L 125 42 L 148 50 L 152 54" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
      <path d="M 135 44 L 145 46" fill="none" stroke="#000" strokeWidth="2" />
      <path d="M 150 58 L 148 64 L 131 55" fill="none" stroke={color} strokeWidth="2" filter={`url(#${glowId})`} />
      <path d="M 12 58 L 10 62 L 20 62" fill="#000" stroke={color} strokeWidth="1" />
      <path d="M 17 55 L 12 58 L 10 50" fill="none" stroke={color} strokeWidth="2" filter={`url(#${glowId})`} />
      <circle cx="14" cy="56" r="2" fill="#111" stroke={`url(#${metalId})`} strokeWidth="1" />
      <circle cx="14" cy="56" r="0.5" fill={color} filter={`url(#${glowId})`} />
      <path d="M 10 38 L 8 32 L 22 30 L 25 35" fill="#0a0a12" stroke={color} strokeWidth="1" />
      <path d="M 18 36 L 18 31" fill="none" stroke={color} strokeWidth="2" />
      <line x1="8" y1="32" x2="22" y2="30" stroke={color} strokeWidth="2" filter={`url(#${glowId})`} />
      <path d="M 135 46 L 148 49 L 143 51 L 132 48 Z" fill="#ffffff" filter={`url(#${glowId})`} />
      <path d="M 135 46 L 148 49" stroke="#ffffff" strokeWidth="2" filter={`url(#${glowId})`} />
      <path d="M 10 42 L 15 44 L 14 46 L 9 44 Z" fill="#ff003c" filter={`url(#${glowId})`} />
      <line x1="10" y1="42" x2="15" y2="44" stroke="#ff003c" strokeWidth="2" filter={`url(#${glowId})`} />
      <path d="M 17 48 L 21 40 L 45 40 L 49 48" fill="none" stroke={color} strokeWidth="1.5" filter={`url(#${glowId})`} opacity="0.8" />
      <path d="M 99 48 L 103 40 L 127 40 L 131 48" fill="none" stroke={color} strokeWidth="1.5" filter={`url(#${glowId})`} opacity="0.8" />

      <g transform="translate(33, 55)">
        <circle cx="0" cy="0" r="14" fill="#050508" stroke="#111" strokeWidth="2" />
        <circle cx="0" cy="0" r="11" fill="none" stroke={color} strokeWidth="1.5" filter={`url(#${glowId})`} />
        <circle cx="0" cy="0" r="11" fill="none" stroke={`url(#${metalId})`} strokeWidth="0.5" />
        <path d="M 6 -7 A 9 9 0 0 1 10 0 L 7 0 A 6 6 0 0 0 4 -5 Z" fill={color} />
        <g stroke={color} strokeWidth="1.2" opacity="0.9">
          <line x1="-11" y1="0" x2="11" y2="0" />
          <line x1="0" y1="-11" x2="0" y2="11" />
          <line x1="-7.78" y1="-7.78" x2="7.78" y2="7.78" />
          <line x1="-7.78" y1="7.78" x2="7.78" y2="-7.78" />
        </g>
        <g stroke={`url(#${metalId})`} strokeWidth="0.8" opacity="0.6">
          <line x1="-10.16" y1="-4.21" x2="10.16" y2="4.21" />
          <line x1="-10.16" y1="4.21"  x2="10.16" y2="-4.21" />
          <line x1="-4.21" y1="-10.16" x2="4.21" y2="10.16" />
          <line x1="-4.21" y1="10.16"  x2="4.21" y2="-10.16" />
        </g>
        <circle cx="0" cy="0" r="3" fill="#000" stroke={color} strokeWidth="1" />
        <circle cx="0" cy="0" r="1" fill="#fff" />
      </g>

      <g transform="translate(115, 55)">
        <circle cx="0" cy="0" r="14" fill="#050508" stroke="#111" strokeWidth="2" />
        <circle cx="0" cy="0" r="11" fill="none" stroke={color} strokeWidth="1.5" filter={`url(#${glowId})`} />
        <circle cx="0" cy="0" r="11" fill="none" stroke={`url(#${metalId})`} strokeWidth="0.5" />
        <path d="M 6 -7 A 9 9 0 0 1 10 0 L 7 0 A 6 6 0 0 0 4 -5 Z" fill={color} />
        <g stroke={color} strokeWidth="1.2" opacity="0.9">
          <line x1="-11" y1="0" x2="11" y2="0" />
          <line x1="0" y1="-11" x2="0" y2="11" />
          <line x1="-7.78" y1="-7.78" x2="7.78" y2="7.78" />
          <line x1="-7.78" y1="7.78" x2="7.78" y2="-7.78" />
        </g>
        <g stroke={`url(#${metalId})`} strokeWidth="0.8" opacity="0.6">
          <line x1="-10.16" y1="-4.21" x2="10.16" y2="4.21" />
          <line x1="-10.16" y1="4.21"  x2="10.16" y2="-4.21" />
          <line x1="-4.21" y1="-10.16" x2="4.21" y2="10.16" />
          <line x1="-4.21" y1="10.16"  x2="4.21" y2="-10.16" />
        </g>
        <circle cx="0" cy="0" r="3" fill="#000" stroke={color} strokeWidth="1" />
        <circle cx="0" cy="0" r="1" fill="#fff" />
      </g>
    </svg>
  );
};

export default CarIcon;
