import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ROUTES } from '../config/routePaths';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import introVideo from '../assets/intro-bg.mp4';

const IconVolume = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);
const IconExit = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconChev = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconWheel = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3.2" />
    <line x1="12" y1="2" x2="12" y2="8.8" />
    <line x1="4.2" y1="16" x2="9.4" y2="13.4" />
    <line x1="19.8" y1="16" x2="14.6" y2="13.4" />
  </svg>
);
const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 2L4.5 13.5h6L9 22l9.5-12.5h-6L13 2z" />
  </svg>
);

const HomePage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const coverRef = useRef(null);
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const cover = coverRef.current;
    if (!video || !cover) return undefined;

    const FADE_BEFORE_END = 0.5;
    let fading = false;

    const onPlaying = () => {
      setVideoReady(true);
    };

    const onTimeUpdate = () => {
      if (video.currentTime > 0) {
        setVideoReady(true);
      }
      if (!video.duration) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= FADE_BEFORE_END && !fading) {
        fading = true;
        cover.style.opacity = '1';
      }
    };

    const onSeeked = () => {
      if (fading) {
        fading = false;
        cover.style.opacity = '0';
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeked', onSeeked);

    const tryPlayWithSound = async () => {
      video.muted = false;
      video.volume = 1;
      try {
        await video.play();
        setVideoReady(true);
      } catch {
        video.muted = true;
        setNeedsUnmute(true);
        try {
          await video.play();
          setVideoReady(true);
        } catch { /* poster shows */ }
      }
    };
    tryPlayWithSound();

    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeked', onSeeked);
    };
  }, []);

  const handleUnmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video.play().catch(() => {});
    setNeedsUnmute(false);
  };

  const handleLogout = () => {
    Cookies.remove(COOKIE_TEACHER_TOKEN);
    navigate(0);
  };

  const isTeacherLoggedIn = !!Cookies.get(COOKIE_TEACHER_TOKEN);

  return (
    <div className={`rg-stage is-video ${videoReady ? 'video-ready' : 'video-loading'}`} dir="rtl">
      <video
        ref={videoRef}
        className="rg-home-video"
        src={introVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div ref={coverRef} className="rg-home-loop-cover" aria-hidden="true" />

      {needsUnmute && (
        <button type="button" className="rg-audio-toggle" onClick={handleUnmute} aria-label="הפעל שמע">
          <IconVolume />
          <span>הפעל שמע</span>
        </button>
      )}

      <header className="rg-hud" dir="ltr">
        <div className="rg-hud-logo">
          <div className="rg-hud-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 4h12v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V4z" stroke="#00F3FF" strokeWidth="1.8" fill="rgba(0,243,255,0.10)" />
              <path d="M12 16v5M8 21h8" stroke="#00F3FF" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M10 7.5h4M12 5.5v4M10 11.5h4" stroke="#BC13FE" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="rg-hud-logo-text">
            <span className="top">MATH RACE</span>
            <span className="sub">Innovative Learning Race</span>
          </div>
        </div>

        <div className="rg-hud-meta">
          <span className="dot" aria-hidden="true" />
          <span>SYSTEM ONLINE · v2.1</span>
        </div>

        {isTeacherLoggedIn ? (
          <span className="rg-resume" dir="rtl" aria-label="חיבור פעיל כמורה">
            <span className="dot" aria-hidden="true" />
            <span>מורה מחובר · ACTIVE</span>
            <button type="button" className="exit" onClick={handleLogout}>
              <IconExit />
              <span>יציאה</span>
            </button>
          </span>
        ) : <span style={{ width: 1 }} aria-hidden="true" />}
      </header>

      <main className="rg-home-main">
        {/* TITLE CARD */}
        <section className="rg-title-card">
          <span className="rg-title-eyebrow">
            <span className="pulse" aria-hidden="true" />
            <span>Welcome to the Grid</span>
          </span>

          <h1 className="rg-title-wordmark">
            <span>MATH RACE</span>
            <span className="rg-title-flag" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, i) => <div key={i} />)}
            </span>
          </h1>

          <p className="rg-title-tagline">
            בחרו את עמדת המוצא שלכם במרוץ הלמידה החכם —
            <br />
            <span className="accent">צאו להאצה אל ההצלחה.</span>
          </p>

          <div className="rg-divider" aria-hidden="true" style={{ margin: '1.2rem auto 0' }}>
            <span className="bar" /><span className="chev" /><span className="bar" />
          </div>
        </section>

        {/* DRIVER SELECT — two career-mode cards */}
        <section className="rg-driver-select" aria-label="בחרו מסלול כניסה">
          <button
            type="button"
            className="rg-driver-card is-right"
            style={{ '--accent': 'var(--neon-cyan)' }}
            onClick={() => navigate(isTeacherLoggedIn ? ROUTES.TEACHER_CREATE_RACE : ROUTES.TEACHER_LOGIN)}
          >
            <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div className="rg-driver-eyebrow">Career Mode · מורה</div>
                <h2 className="rg-driver-title">הכנס כמורה</h2>
                <p className="rg-driver-sub">
                  בנו מרוצים, נהלו את הגריד ועקבו אחר הביצועים של תלמידיכם בזמן אמת.
                </p>
              </div>
              <div className="rg-driver-icon" aria-hidden="true"><IconWheel /></div>
            </header>

            <div className="rg-driver-row">
              <div style={{ display: 'flex', gap: '1.2rem' }}>
                <div className="rg-driver-stat">
                  <span className="k">Manage</span>
                  <span className="v">8 LANES</span>
                </div>
                <div className="rg-driver-stat">
                  <span className="k">Mode</span>
                  <span className="v">PIT LANE</span>
                </div>
              </div>
              <span className="rg-driver-cta">
                <span>{isTeacherLoggedIn ? 'המשך לחדר' : 'כניסת מורה'}</span>
                <span className="arrow"><IconChev /></span>
              </span>
            </div>
          </button>

          <button
            type="button"
            className="rg-driver-card is-left"
            style={{ '--accent': 'var(--neon-purple)' }}
            onClick={() => navigate(ROUTES.STUDENT_JOIN)}
          >
            <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div className="rg-driver-eyebrow">Quick Race · תלמיד</div>
                <h2 className="rg-driver-title">הכנס כתלמיד</h2>
                <p className="rg-driver-sub">
                  קבלו קוד מהמורה, השתבצו לעמדה על הגריד והתחילו לדהור אל קו הסיום.
                </p>
              </div>
              <div className="rg-driver-icon" aria-hidden="true"><IconBolt /></div>
            </header>

            <div className="rg-driver-row">
              <div style={{ display: 'flex', gap: '1.2rem' }}>
                <div className="rg-driver-stat">
                  <span className="k">Action</span>
                  <span className="v">JOIN GRID</span>
                </div>
                <div className="rg-driver-stat">
                  <span className="k">Mode</span>
                  <span className="v">LIVE RACE</span>
                </div>
              </div>
              <span className="rg-driver-cta">
                <span>אל הקוד</span>
                <span className="arrow"><IconChev /></span>
              </span>
            </div>
          </button>
        </section>
      </main>

      <footer className="rg-telemetry rg-home-footer" aria-hidden="true">
        <span className="rg-telemetry-item"><span>הצליחו</span><span className="val">EXCEL</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>התחרו</span><span className="val">COMPETE</span></span>
        <span className="rg-telemetry-sep" />
        <span className="rg-telemetry-item"><span>למדו</span><span className="val">LEARN</span></span>
      </footer>
    </div>
  );
};

export default HomePage;
