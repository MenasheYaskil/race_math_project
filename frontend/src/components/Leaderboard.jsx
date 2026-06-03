import React from 'react';
import CarIcon, { getParticipantColor } from './CarIcon';

const podiumClass = (rank) => {
  if (rank === 1) return 'is-podium-1';
  if (rank === 2) return 'is-podium-2';
  if (rank === 3) return 'is-podium-3';
  return '';
};

const podiumMedal = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null);

const Leaderboard = ({ leaderboard, variant = 'standard' }) => {
  if (!leaderboard || leaderboard.length === 0) {
    return <div className="rg-lb-empty">אין נתונים</div>;
  }

  // ---- Phase 3.5: Race Director debrief table (chamfered grid rows) ----
  if (variant === 'teacher-table' || variant === 'teacher-table-racing') {
    return (
      <div className="rg-tres-table" role="table" aria-label="תוצאות סופיות">
        <div className="rg-tres-thead" role="row">
          <span role="columnheader">POS · מיקום</span>
          <span role="columnheader">Driver · שחקן</span>
          <span role="columnheader" style={{ textAlign: 'center' }}>Car</span>
          <span role="columnheader" style={{ textAlign: 'center' }}>Points</span>
          <span role="columnheader" style={{ textAlign: 'center' }}>Acc · דיוק</span>
          <span role="columnheader" style={{ textAlign: 'center' }}>Hits</span>
          <span role="columnheader" style={{ textAlign: 'center' }}>Avg Lap</span>
        </div>
        {leaderboard.map((entry, idx) => {
          const rank = entry.rank || idx + 1;
          const color = getParticipantColor(entry, leaderboard, idx);
          const medal = podiumMedal(rank);
          return (
            <div
              key={entry.userId || entry.id || idx}
              className={`rg-tres-row ${podiumClass(rank)}`}
              style={{ '--lane-color': color }}
              role="row"
            >
              <span className="rg-tres-pos" role="cell">
                <span className="badge">
                  {medal ? <span className="medal" aria-hidden="true">{medal}</span> : rank}
                </span>
              </span>
              <span className="rg-tres-driver" role="cell">
                <span className="rg-tres-driver-name">{entry.displayName}</span>
                <span className="rg-tres-driver-meta">{rank === 1 ? 'Race Winner · מנצח' : `Position P${rank}`}</span>
              </span>
              <span className="rg-tres-car" role="cell">
                <CarIcon color={color} width={56} height={28} />
              </span>
              <span className="rg-tres-cell points" role="cell" style={{ '--accent': color }}>
                <span className="v">{entry.points ?? 0}</span>
                <span className="u">Points</span>
              </span>
              <span className="rg-tres-cell" role="cell" style={{ '--accent': 'var(--neon-cyan)' }}>
                <span className="v">{entry.accuracyPercent ?? 0}%</span>
                <span className="u">Accuracy</span>
              </span>
              <span className="rg-tres-cell" role="cell" style={{ '--accent': 'var(--neon-green)' }}>
                <span className="v">{entry.correctAnswersCount ?? 0}/{entry.answeredQuestionsCount ?? 0}</span>
                <span className="u">Correct</span>
              </span>
              <span className="rg-tres-cell" role="cell" style={{ '--accent': 'var(--speed-amber)' }}>
                <span className="v">{entry.averageAnswerTimeSeconds ?? 0}s</span>
                <span className="u">Avg Lap</span>
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // ---- Default + cyberpunk callers — racing standings panel (Phase 1) ----
  return (
    <div className="rg-lb">
      <div className="rg-lb-header" aria-hidden="true">
        <span>POS</span>
        <span>CAR</span>
        <span>DRIVER</span>
        <span style={{ textAlign: 'left' }}>SCORE</span>
      </div>
      {leaderboard.map((entry, idx) => {
        const rank = entry.rank || idx + 1;
        const color = getParticipantColor(entry, leaderboard, idx);
        const isCurrent = !!entry.isCurrentUser;
        return (
          <div
            key={entry.userId || entry.id}
            className={`rg-lb-row ${podiumClass(rank)} ${isCurrent ? 'is-current' : ''}`}
            style={{ '--lane-color': color }}
          >
            <span className="rg-lb-rank">{rank}</span>
            <span className="rg-lb-car"><CarIcon color={color} width={48} height={24} /></span>
            <span className="rg-lb-name">
              {entry.displayName}
              {isCurrent && <span className="you">אתה</span>}
            </span>
            <span className="rg-lb-points">
              {entry.points}
              <small>PTS</small>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;
