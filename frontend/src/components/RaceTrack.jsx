import React from 'react';
import { TRACK_LENGTH } from '../config/Constants';
import CarIcon, { getParticipantColor } from './CarIcon';

const podiumClass = (rank) => (rank === 1 ? 'is-podium-1' : rank === 2 ? 'is-podium-2' : rank === 3 ? 'is-podium-3' : '');

const RaceTrack = ({ participantsPositions, currentUserId, variant = 'standard' }) => {
  if (!participantsPositions || participantsPositions.length === 0) return null;

  // ---- Teacher dashboard variant (Phase 3.3 — projector view) ----
  if (variant === 'dashboard') {
    const count = participantsPositions.length;
    // Estimate lane height from viewport minus header (~110px) + footer (~50px) + track header (~38px).
    const trackAreaPx = Math.max(220, window.innerHeight - 230 - (count - 1) * 12);
    const rawLaneH = Math.floor(trackAreaPx / count);
    const laneH = Math.min(160, Math.max(50, rawLaneH));
    const carH = Math.min(110, Math.max(30, Math.round(laneH * 0.72)));
    const carW = Math.min(220, Math.max(60, carH * 2));
    const carOffset = Math.round(carW / 2);

    return (
      <div className="rg-dash-lanes">
        {participantsPositions.map((p, idx) => {
          const percent = Math.min(95, Math.max(0, (p.position / TRACK_LENGTH) * 100));
          const rank = p.rank || idx + 1;
          const color = getParticipantColor(p, participantsPositions, idx);
          return (
            <div
              key={p.id}
              className={`rg-dash-lane ${podiumClass(rank)}`}
              style={{ '--lane-color': color }}
            >
              <div className="rg-dash-rank">{rank}</div>

              <div className="rg-dash-track">
                <div className="rg-dash-fill" style={{ width: `${percent}%` }} />
                <div className="rg-dash-percent">{Math.round(percent)}%</div>
                <div className="rg-dash-car" style={{ left: `calc(${percent}% - ${carOffset}px)` }}>
                  <CarIcon color={color} width={carW} height={carH} />
                </div>
              </div>

              <div className="rg-dash-info">
                <span className="rg-dash-name">{p.displayName}</span>
                <span className="rg-dash-pts">{p.points}<span className="u">PTS</span></span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---- Student live-cockpit lanes (Phase 3.2) ----
  const count = participantsPositions.length;
  const trackAreaPx = Math.round(window.innerHeight * 0.62) - 60 - (count - 1) * 6;
  const rawLaneH = Math.floor(trackAreaPx / count);
  const laneH = Math.min(110, Math.max(36, rawLaneH));
  const carH = Math.min(70, Math.max(20, Math.round(laneH * 0.7)));
  const carW = Math.min(140, Math.max(38, carH * 2));
  const carOffset = Math.round(carW / 2);

  return (
    <div className="rg-lanes">
      {participantsPositions.map((p, idx) => {
        const percent = Math.min(95, Math.max(0, (p.position / TRACK_LENGTH) * 100));
        const isMe = p.id === currentUserId;
        const color = getParticipantColor(p, participantsPositions, idx);
        const rank = p.rank || idx + 1;
        return (
          <div
            key={p.id}
            className={`rg-lane ${isMe ? 'is-me' : ''}`}
            style={{ '--lane-color': color }}
          >
            <div className="rg-lane-rank">{rank}</div>

            <div className="rg-lane-track">
              <div className="rg-lane-fill" style={{ width: `${percent}%` }} />
              <div className="rg-lane-car" style={{ left: `calc(${percent}% - ${carOffset}px)` }}>
                <CarIcon color={color} width={carW} height={carH} />
              </div>
            </div>

            <div className="rg-lane-info">
              <span className="rg-lane-name">{p.displayName}{isMe ? ' · אתה' : ''}</span>
              <span className="rg-lane-pts">{p.points}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RaceTrack;
