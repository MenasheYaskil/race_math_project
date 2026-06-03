import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { COOKIE_TEACHER_TOKEN, COOKIE_RACE_CODE } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { ROUTES } from '../config/routePaths';
import Leaderboard from '../components/Leaderboard';
import CarIcon, { getParticipantColor } from '../components/CarIcon';

const IconTrophy = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 21h8m-4-4v4" />
    <path d="M7 4h10v6c0 3.31-2.24 6-5 6s-5-2.69-5-6V4z" />
    <path d="M7 6H4v3c0 2 1.5 3 3 3.5M17 6h3v3c0 2-1.5 3-3 3.5" />
  </svg>
);
const IconAccuracy = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconUsers = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconFlag = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);
const IconRetry = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconBack = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const PodiumColumn = ({ entry, order, leaderboard, idx }) => {
  if (!entry) return null;
  const color = getParticipantColor(entry, leaderboard, idx);
  const medal = order === 1 ? '🏆' : order === 2 ? '🥈' : '🥉';
  return (
    <div className={`rg-podium-col col-${order}`}>
      <span className="rg-podium-medal" aria-hidden="true">{medal}</span>
      <div className="rg-podium-car" aria-hidden="true">
        <CarIcon color={color} width={order === 1 ? 96 : 76} height={order === 1 ? 48 : 38} />
      </div>
      <div className="rg-podium-name" title={entry.displayName}>{entry.displayName}</div>
      <div className="rg-podium-step">
        <div className="rg-podium-pos">P{order}</div>
        <div className="rg-podium-pts">{entry.points}<span className="u">PTS</span></div>
      </div>
    </div>
  );
};

const Loading = () => (
  <div className="rg-fullscreen">
    <div className="label">טוען תוצאות…</div>
  </div>
);

const TeacherResultsPage = () => {
  const { raceId } = useParams();
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  const raceCode = Cookies.get(COOKIE_RACE_CODE) || raceId;

  useEffect(() => {
    const token = Cookies.get(COOKIE_TEACHER_TOKEN);
    if (!token) return navigate(ROUTES.TEACHER_LOGIN);

    axios.get(`${API_BASE}/get-race-results`, { params: { token, raceId } })
      .then((res) => setResults(res.data))
      .catch((err) => console.error(err));
  }, [raceId, navigate]);

  const leaderboard = useMemo(() => {
    if (!results?.leaderboard) return [];
    return [...results.leaderboard].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [results]);

  const kpis = useMemo(() => {
    if (!leaderboard.length) return null;
    const total = leaderboard.length;
    const avgPoints = Math.round(leaderboard.reduce((s, e) => s + (e.points || 0), 0) / total);
    const avgAccuracy = Math.round(leaderboard.reduce((s, e) => s + (e.accuracyPercent || 0), 0) / total);
    const totalCorrect = leaderboard.reduce((s, e) => s + (e.correctAnswersCount || 0), 0);
    const totalAnswered = leaderboard.reduce((s, e) => s + (e.answeredQuestionsCount || 0), 0);
    // Fastest lap = lowest non-zero avg answer time
    const times = leaderboard.map((e) => Number(e.averageAnswerTimeSeconds || 0)).filter((t) => t > 0);
    const fastest = times.length ? Math.min(...times) : 0;
    const fastestEntry = leaderboard.find((e) => Number(e.averageAnswerTimeSeconds || 0) === fastest);
    return { total, avgPoints, avgAccuracy, totalCorrect, totalAnswered, fastest, fastestEntry };
  }, [leaderboard]);

  if (!results) return <Loading />;

  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

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
            <span className="top">RACE DEBRIEF</span>
            <span className="sub">Director · Race {raceCode}</span>
          </div>
        </div>

        <div className="rg-hud-meta">
          <span className="dot" aria-hidden="true" style={{ background: '#FFD24A', boxShadow: '0 0 10px #FFD24A' }} />
          <span>RACE FINISHED</span>
        </div>

        <button type="button" onClick={() => navigate(ROUTES.TEACHER_CREATE_RACE)} className="rg-ghost-btn" dir="rtl">
          <IconRetry />
          <span>משחק נוסף</span>
        </button>
      </header>

      <main className="rg-results-main">
        {/* HERO */}
        <section className="rg-results-hero">
          <span className="rg-results-eyebrow">
            <span className="flag" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} />)}
            </span>
            <span>Race Debrief · תדריך מנהל המרוץ</span>
            <span className="flag" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} />)}
            </span>
          </span>
          <h1 className="rg-results-title">RACE COMPLETE</h1>
          <p className="rg-results-subtitle">המרוץ הסתיים בהצלחה · מסכמים את הביצועים של הכיתה.</p>
        </section>

        {/* RACE META STRIP */}
        <section className="rg-race-meta" aria-label="פרטי המרוץ">
          <span className="item">
            <span className="cap">Race</span>
            <span className="v">{(raceCode || '----').toString().toUpperCase()}</span>
          </span>
          <span className="sep" />
          <span className="item">
            <span className="cap">Drivers</span>
            <span className="v">{leaderboard.length}</span>
          </span>
          {first && (
            <>
              <span className="sep" />
              <span className="item">
                <span className="cap">Winner</span>
                <span className="v" style={{ color: '#FFD24A', textShadow: '0 0 8px rgba(255,210,74,0.6)' }}>
                  🏆 {first.displayName}
                </span>
              </span>
            </>
          )}
        </section>

        {/* CLASS-WIDE KPIs */}
        {kpis && (
          <section className="rg-kpi-grid" aria-label="נתוני סיכום כיתתיים">
            <div className="rg-kpi" style={{ '--accent': 'var(--neon-cyan)' }}>
              <div className="rg-kpi-ico"><IconAccuracy /></div>
              <div className="rg-kpi-body">
                <span className="rg-kpi-cap">Class Accuracy</span>
                <span className="rg-kpi-val">{kpis.avgAccuracy}%</span>
                <span className="rg-kpi-sub">דיוק ממוצע</span>
              </div>
            </div>
            <div className="rg-kpi" style={{ '--accent': 'var(--neon-purple)' }}>
              <div className="rg-kpi-ico"><IconTrophy /></div>
              <div className="rg-kpi-body">
                <span className="rg-kpi-cap">Average Points</span>
                <span className="rg-kpi-val">{kpis.avgPoints}</span>
                <span className="rg-kpi-sub">נקודות בממוצע</span>
              </div>
            </div>
            <div className="rg-kpi" style={{ '--accent': 'var(--neon-green)' }}>
              <div className="rg-kpi-ico"><IconUsers /></div>
              <div className="rg-kpi-body">
                <span className="rg-kpi-cap">Correct Answers</span>
                <span className="rg-kpi-val">{kpis.totalCorrect}/{kpis.totalAnswered}</span>
                <span className="rg-kpi-sub">תשובות נכונות סך הכל</span>
              </div>
            </div>
            <div className="rg-kpi" style={{ '--accent': 'var(--speed-amber)' }}>
              <div className="rg-kpi-ico"><IconClock /></div>
              <div className="rg-kpi-body">
                <span className="rg-kpi-cap">Fastest Lap</span>
                <span className="rg-kpi-val">{kpis.fastest ? `${kpis.fastest}s` : '—'}</span>
                <span className="rg-kpi-sub">{kpis.fastestEntry ? kpis.fastestEntry.displayName : 'לא נקבע'}</span>
              </div>
            </div>
          </section>
        )}

        {/* PODIUM */}
        {leaderboard.length > 0 && (
          <section className="rg-podium-wrap" aria-label="פודיום מנצחים">
            <PodiumColumn entry={second} order={2} leaderboard={leaderboard} idx={1} />
            <PodiumColumn entry={first} order={1} leaderboard={leaderboard} idx={0} />
            <PodiumColumn entry={third} order={3} leaderboard={leaderboard} idx={2} />
          </section>
        )}

        {/* FULL STANDINGS TABLE */}
        <section className="rg-standings">
          <header className="rg-standings-head">
            <span className="label">Race Debrief · תוצאות מלאות</span>
            <span className="rule" aria-hidden="true" />
            <span className="total">{leaderboard.length} drivers</span>
          </header>
          <Leaderboard leaderboard={leaderboard} variant="teacher-table" />
        </section>

        {/* ACTIONS */}
        <section className="rg-results-actions is-teacher">
          <button type="button" className="rg-cta" onClick={() => navigate(ROUTES.TEACHER_CREATE_RACE)}>
            <span className="rg-cta-arrow"><IconFlag /></span>
            <span>מרוץ חדש · New Race</span>
            <span className="rg-cta-arrow"><IconFlag /></span>
          </button>
          <button type="button" className="rg-cta is-secondary" onClick={() => navigate(ROUTES.HOME)}>
            <span className="rg-cta-arrow"><IconBack /></span>
            <span>בית · Home</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default TeacherResultsPage;
