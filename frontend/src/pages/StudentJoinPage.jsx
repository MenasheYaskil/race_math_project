import React, { useState, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import RacingBackdrop from '../components/RacingBackdrop';

const IconUser = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconKey = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 2L4.5 13.5h6L9 22l9.5-12.5h-6L13 2z" />
  </svg>
);

const StartingLights = ({ phase }) => (
  <div className="rg-sjoin-lights" aria-hidden="true">
    <span className={`rg-sjoin-light red ${phase >= 1 ? 'on' : ''}`} />
    <span className={`rg-sjoin-light red ${phase >= 1 ? 'on' : ''}`} />
    <span className={`rg-sjoin-light amber ${phase >= 2 ? 'on' : ''}`} />
    <span className={`rg-sjoin-light amber ${phase >= 2 ? 'on' : ''}`} />
    <span className={`rg-sjoin-light green ${phase >= 3 ? 'on' : ''}`} />
  </div>
);

const StudentJoinPage = () => {
  const [raceCode, setRaceCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const lightsPhase = useMemo(() => {
    if (isLoading) return 3;
    if (raceCode.trim().length >= 4 && displayName.trim().length >= 2) return 2;
    if (raceCode.trim().length > 0 || displayName.trim().length > 0) return 1;
    return 0;
  }, [raceCode, displayName, isLoading]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('raceCode', raceCode.toUpperCase());
      formData.append('displayName', displayName);
      const res = await axios.post(`${API_BASE}/join-race`, formData);
      if (res.data.success) {
        Cookies.set(COOKIE_STUDENT_TOKEN, res.data.studentToken);
        Cookies.set(COOKIE_RACE_ID, res.data.raceId);
        navigate(ROUTES.STUDENT_LOBBY(res.data.raceCode));
      } else {
        setError(res.data.message || 'שגיאה בהצטרפות.');
      }
    } catch (err) {
      setError('ההצטרפות נכשלה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rg-stage" dir="rtl">
      <RacingBackdrop variant="ignition" speed={6.5} intensity={1.1} />

      <header className="rg-hud" dir="ltr">
        <div className="rg-hud-logo">
          <div className="rg-hud-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h4l3-7 4 14 3-7h4" stroke="#00F3FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="rg-hud-logo-text">
            <span className="top">MATH RACE</span>
            <span className="sub">Starting Grid</span>
          </div>
        </div>

        <div className="rg-hud-meta">
          <span className="dot" aria-hidden="true" />
          <span>RACE OPEN</span>
        </div>
      </header>

      <main className="rg-sjoin-main">
        <div className="rg-sjoin-hero">
          <span className="rg-sjoin-eyebrow"><span className="pulse" aria-hidden="true" />Live Race · מירוץ פעיל</span>
          <h1 className="rg-sjoin-title">
            <span>MATH RACE</span>
            <span className="rg-sjoin-title-flag" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, i) => <div key={i} />)}
            </span>
          </h1>
          <div className="rg-sjoin-subtitle">
            מרוץ חשבון חווייתי בזמן אמת
          </div>
        </div>

        <div className="rg-sjoin-card">
          <section className="rg-panel is-magenta">
            <span className="rg-panel-corners" aria-hidden="true">
              <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
            </span>

            <h2 className="rg-title" style={{ fontSize: 'clamp(1.5rem, 3.6vh, 2rem)' }}>הצטרפות למירוץ</h2>
            <div className="rg-divider" aria-hidden="true">
              <span className="bar" /><span className="chev" /><span className="bar" />
            </div>
            <p className="rg-subtitle">
              בחרו שם, הזינו את קוד החדר<br />והאיצו אל קו הזינוק.
            </p>

            {error && (
              <div className="rg-error" role="alert" style={{ marginTop: '1rem' }}>{error}</div>
            )}

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '1.1rem' }} noValidate>
              <div className="rg-field">
                <label htmlFor="sj-name" className="rg-field-label">שם נהג · DRIVER</label>
                <div className="rg-field-wrap">
                  <input
                    id="sj-name"
                    type="text"
                    className={`rg-input${error ? ' is-error' : ''}`}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="הזינו את שמכם"
                    required
                    disabled={isLoading}
                    maxLength={32}
                  />
                  <span className="rg-input-icon" aria-hidden="true"><IconUser /></span>
                </div>
              </div>

              <div className="rg-field">
                <label htmlFor="sj-code" className="rg-field-label">קוד חדר · RACE CODE</label>
                <div className="rg-field-wrap">
                  <input
                    id="sj-code"
                    type="text"
                    className={`rg-input is-plate${error ? ' is-error' : ''}`}
                    value={raceCode}
                    onChange={(e) => setRaceCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                    placeholder="ABCD"
                    required
                    disabled={isLoading}
                    autoCapitalize="characters"
                    spellCheck={false}
                  />
                </div>
              </div>

              <StartingLights phase={lightsPhase} />

              <button type="submit" className="rg-cta is-ignition" disabled={isLoading || lightsPhase < 2}>
                <span className="rg-cta-arrow"><IconBolt /></span>
                <span>{isLoading ? 'מתחבר…' : 'הצטרפות למירוץ'}</span>
                <span className="rg-cta-arrow"><IconBolt /></span>
              </button>
            </form>
          </section>
        </div>
      </main>

      <footer className="rg-telemetry" aria-hidden="true">
        <span className="rg-telemetry-item"><span>Grid</span><span className="val">P1</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>Tyres</span><span className="val">SOFT</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>DRS</span><span className="val">ARMED</span></span>
      </footer>
    </div>
  );
};

export default StudentJoinPage;
