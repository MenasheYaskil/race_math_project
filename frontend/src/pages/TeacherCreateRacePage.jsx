import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { COOKIE_TEACHER_TOKEN, COOKIE_RACE_ID, COOKIE_RACE_CODE } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { ROUTES } from '../config/routePaths';
import RacingBackdrop from '../components/RacingBackdrop';

const IconFlag = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);
const IconTarget = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconLock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="1.5" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 2L4.5 13.5h6L9 22l9.5-12.5h-6L13 2z" />
  </svg>
);
const IconBack = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const PRESETS = [150, 250, 350, 500, 750];
const MAX_TARGET = 2000;

const TeacherCreateRacePage = () => {
  const [title, setTitle] = useState('');
  const [targetScore, setTargetScore] = useState('350');
  const [isPrivateRace, setIsPrivateRace] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get(COOKIE_TEACHER_TOKEN)) navigate(ROUTES.TEACHER_LOGIN);
  }, [navigate]);

  const numericScore = Math.max(0, Math.min(MAX_TARGET, Number(targetScore) || 0));
  const gaugePct = useMemo(() => Math.min(100, Math.round((numericScore / 1000) * 100)), [numericScore]);

  const bumpScore = (delta) => {
    setTargetScore(String(Math.max(0, Math.min(MAX_TARGET, numericScore + delta))));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setError('הזינו שם למרוץ לפני ההתנעה.'); return; }
    if (!numericScore || numericScore <= 0) { setError('יעד הניקוד חייב להיות גדול מאפס.'); return; }

    setIsSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append('token', Cookies.get(COOKIE_TEACHER_TOKEN));
      formData.append('raceTitle', trimmedTitle);

      sessionStorage.setItem('pendingRaceUiConfig', JSON.stringify({
        targetScore: numericScore,
        isPrivateRace,
      }));

      const res = await axios.post(`${API_BASE}/create-race`, formData);
      if (res.data.success) {
        Cookies.set(COOKIE_RACE_ID, res.data.raceId);
        Cookies.set(COOKIE_RACE_CODE, res.data.raceCode);
        navigate(ROUTES.TEACHER_LOBBY(res.data.raceCode));
      } else {
        setError(res.data.message || 'יצירת המרוץ נכשלה.');
      }
    } catch (err) {
      setError('שגיאה ביצירת המרוץ. נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const R = 70;
  const C = 2 * Math.PI * R;
  const gaugeOffset = C - (C * gaugePct) / 100;

  return (
    <div className="rg-stage" dir="rtl">
      <RacingBackdrop variant="cyan" speed={5.5} intensity={1.0} />

      <header className="rg-hud" dir="ltr">
        <div className="rg-hud-logo">
          <div className="rg-hud-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 4h12v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V4z" stroke="#00F3FF" strokeWidth="1.8" fill="rgba(0,243,255,0.10)" />
              <path d="M12 16v5M8 21h8" stroke="#00F3FF" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="rg-hud-logo-text">
            <span className="top">MATH RACE</span>
            <span className="sub">Pit Lane Config</span>
          </div>
        </div>
        <div className="rg-hud-meta">
          <span className="dot" aria-hidden="true" />
          <span>BUILD ROOM</span>
        </div>
        <button type="button" onClick={() => navigate(ROUTES.HOME)} className="rg-ghost-btn" dir="rtl">
          <IconBack />
          <span>חזרה</span>
        </button>
      </header>

      <main className="rg-cockpit">
        {/* ============ LEFT: CONFIG ============ */}
        <section className="rg-panel" aria-labelledby="rg-config-h">
          <span className="rg-panel-corners" aria-hidden="true">
            <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
          </span>

          <header className="rg-panel-head">
            <div>
              <div className="rg-panel-eyebrow">Race Config</div>
              <h1 id="rg-config-h" className="rg-panel-h2">יצירת מרוץ חדש</h1>
            </div>
            <IconFlag style={{ width: 36, height: 36, color: 'var(--neon-purple)', filter: 'drop-shadow(0 0 8px rgba(188,19,254,0.6))' }} />
          </header>

          {error && <div className="rg-error" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} noValidate>
            <div className="rg-field">
              <label htmlFor="cr-title" className="rg-field-label">שם המרוץ · Race Name</label>
              <div className="rg-field-wrap">
                <input
                  id="cr-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="לדוגמה: גרנד פרי כיתה ז׳"
                  className="rg-input"
                  autoComplete="off"
                  maxLength={48}
                />
                <span className="rg-input-icon" aria-hidden="true"><IconFlag /></span>
              </div>
            </div>

            <div className="rg-field">
              <label htmlFor="cr-score" className="rg-field-label">יעד ניקוד · Target Score</label>
              <div className="rg-stepper">
                <button type="button" className="rg-step-btn" aria-label="הפחת" onClick={() => bumpScore(-50)}>−</button>
                <input
                  id="cr-score"
                  type="number"
                  min="50"
                  max={MAX_TARGET}
                  step="50"
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="rg-input"
                />
                <button type="button" className="rg-step-btn" aria-label="הוסף" onClick={() => bumpScore(50)}>+</button>
              </div>
              <div className="rg-chip-row" role="radiogroup" aria-label="ערכים מומלצים">
                {PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={numericScore === v}
                    className={`rg-chip ${numericScore === v ? 'is-active' : ''}`}
                    onClick={() => setTargetScore(String(v))}
                  >{v}</button>
                ))}
              </div>
            </div>

            <div className="rg-field">
              <span className="rg-field-label">פרטיות · Visibility</span>
              <label className="rg-toggle">
                <div className="rg-toggle-info">
                  <span className="label">מרוץ פרטי</span>
                  <span className="hint">Code-Only Access</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivateRace}
                  onChange={(e) => setIsPrivateRace(e.target.checked)}
                />
                <span className="rg-switch" aria-hidden="true" />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="rg-cta" disabled={isSubmitting}>
                <span className="rg-cta-arrow"><IconBolt /></span>
                <span>{isSubmitting ? 'מתניע…' : 'התנעת מרוץ'}</span>
                <span className="rg-cta-arrow"><IconBolt /></span>
              </button>
              <button
                type="button"
                className="rg-cta is-secondary"
                onClick={() => navigate(ROUTES.HOME)}
                disabled={isSubmitting}
                style={{ width: 'auto', padding: '1.15rem 1.6rem' }}
              >
                <span className="rg-cta-arrow"><IconBack /></span>
                <span>בית</span>
              </button>
            </div>
          </form>
        </section>

        {/* ============ RIGHT: LIVE PREVIEW ============ */}
        <aside className="rg-panel is-magenta" aria-labelledby="rg-preview-h">
          <span className="rg-panel-corners" aria-hidden="true">
            <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
          </span>

          <header className="rg-panel-head">
            <div>
              <div className="rg-panel-eyebrow">Telemetry Preview</div>
              <h2 id="rg-preview-h" className="rg-panel-h2">תצוגת מקדימה</h2>
            </div>
            <IconTarget style={{ width: 32, height: 32, color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 8px rgba(0,243,255,0.6))' }} />
          </header>

          {/* Target Score Gauge */}
          <div style={{ marginTop: '0.4rem' }}>
            <div className="rg-section-title">Target Score</div>
            <div className="rg-gauge" aria-hidden="true">
              <svg viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="rg-gauge-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00F3FF" />
                    <stop offset="100%" stopColor="#BC13FE" />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r={R} fill="none" strokeWidth="10" className="rg-gauge-track" />
                <circle cx="80" cy="80" r={R} fill="none" strokeWidth="10" strokeLinecap="round"
                  className="rg-gauge-fill"
                  strokeDasharray={C}
                  strokeDashoffset={gaugeOffset} />
              </svg>
              <div className="rg-gauge-center">
                <div>
                  <div className="rg-gauge-val">{numericScore || 0}</div>
                  <div className="rg-gauge-cap">Points to Win</div>
                </div>
              </div>
            </div>
          </div>

          {/* Race Title Preview */}
          <div style={{ marginTop: '1.2rem' }}>
            <div className="rg-section-title">Race Name</div>
            <div style={{
              padding: '0.9rem 1.1rem',
              background: 'linear-gradient(180deg, rgba(11,15,25,0.7), rgba(5,7,16,0.55))',
              border: '1px solid rgba(199,208,224,0.16)',
              borderBottom: '2px solid var(--neon-purple)',
              clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: title.trim() ? '#fff' : 'var(--text-dim)',
              letterSpacing: '0.04em',
              textAlign: 'right',
              minHeight: '24px',
            }}>
              {title.trim() || 'ממתין לשם…'}
            </div>
          </div>

          {/* Visibility chip */}
          <div style={{ marginTop: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
            <div className="rg-section-title" style={{ margin: 0 }}>Visibility</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.45rem 0.85rem',
              background: isPrivateRace ? 'rgba(188,19,254,0.12)' : 'rgba(0,255,136,0.10)',
              border: `1px solid ${isPrivateRace ? 'rgba(188,19,254,0.5)' : 'rgba(0,255,136,0.45)'}`,
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: isPrivateRace ? '#E9C6FF' : '#B6FFD9',
            }}>
              {isPrivateRace ? <IconLock width="14" height="14" /> : <IconFlag width="14" height="14" />}
              {isPrivateRace ? 'מרוץ פרטי' : 'פתוח לכולם'}
            </div>
          </div>
        </aside>
      </main>

      <footer className="rg-telemetry" aria-hidden="true">
        <span className="rg-telemetry-item"><span>Mode</span><span className="val">SETUP</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>Drivers</span><span className="val">0 / 8</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>Status</span><span className="val">AWAITING IGNITION</span></span>
      </footer>
    </div>
  );
};

export default TeacherCreateRacePage;
