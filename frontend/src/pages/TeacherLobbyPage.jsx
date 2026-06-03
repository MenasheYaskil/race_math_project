import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { COOKIE_TEACHER_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';
import ParticipantList from '../components/ParticipantList';
import RacingBackdrop from '../components/RacingBackdrop';

const MAX_DRIVERS = 8;

const IconCopy = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="9" width="13" height="13" rx="1" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconPlay = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <polygon points="6 4 20 12 6 20 6 4" />
  </svg>
);
const IconLock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="1.5" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconBack = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconBroadcast = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);
const IconInfo = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const Loading = () => (
  <div className="rg-stage" dir="rtl">
    <RacingBackdrop variant="cyan" speed={3.0} intensity={0.7} />
    <main className="rg-cockpit-single" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="rg-panel" style={{ textAlign: 'center', padding: '2rem 2.5rem' }}>
        <h1 className="rg-title">טוען חדר המתנה…</h1>
        <div className="rg-divider"><span className="bar" /><span className="chev" /><span className="bar" /></div>
        <p className="rg-subtitle">מסנכרן עם שרת המרוצים</p>
      </div>
    </main>
  </div>
);

const TeacherLobbyPage = () => {
  const { raceCode } = useParams();
  const [lobby, setLobby] = useState(null);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_TEACHER_TOKEN);
    const raceId = Cookies.get(COOKIE_RACE_ID);
    if (!token || !raceId) { navigate(ROUTES.TEACHER_LOGIN); return; }

    let isMounted = true;
    const fetchLobby = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get-race-lobby`, { params: { token, raceId } });
        if (isMounted) setLobby(res.data);
      } catch (e) { console.error(e); }
    };

    const evtSource = createSSEConnection('/subscribe-race-dashboard', { token, raceId }, {
      onOpen: () => { if (isMounted) fetchLobby(); },
      events: {
        'lobby-participants-updated': () => { if (isMounted) fetchLobby(); },
        'participant-progress-updated': () => { if (isMounted) fetchLobby(); },
        'race-started': () => { if (isMounted) fetchLobby(); },
      },
    });

    return () => { isMounted = false; evtSource.close(); };
  }, [navigate]);

  const participants = lobby?.participants || [];
  const driversCount = lobby?.participantsCount ?? participants.length;
  const canStart = !!lobby?.canStart && driversCount > 0 && !starting;

  const counterPct = Math.min(100, Math.round((driversCount / MAX_DRIVERS) * 100));
  const R = 75;
  const C = 2 * Math.PI * R;
  const counterOffset = useMemo(() => C - (C * counterPct) / 100, [C, counterPct]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(raceCode || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {/* ignore */}
  };

  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    try {
      const formData = new URLSearchParams();
      formData.append('token', Cookies.get(COOKIE_TEACHER_TOKEN));
      formData.append('raceId', Cookies.get(COOKIE_RACE_ID));
      const res = await axios.post(`${API_BASE}/start-race`, formData);
      if (res.data.success) {
        navigate(ROUTES.TEACHER_DASHBOARD(Cookies.get(COOKIE_RACE_ID)));
      } else {
        alert(res.data.message);
        setStarting(false);
      }
    } catch (e) { console.error(e); setStarting(false); }
  };

  if (!lobby) return <Loading />;

  return (
    <div className="rg-stage is-scroll" dir="rtl">
      <RacingBackdrop variant="cyan" speed={5.0} intensity={1.0} />

      <header className="rg-hud" dir="ltr">
        <div className="rg-hud-logo">
          <div className="rg-hud-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#00F3FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="4" y1="22" x2="4" y2="15" stroke="#00F3FF" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="rg-hud-logo-text">
            <span className="top">STARTING GRID</span>
            <span className="sub">Race · {raceCode}</span>
          </div>
        </div>
        <div className="rg-hud-meta">
          <span className="dot" aria-hidden="true" />
          <span>LOBBY LIVE</span>
        </div>
        <button type="button" onClick={() => navigate(ROUTES.TEACHER_CREATE_RACE)} className="rg-ghost-btn" dir="rtl">
          <IconBack />
          <span>חזרה</span>
        </button>
      </header>

      <main className="rg-cockpit">
        {/* ============ LEFT: STARTING GRID ============ */}
        <section className="rg-panel" aria-labelledby="rg-grid-h">
          <span className="rg-panel-corners" aria-hidden="true">
            <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
          </span>

          <header className="rg-panel-head">
            <div>
              <div className="rg-panel-eyebrow">Starting Grid</div>
              <h1 id="rg-grid-h" className="rg-panel-h2">חדר המתנה</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--metallic)' }}>
              <span style={{ color: 'var(--neon-green)' }}>{driversCount}</span>
              <span style={{ color: 'var(--metallic-dim)' }}>/ {MAX_DRIVERS}</span>
              <span>Drivers</span>
            </div>
          </header>

          <ParticipantList participants={participants} variant="racing-grid-fill" />

          <div style={{ marginTop: '1.6rem' }}>
            <button
              type="button"
              className={`rg-cta ${canStart ? '' : 'is-locked'}`}
              onClick={handleStart}
              disabled={!canStart}
            >
              {canStart ? (
                <>
                  <span className="rg-cta-arrow"><IconPlay /></span>
                  <span>{starting ? 'מתניע…' : 'התחל מרוץ'}</span>
                  <span className="rg-cta-arrow"><IconPlay /></span>
                </>
              ) : (
                <>
                  <IconLock width="18" height="18" style={{ opacity: 0.7 }} />
                  <span>ממתין לנהגים</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ============ RIGHT: BROADCAST + COUNTER + INFO ============ */}
        <aside className="rg-panel is-magenta" aria-label="פרטי חדר ושידור קוד">
          <span className="rg-panel-corners" aria-hidden="true">
            <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
          </span>

          <header className="rg-panel-head">
            <div>
              <div className="rg-panel-eyebrow">Broadcast</div>
              <h2 className="rg-panel-h2">שדרו את הקוד</h2>
            </div>
            <IconBroadcast style={{ width: 32, height: 32, color: 'var(--speed-amber)', filter: 'drop-shadow(0 0 8px rgba(255,170,0,0.6))' }} />
          </header>

          <div className="rg-codeblock" aria-live="polite">
            <span className="rg-codeblock-label">Race Code</span>
            <span className="rg-codeblock-value">{(raceCode || '----').toString().toUpperCase()}</span>
            <button type="button" className={`rg-codeblock-copy ${copied ? 'is-copied' : ''}`} onClick={copyCode}>
              {copied ? <IconCheck /> : <IconCopy />}
              <span>{copied ? 'הקוד הועתק' : 'העתק קוד'}</span>
            </button>
          </div>

          <div style={{ marginTop: '1.4rem' }}>
            <div className="rg-section-title">Driver Count</div>
            <div className="rg-counter" aria-hidden="true">
              <svg viewBox="0 0 170 170">
                <defs>
                  <linearGradient id="rg-counter-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00FF88" />
                    <stop offset="100%" stopColor="#00F3FF" />
                  </linearGradient>
                </defs>
                <circle cx="85" cy="85" r={R} fill="none" strokeWidth="10" className="rg-counter-track" />
                <circle cx="85" cy="85" r={R} fill="none" strokeWidth="10" strokeLinecap="round"
                  className="rg-counter-fill"
                  strokeDasharray={C}
                  strokeDashoffset={counterOffset} />
              </svg>
              <div className="rg-counter-center">
                <div>
                  <div className="rg-counter-val">
                    {driversCount}
                    <span className="of"> / {MAX_DRIVERS}</span>
                  </div>
                  <div className="rg-counter-cap">Drivers Locked In</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.4rem' }}>
            <div className="rg-section-title">Join Instructions</div>
            <div className="rg-howto-tile" style={{ '--accent': 'var(--neon-cyan)' }}>
              <div className="rg-howto-icon" aria-hidden="true"><IconInfo /></div>
              <h4>תלמידים נכנסים</h4>
              <p>
                לכתובת <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '0.04em' }}>mathrace.live</span>
                {' '}ומזינים את קוד החדר שלמעלה.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="rg-telemetry" aria-hidden="true">
        <span className="rg-telemetry-item"><span>Status</span><span className="val">{canStart ? 'READY TO START' : 'AWAITING DRIVERS'}</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>Grid</span><span className="val">{driversCount} / {MAX_DRIVERS}</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>Code</span><span className="val">{(raceCode || '----').toString().toUpperCase()}</span></span>
      </footer>
    </div>
  );
};

export default TeacherLobbyPage;
