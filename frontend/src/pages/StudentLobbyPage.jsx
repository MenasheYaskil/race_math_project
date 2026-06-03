import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';
import ParticipantList from '../components/ParticipantList';
import CarIcon, { getParticipantColor } from '../components/CarIcon';
import RacingBackdrop from '../components/RacingBackdrop';

const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 2L4.5 13.5h6L9 22l9.5-12.5h-6L13 2z" />
  </svg>
);
const IconRoute = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 18v-6a3 3 0 0 1 3-3h10" />
    <polyline points="18 5 22 9 18 13" />
    <path d="M9 18v-6a3 3 0 0 0-3-3H2" />
  </svg>
);
const IconBoost = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const IconKey = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const StudentLobbyPage = () => {
  const { raceCode } = useParams();
  const [lobbyState, setLobbyState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_STUDENT_TOKEN);
    const raceId = Cookies.get(COOKIE_RACE_ID);
    if (!token || !raceId) { navigate(ROUTES.STUDENT_JOIN); return; }

    let isMounted = true;

    const checkState = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get-student-race-state`, { params: { token, raceId } });
        if (!isMounted) return;
        setLobbyState(res.data);
        if (res.data.raceStatus === 'LIVE' || res.data.raceStatus === 'ACTIVE') {
          navigate(ROUTES.STUDENT_RACE(raceId));
        } else if (res.data.raceStatus === 'FINISHED') {
          navigate(ROUTES.STUDENT_RESULTS(raceId));
        }
      } catch (e) { console.error(e); }
    };

    const evtSource = createSSEConnection('/subscribe-student-race', { token, raceId }, {
      onOpen: () => { if (isMounted) checkState(); },
      events: {
        'lobby-participants-updated': () => { if (isMounted) checkState(); },
        'race-started': () => { if (isMounted) checkState(); },
      },
    });

    return () => { isMounted = false; evtSource.close(); };
  }, [navigate]);

  const participantsList = lobbyState?.participantsPositions || [];
  const participantsCount = lobbyState?.participantsCount ?? participantsList.length;
  const currentUserId = lobbyState?.currentUserId || lobbyState?.userId || null;

  const myEntry = useMemo(() => {
    if (!currentUserId) return participantsList[0] || null;
    return participantsList.find((p) => p.id === currentUserId || p.userId === currentUserId) || participantsList[0] || null;
  }, [participantsList, currentUserId]);

  const myIndex = useMemo(() => {
    if (!myEntry) return 0;
    const idx = participantsList.findIndex((p) => p === myEntry);
    return idx >= 0 ? idx : 0;
  }, [participantsList, myEntry]);

  const myColor = getParticipantColor(myEntry, participantsList, myIndex);
  const myName = myEntry?.displayName || 'נהג חדש';
  const myLane = (myIndex + 1).toString().padStart(2, '0');

  return (
    <div className="rg-stage is-scroll" dir="rtl">
      <RacingBackdrop variant="ignition" speed={5.5} intensity={1.0} />

      <header className="rg-hud" dir="ltr">
        <div className="rg-hud-logo">
          <div className="rg-hud-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h4l3-7 4 14 3-7h4" stroke="#00F3FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="rg-hud-logo-text">
            <span className="top">PRE-RACE</span>
            <span className="sub">Race · {raceCode}</span>
          </div>
        </div>
        <div className="rg-hud-meta">
          <span className="dot" aria-hidden="true" />
          <span>YOU ARE ON THE GRID</span>
        </div>
      </header>

      <main className="rg-cockpit-single">
        {/* Waiting banner — F1 starting lights vibe */}
        <div className="rg-waiting" role="status">
          <div className="rg-waiting-lights" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <div className="rg-waiting-label">ממתינים לאות זינוק</div>
          <div className="rg-waiting-lights" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
        </div>

        {/* Driver loadout — your card */}
        <section className="rg-loadout" aria-label="הנהג שלך" style={{ '--lane-color': myColor }}>
          <div className="rg-loadout-avatar">
            <CarIcon color={myColor} width={48} height={24} />
          </div>
          <div className="rg-loadout-info">
            <span className="cap">Driver · עמדה P{myLane}</span>
            <span className="name">{myName}</span>
          </div>
          <div className="rg-loadout-status">ON GRID</div>
        </section>

        {/* Race info + Grid */}
        <section className="rg-panel">
          <span className="rg-panel-corners" aria-hidden="true">
            <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
          </span>

          <header className="rg-panel-head">
            <div>
              <div className="rg-panel-eyebrow">Race · קוד חדר</div>
              <h2 className="rg-panel-h2" style={{ direction: 'ltr', textAlign: 'left', letterSpacing: '0.18em' }}>{(raceCode || '----').toString().toUpperCase()}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--metallic)' }}>
              <span style={{ color: 'var(--neon-green)' }}>{participantsCount}</span>
              <span>Drivers</span>
              <IconKey style={{ width: 18, height: 18, color: 'var(--speed-amber)', filter: 'drop-shadow(0 0 6px rgba(255,170,0,0.6))' }} />
            </div>
          </header>

          <div className="rg-section-title">Starting Grid · מצב נהגים</div>
          {participantsList.length === 0 ? (
            <div className="rg-lb-empty">עדיין אין משתתפים נוספים על הגריד…</div>
          ) : (
            <ParticipantList participants={participantsList} variant="racing-grid" currentUserId={currentUserId} />
          )}
        </section>

        {/* How it works */}
        <section className="rg-panel is-magenta">
          <span className="rg-panel-corners" aria-hidden="true">
            <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
          </span>

          <header className="rg-panel-head">
            <div>
              <div className="rg-panel-eyebrow">Pre-Race Briefing</div>
              <h2 className="rg-panel-h2">כך זה עובד</h2>
            </div>
          </header>

          <div className="rg-howto">
            <div className="rg-howto-tile" style={{ '--accent': 'var(--speed-amber)' }}>
              <div className="rg-howto-icon" aria-hidden="true"><IconBolt /></div>
              <h4>ענו מהר</h4>
              <p>כל תשובה נכונה מקדמת אתכם צעד נוסף במסלול אל קו הסיום.</p>
            </div>
            <div className="rg-howto-tile" style={{ '--accent': 'var(--neon-green)' }}>
              <div className="rg-howto-icon" aria-hidden="true"><IconRoute /></div>
              <h4>בחרו מסלול</h4>
              <p>בצומת תבחרו בין מסלולים — נכון = יותר נקודות ופחות זמן.</p>
            </div>
            <div className="rg-howto-tile" style={{ '--accent': 'var(--neon-purple)' }}>
              <div className="rg-howto-icon" aria-hidden="true"><IconBoost /></div>
              <h4>אספו בונוסים</h4>
              <p>בונוסים מפוזרים על המסלול ומעניקים יתרון משמעותי.</p>
            </div>
          </div>
        </section>

        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '0.78rem',
          letterSpacing: '0.34em',
          textTransform: 'uppercase',
          color: 'var(--metallic-dim)',
          padding: '0.6rem 0 1.2rem',
        }}>
          המרוץ יתחיל אוטומטית · Race auto-starts on green flag
        </div>
      </main>
    </div>
  );
};

export default StudentLobbyPage;
