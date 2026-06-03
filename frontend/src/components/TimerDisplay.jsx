import React, { useEffect, useMemo, useState } from 'react';

const R = 38;
const C = 2 * Math.PI * R;

const TimerDisplay = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTimeLeft, setInitialTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expiresAt * 1000 - now) / 1000));
    setTimeLeft(remaining);
    setInitialTimeLeft(remaining > 0 ? remaining : 1);

    const interval = setInterval(() => {
      const currentRemaining = Math.max(0, Math.floor((expiresAt * 1000 - Date.now()) / 1000));
      setTimeLeft(currentRemaining);
      if (currentRemaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 250);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const percent = initialTimeLeft > 0 ? (timeLeft / initialTimeLeft) * 100 : 0;
  const offset = useMemo(() => C - (C * percent) / 100, [percent]);

  const state = timeLeft <= 5 ? 'danger' : timeLeft <= 10 ? 'warn' : 'safe';
  const accentVar = state === 'danger' ? 'var(--speed-red)' : state === 'warn' ? 'var(--speed-amber)' : 'var(--neon-cyan)';

  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');

  return (
    <div
      className="rg-timer"
      role="timer"
      aria-live="off"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.35rem 0.7rem 0.35rem 0.4rem',
        background: 'linear-gradient(180deg, rgba(11,15,25,0.85), rgba(5,7,16,0.55))',
        border: `1px solid ${accentVar}`,
        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        boxShadow: state === 'danger' ? '0 0 24px rgba(255,45,85,0.4)' : 'none',
        direction: 'ltr',
      }}
    >
      <div style={{ position: 'relative', width: 88, height: 88 }}>
        <svg viewBox="0 0 88 88" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="44" cy="44" r={R} fill="none" strokeWidth="6" stroke="rgba(199,208,224,0.10)" />
          <circle
            cx="44"
            cy="44"
            r={R}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            stroke={accentVar}
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${accentVar})`, transition: 'stroke-dashoffset 240ms linear, stroke 240ms' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: '1.05rem', color: state === 'danger' ? '#FFD3DD' : '#fff',
          textShadow: `0 0 10px ${accentVar}`,
          letterSpacing: '0.04em',
        }}>{m}:{s}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'var(--font-heading)' }}>
        <span style={{
          fontWeight: 800,
          fontSize: '0.65rem',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: accentVar,
          textShadow: `0 0 6px ${accentVar}`,
        }}>{state === 'danger' ? 'CRITICAL' : state === 'warn' ? 'PUSH IT' : 'LAP TIME'}</span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '0.72rem',
          color: 'var(--metallic-dim)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}>Time Remaining</span>
      </div>
    </div>
  );
};

export default TimerDisplay;
