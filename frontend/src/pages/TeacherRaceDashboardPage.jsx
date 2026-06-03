import React, { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN, COOKIE_RACE_CODE } from '../config/cookieNames';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';
import { fetchTeacherDashboardSnapshot, finishRace } from '../services/api';
import RaceTrack from '../components/RaceTrack';
import { getParticipantColor } from '../components/CarIcon';

const IconBroadcast = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);
const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DisconnectOverlay = () => (
  <div className="rg-disconnect">
    <div className="rg-disconnect-card">
      <div className="rg-disconnect-eyebrow">Race Control · Signal Lost</div>
      <div className="rg-disconnect-title">החיבור נותק</div>
      <div className="rg-disconnect-sub">Reconnecting · מנסה להתחבר מחדש…</div>
    </div>
  </div>
);

const Loading = () => (
  <div className="rg-fullscreen">
    <div className="label">טוען לוח בקרה…</div>
  </div>
);

const useElapsed = (startEpochSec) => {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  if (!startEpochSec) return null;
  const sec = Math.max(0, now - startEpochSec);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const TeacherRaceDashboardPage = () => {
  const { raceId } = useParams();
  const [snapshot, setSnapshot] = useState(null);
  const [sseError, setSseError] = useState(false);
  const navigate = useNavigate();
  const raceCode = Cookies.get(COOKIE_RACE_CODE) || raceId;

  useEffect(() => {
    const token = Cookies.get(COOKIE_TEACHER_TOKEN);
    if (!token) return navigate(ROUTES.TEACHER_LOGIN);

    let isMounted = true;

    const loadSnapshot = () => {
      fetchTeacherDashboardSnapshot(raceId)
        .then((res) => {
          if (!isMounted) return;
          const data = res.data;
          setSnapshot(data);
          if (data.raceStatus === 'FINISHED') navigate(ROUTES.TEACHER_RESULTS(raceId));
        })
        .catch((err) => console.error(err));
    };

    const evtSource = createSSEConnection('/subscribe-race-dashboard', { token, raceId }, {
      onOpen: () => { if (isMounted) { setSseError(false); loadSnapshot(); } },
      onError: () => { if (isMounted) setSseError(true); },
      events: {
        'participant-progress-updated': () => { if (isMounted) loadSnapshot(); },
        'race-started': () => { if (isMounted) loadSnapshot(); },
        'race-finished': () => { if (isMounted) navigate(ROUTES.TEACHER_RESULTS(raceId)); },
      },
    });

    return () => { isMounted = false; evtSource.close(); };
  }, [raceId, navigate]);

  const handleFinishEarly = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך לסיים את המרוץ?')) return;
    try {
      await finishRace(raceId);
      navigate(ROUTES.TEACHER_RESULTS(raceId));
    } catch (err) {
      console.error(err);
    }
  };

  const positions = snapshot?.participantsPositions || [];
  const driversCount = positions.length;

  // Identify the live leader (rank 1 if present, else best-by-points)
  const leader = useMemo(() => {
    if (!positions.length) return null;
    const byRank = positions.find((p) => p.rank === 1);
    if (byRank) return { ...byRank, idx: positions.findIndex((p) => p === byRank) };
    const sorted = [...positions].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    const top = sorted[0];
    return { ...top, idx: positions.findIndex((p) => p === top) };
  }, [positions]);

  const leaderColor = leader ? getParticipantColor(leader, positions, leader.idx) : null;

  const elapsed = useElapsed(snapshot?.raceStartedAt || snapshot?.raceStartTime || null);

  if (!snapshot) return <Loading />;

  return (
    <div className="rg-tdash-stage">
      {sseError && <DisconnectOverlay />}

      {/* HUD — Race Control */}
      <header className="rg-tdash-hud">
        <div className="rg-tdash-hud-brand">
          <div className="rg-tdash-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#FF2D55" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="4" y1="22" x2="4" y2="15" stroke="#FF2D55" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="rg-tdash-brand-text">
            <span className="top">RACE CONTROL</span>
            <span className="sub">Live Broadcast · שידור חי</span>
          </div>
        </div>

        <div className="rg-tdash-center">
          <div className="rg-tdash-code">
            <span className="lbl">Race Code</span>
            <span className="val">{(raceCode || '----').toString().toUpperCase()}</span>
          </div>
          <div className="rg-tdash-drivers">
            <span className="v">{driversCount}<span className="of"> / 8</span></span>
            <span className="lbl">Drivers</span>
          </div>
          {elapsed && (
            <div className="rg-tdash-drivers" style={{ borderColor: 'rgba(0,243,255,0.45)' }}>
              <span className="v" style={{ color: 'var(--neon-cyan)', textShadow: '0 0 12px rgba(0,243,255,0.6)' }}>{elapsed}</span>
              <span className="lbl">Race Time</span>
            </div>
          )}
        </div>

        <div className="rg-tdash-right">
          {leader && (
            <div className="rg-tdash-leader" aria-label={`מוביל ${leader.displayName}`}>
              <span className="rg-tdash-leader-medal" aria-hidden="true">🏆</span>
              <div className="rg-tdash-leader-info">
                <span className="cap">Current Leader</span>
                <span className="name" style={{ borderRight: `3px solid ${leaderColor}`, paddingRight: '0.5rem' }}>{leader.displayName}</span>
                <span className="meta"><span className="pts">{leader.points}</span> PTS</span>
              </div>
            </div>
          )}
          <button type="button" onClick={handleFinishEarly} className="rg-tdash-abort">
            <span className="square" aria-hidden="true" />
            <span>סיום מרוץ · ABORT</span>
          </button>
        </div>
      </header>

      {/* Track Header */}
      <div className="rg-tdash-track-head">
        <span className="label">Progress · התקדמות במסלול</span>
        <span className="rule" aria-hidden="true" />
        <span className="meta">Sector 1 → Finish</span>
      </div>

      {/* Track Shell */}
      <div className="rg-tdash-track-shell">
        <RaceTrack participantsPositions={positions} currentUserId={null} variant="dashboard" />
      </div>

      {/* Footer telemetry */}
      <footer className="rg-tdash-footer">
        <span className={`rg-tdash-footer-status ${sseError ? 'is-down' : ''}`}>
          <span>{sseError ? 'מנותק · OFFLINE' : 'שידור חי · ONLINE'}</span>
          <IconBroadcast width="14" height="14" />
        </span>
        <span className="rg-tdash-footer-center">RACE CONTROL TOWER</span>
        <span className="rg-tdash-footer-right">
          <span className="item">
            <IconClock width="14" height="14" />
            <span>Updated</span>
            <span className="val">NOW</span>
          </span>
          <span className="item">
            <span>Status</span>
            <span className="val">{snapshot.raceStatus || 'LIVE'}</span>
          </span>
        </span>
      </footer>
    </div>
  );
};

export default TeacherRaceDashboardPage;
