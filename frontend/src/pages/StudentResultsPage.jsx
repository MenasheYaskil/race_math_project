import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { ROUTES } from '../config/routePaths';
import Leaderboard from '../components/Leaderboard';
import CarIcon, { getParticipantColor } from '../components/CarIcon';

const IconTarget = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconHome = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v10h14V10" />
  </svg>
);

const podiumMedal = (rank) => (rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '');

const Loading = () => (
  <div className="rg-fullscreen">
    <div className="label">טוען תוצאות…</div>
  </div>
);

const PodiumColumn = ({ entry, order, leaderboard, idx }) => {
  if (!entry) return null;
  const color = getParticipantColor(entry, leaderboard, idx);
  return (
    <div className={`rg-podium-col col-${order}`}>
      <span className="rg-podium-medal" aria-hidden="true">{podiumMedal(order)}</span>
      <div className="rg-podium-car" aria-hidden="true">
        <CarIcon color={color} width={order === 1 ? 96 : 76} height={order === 1 ? 48 : 38} />
      </div>
      <div className="rg-podium-name" title={entry.displayName}>
        {entry.isCurrentUser && <span className="rg-podium-you">אתה</span>}
        {entry.displayName}
      </div>
      <div className="rg-podium-step">
        <div className="rg-podium-pos">P{order}</div>
        <div className="rg-podium-pts">{entry.points}<span className="u">PTS</span></div>
      </div>
    </div>
  );
};

const StudentResultsPage = () => {
  const { raceId } = useParams();
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_STUDENT_TOKEN);
    if (!token) return navigate(ROUTES.STUDENT_JOIN);

    axios.get(`${API_BASE}/get-race-results`, { params: { token, raceId } })
      .then((res) => setResults(res.data))
      .catch((err) => console.error(err));
  }, [raceId, navigate]);

  const leaderboard = results?.leaderboard || [];
  const podium = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const currentUserEntry = useMemo(() => leaderboard.find((e) => e.isCurrentUser) || null, [leaderboard]);
  const currentUserIdx = useMemo(() => leaderboard.findIndex((e) => e.isCurrentUser), [leaderboard]);
  const currentUserColor = currentUserEntry ? getParticipantColor(currentUserEntry, leaderboard, currentUserIdx) : 'var(--neon-cyan)';
  const currentRank = currentUserEntry?.rank || (currentUserIdx >= 0 ? currentUserIdx + 1 : null);

  const goHome = () => {
    Cookies.remove(COOKIE_STUDENT_TOKEN);
    Cookies.remove(COOKIE_RACE_ID);
    navigate(ROUTES.STUDENT_JOIN);
  };

  if (!results) return <Loading />;

  return (
    <div className="rg-results-stage">
      <header className="rg-hud" dir="ltr">
        <div className="rg-hud-logo">
          <div className="rg-hud-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#FFD24A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="4" y1="22" x2="4" y2="15" stroke="#FFD24A" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="rg-hud-logo-text">
            <span className="top">PARC FERMÉ</span>
            <span className="sub">Race · {raceId}</span>
          </div>
        </div>
        <div className="rg-hud-meta">
          <span className="dot" aria-hidden="true" style={{ background: '#FFD24A', boxShadow: '0 0 10px #FFD24A' }} />
          <span>RACE COMPLETE</span>
        </div>
        <button type="button" onClick={goHome} className="rg-ghost-btn" dir="rtl">
          <IconHome />
          <span>חזרה</span>
        </button>
      </header>

      <main className="rg-results-main">
        {/* HERO */}
        <section className="rg-results-hero">
          <span className="rg-results-eyebrow">
            <span className="flag" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} />)}
            </span>
            <span>Race Complete · המרוץ הסתיים</span>
            <span className="flag" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} />)}
            </span>
          </span>
          <h1 className="rg-results-title">VICTORY LAP</h1>
          <p className="rg-results-subtitle">כל הכבוד למתחרים · the checkered flag has dropped.</p>
        </section>

        {/* PERSONAL RECAP */}
        {currentUserEntry ? (
          <section
            className={`rg-recap ${currentRank === 1 ? 'is-podium-1' : ''}`}
            style={{ '--lane-color': currentUserColor }}
            aria-label="התוצאה שלך"
          >
            <div className={`rg-recap-pos ${currentRank === 1 ? 'is-podium-1' : ''}`}>
              <span className="p-letter">POS</span>
              <span className="p-num">{currentRank}</span>
            </div>
            <div className="rg-recap-info">
              <span className="rg-recap-cap">Your Finish · התוצאה שלך</span>
              <span className="rg-recap-name">{currentUserEntry.displayName}</span>
              <span className="rg-recap-foot">
                {currentRank === 1 ? '🏆 ניצחון!' : currentRank === 2 ? '🥈 כסף' : currentRank === 3 ? '🥉 ארד' : `Finished P${currentRank}`}
                {' · '}
                {leaderboard.length} drivers
              </span>
            </div>
            <div className="rg-recap-pts">
              <span className="v">{currentUserEntry.points}</span>
              <span className="u">PTS</span>
            </div>
          </section>
        ) : (
          <section className="rg-recap-empty">לא נמצאו נתוני משתמש למרוץ זה</section>
        )}

        {/* PODIUM */}
        {podium.length > 0 && (
          <section className="rg-podium-wrap" aria-label="פודיום מנצחים">
            <PodiumColumn entry={podium[1]} order={2} leaderboard={leaderboard} idx={1} />
            <PodiumColumn entry={podium[0]} order={1} leaderboard={leaderboard} idx={0} />
            <PodiumColumn entry={podium[2]} order={3} leaderboard={leaderboard} idx={2} />
          </section>
        )}

        {/* STATS */}
        {currentUserEntry && (
          <section className="rg-stat-grid" aria-label="סטטיסטיקות מרוץ">
            <div className="rg-stat-tile" style={{ '--accent': 'var(--neon-cyan)' }}>
              <div className="rg-stat-icon"><IconTarget /></div>
              <div className="rg-stat-body">
                <span className="rg-stat-label">דיוק · Accuracy</span>
                <span className="rg-stat-val">{currentUserEntry.accuracyPercent ?? 0}%</span>
              </div>
            </div>
            <div className="rg-stat-tile" style={{ '--accent': 'var(--speed-amber)' }}>
              <div className="rg-stat-icon"><IconCheck /></div>
              <div className="rg-stat-body">
                <span className="rg-stat-label">תשובות · Correct</span>
                <span className="rg-stat-val">{currentUserEntry.correctAnswersCount ?? 0}/{currentUserEntry.answeredQuestionsCount ?? 0}</span>
              </div>
            </div>
            <div className="rg-stat-tile" style={{ '--accent': 'var(--neon-green)' }}>
              <div className="rg-stat-icon"><IconClock /></div>
              <div className="rg-stat-body">
                <span className="rg-stat-label">זמן ממוצע · Avg Lap</span>
                <span className="rg-stat-val">{currentUserEntry.averageAnswerTimeSeconds ?? 0}s</span>
              </div>
            </div>
          </section>
        )}

        {/* FINAL STANDINGS */}
        <section className="rg-standings">
          <header className="rg-standings-head">
            <span className="label">Final Standings · תוצאות סופיות</span>
            <span className="rule" aria-hidden="true" />
            <span className="total">{leaderboard.length} drivers</span>
          </header>
          <Leaderboard leaderboard={leaderboard} variant="cyberpunk" />
        </section>

        {/* ACTIONS */}
        <section className="rg-results-actions">
          <button type="button" className="rg-cta" onClick={goHome}>
            <span className="rg-cta-arrow"><IconHome /></span>
            <span>חזרה ללובי</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default StudentResultsPage;
