import React from 'react';
import CarIcon, { getParticipantColor } from './CarIcon';

const MAX_SLOTS = 8;

const ParticipantList = ({ participants, variant = 'standard', currentUserId = null }) => {
  const safeParticipants = participants || [];

  // ---- Phase 2: Racing-grid (chamfered 8-slot starting grid) ----
  if (variant === 'racing-grid' || variant === 'racing-grid-fill') {
    const fillEmpty = variant === 'racing-grid-fill';
    const listToRender = fillEmpty
      ? Array.from({ length: MAX_SLOTS }, (_, i) => safeParticipants[i] || null)
      : safeParticipants;

    if (!fillEmpty && listToRender.length === 0) {
      return <div className="rg-lb-empty">עדיין אין משתתפים על הגריד…</div>;
    }

    return (
      <div className="rg-grid">
        {listToRender.map((p, index) => {
          const color = getParticipantColor(p, safeParticipants, index);
          const lane = index + 1;
          if (!p) {
            return (
              <div key={`empty-${index}`} className="rg-slot is-empty">
                <span className="rg-slot-num">{lane.toString().padStart(2, '0')}</span>
                <div className="rg-slot-car" aria-hidden="true">
                  <svg width="68" height="32" viewBox="0 0 40 20" fill="rgba(199,208,224,0.18)">
                    <path d="M5 15 L 5 5 L 10 5 L 15 0 L 30 0 L 35 5 L 35 15 Z" />
                    <circle cx="10" cy="15" r="4" fill="rgba(0,0,0,0.5)" />
                    <circle cx="30" cy="15" r="4" fill="rgba(0,0,0,0.5)" />
                  </svg>
                </div>
                <div className="rg-slot-name">ממתין</div>
                <div className="rg-slot-status">Lane Open</div>
              </div>
            );
          }
          const isMe = currentUserId && (p.id === currentUserId || p.userId === currentUserId);
          return (
            <div
              key={p.id || p.userId || index}
              className={`rg-slot is-filled ${isMe ? 'is-me' : ''}`}
              style={{ '--lane-color': color }}
            >
              <span className="rg-slot-num">{lane.toString().padStart(2, '0')}</span>
              <div className="rg-slot-car"><CarIcon color={color} width={78} height={36} /></div>
              <div className="rg-slot-name">{p.displayName}{isMe ? ' · אתה' : ''}</div>
              <div className="rg-slot-status">Engine Ready</div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---- Legacy paths (left intact for other screens) ----
  if (variant !== 'teacher' && safeParticipants.length === 0) {
    return <div className="lobby-empty">עדיין אין משתתפים...</div>;
  }

  const listToRender = variant === 'teacher'
    ? Array.from({ length: MAX_SLOTS }, (_, i) => safeParticipants[i] || null)
    : safeParticipants;

  return (
    <div className={`lobby-roster ${variant === 'teacher' ? 'teacher-roster' : ''}`}>
      {listToRender.map((p, index) => {
        const color = getParticipantColor(p, safeParticipants, index);

        if (!p) {
          return (
            <div key={`empty-${index}`} className="roster-item roster-box empty-slot">
              <div className="roster-slot-num" style={{ background: 'rgba(255,255,255,0.1)', color: '#888' }}>{index + 1}</div>
              <div className="roster-avatar-empty" style={{ marginTop: '4px' }}>
                <svg width="60" height="30" viewBox="0 0 40 20" fill="rgba(255,255,255,0.1)">
                  <path d="M5 15 L 5 5 L 10 5 L 15 0 L 30 0 L 35 5 L 35 15 Z" />
                  <circle cx="10" cy="15" r="4" fill="rgba(0,0,0,0.5)" />
                  <circle cx="30" cy="15" r="4" fill="rgba(0,0,0,0.5)" />
                </svg>
              </div>
              <div className="roster-name-empty">ממתין...</div>
            </div>
          );
        }

        const isMe = currentUserId && p.id === currentUserId;

        return (
          <div key={p.id || index} className={`roster-item ${variant === 'teacher' ? 'roster-box' : ''}`} style={variant === 'teacher' ? { borderColor: color, boxShadow: `0 0 10px ${color}33, inset 0 0 10px ${color}33` } : {}}>
            {variant === 'teacher' && (
              <div className="roster-slot-num" style={{ background: color, color: '#111', textShadow: 'none' }}>{index + 1}</div>
            )}
            <div className="roster-avatar" style={variant === 'teacher' ? { border: 'none', boxShadow: 'none' } : { borderColor: color, boxShadow: `0 0 10px ${color}, inset 0 0 10px ${color}` }}>
              {variant === 'teacher' ? (
                <CarIcon color={color} width={80} height={40} style={{ marginTop: '2px' }} />
              ) : (
                <CarIcon color={color} width={40} height={20} />
              )}
            </div>
            <div className="roster-name">{p.displayName} {isMe ? '(אתה)' : ''}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ParticipantList;
