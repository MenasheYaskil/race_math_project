import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
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
const IconLock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconShield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 11 11 13 15 9" />
  </svg>
);
const IconChev = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const TeacherLoginPage = () => {
  const [username, setUsername] = useState('teacher');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('usernameOrEmail', username);
      formData.append('password', password);
      const res = await axios.post(`${API_BASE}/teacher-login`, formData);
      if (res.data.success) {
        Cookies.set(COOKIE_TEACHER_TOKEN, res.data.token);
        navigate(ROUTES.TEACHER_CREATE_RACE);
      } else {
        setError(res.data.message || 'פרטי התחברות שגויים.');
      }
    } catch (err) {
      setError('ההתחברות נכשלה. בדקו את החיבור ונסו שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rg-stage" dir="rtl">
      <RacingBackdrop variant="cyan" speed={5.5} intensity={1.0} />

      <header className="rg-hud" dir="ltr">
        <div className="rg-hud-logo">
          <div className="rg-hud-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 4h12v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V4z" stroke="#00F3FF" strokeWidth="1.8" fill="rgba(0,243,255,0.10)" />
              <path d="M10 7.5h4M12 5.5v4M10 11.5h4" stroke="#BC13FE" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 16v5M8 21h8" stroke="#00F3FF" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="rg-hud-logo-text">
            <span className="top">MATH RACE</span>
            <span className="sub">Teacher Pit Lane</span>
          </div>
        </div>

        <div className="rg-hud-meta">
          <span className="dot" aria-hidden="true" />
          <span>SYSTEM ONLINE</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="rg-ghost-btn"
          dir="rtl"
        >
          <IconUser />
          <span>שינוי משתמש</span>
        </button>
      </header>

      <main className="rg-tlogin-main">
        <div className="rg-tlogin-card">
          <section className="rg-panel">
            <span className="rg-panel-corners" aria-hidden="true">
              <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
            </span>

            <div className="rg-tlogin-avatar" aria-hidden="true">
              <IconUser />
            </div>

            <h1 className="rg-title">התחברות מורה</h1>
            <div className="rg-divider" aria-hidden="true">
              <span className="bar" /><span className="chev" /><span className="bar" />
            </div>
            <p className="rg-subtitle">
              היכנסו ללוח הבקרה לניהול מירוצים,
              <br />
              מעקב התקדמות תלמידים ויצירת חוויית למידה מנצחת.
            </p>

            {error && (
              <div className="rg-error" role="alert" style={{ marginTop: '1.1rem' }}>
                {error}
              </div>
            )}

            <form className="rg-tlogin-form" onSubmit={handleLogin} noValidate>
              <div className="rg-field">
                <label htmlFor="tl-user" className="rg-field-label">שם משתמש</label>
                <div className="rg-field-wrap">
                  <input
                    id="tl-user"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="הזינו שם משתמש"
                    className={`rg-input${error ? ' is-error' : ''}`}
                    required
                  />
                  <span className="rg-input-icon" aria-hidden="true"><IconUser /></span>
                </div>
              </div>

              <div className="rg-field">
                <label htmlFor="tl-pass" className="rg-field-label">סיסמה</label>
                <div className="rg-field-wrap">
                  <input
                    id="tl-pass"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הזינו סיסמה"
                    className={`rg-input${error ? ' is-error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="rg-input-icon is-action"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="rg-cta" disabled={loading}>
                <span className="rg-cta-arrow"><IconChev /></span>
                <span>{loading ? 'מתחבר…' : 'התחברות'}</span>
              </button>
            </form>

            <div className="rg-tlogin-secure">
              <IconShield />
              <span>חיבור מאובטח · END-TO-END</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="rg-telemetry" aria-hidden="true">
        <span className="rg-telemetry-item"><span>Engine</span><span className="val">v2.1</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>Latency</span><span className="val">42ms</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>Grid</span><span className="val">READY</span></span>
      </footer>
    </div>
  );
};

export default TeacherLoginPage;
