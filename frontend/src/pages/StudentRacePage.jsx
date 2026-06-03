import React, { useEffect, useRef, useState } from 'react';
import RaceTrack from '../components/RaceTrack';
import PathChoiceModal from '../components/PathChoiceModal';
import QuestionCard from '../components/QuestionCard';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN } from '../config/cookieNames';
import { fetchStudentRaceState, fetchCurrentQuestion, submitAnswer, choosePath, useHelp } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';

const podiumKey = (rank) => (rank === 1 ? 'is-podium-1' : rank === 2 ? 'is-podium-2' : rank === 3 ? 'is-podium-3' : '');

const FeedbackOverlay = ({ event }) => {
  if (!event) return null;
  const isCorrect = event.includes('נכונה');
  const isTimeout = event.includes('זמן');
  const variant = isCorrect ? 'is-success' : isTimeout ? 'is-timeout' : 'is-error';
  const eyebrow = isCorrect ? 'CORRECT' : isTimeout ? 'TIME UP' : 'WRONG';
  const icon = isCorrect ? '🏁' : isTimeout ? '⏱' : '💥';
  return (
    <div className="rg-feedback-overlay" aria-hidden="true">
      <div className={`rg-feedback-card ${variant}`}>
        <div style={{ fontSize: '2.6rem', marginBottom: '0.25rem' }}>{icon}</div>
        <div className="rg-feedback-eyebrow">{eyebrow}</div>
        <div className="rg-feedback-title">{event}</div>
      </div>
    </div>
  );
};

const LuckOverlay = ({ luck }) => {
  if (!luck) return null;
  const isBoost = luck.type === 'BOOST';
  const eyebrow = isBoost ? 'NITROUS ENGAGED' : 'TIRE PUNCTURE';
  return (
    <div className="rg-feedback-overlay" aria-hidden="true">
      <div className={`rg-feedback-card ${isBoost ? 'is-boost' : 'is-puncture'}`}>
        <div className="rg-feedback-eyebrow">{eyebrow}</div>
        <div className="rg-feedback-title" style={{ fontSize: 'clamp(1.2rem, 3.4vh, 1.7rem)', fontStyle: 'normal' }}>{luck.text}</div>
      </div>
    </div>
  );
};

const FrozenOverlay = ({ seconds }) => (
  <div className="rg-frozen-overlay">
    <div className="rg-frozen-card">
      <div className="rg-frozen-icon" aria-hidden="true">🧊</div>
      <div className="rg-frozen-eyebrow">Engine Frozen · Pit Stop</div>
      <div className="rg-frozen-title">קפוא!</div>
      <div className="rg-frozen-countdown">{String(seconds).padStart(2, '0')}s</div>
      <div className="rg-frozen-foot">מערכת נעולה · ממתינים להפשרה</div>
    </div>
  </div>
);

const DisconnectOverlay = () => (
  <div className="rg-disconnect">
    <div className="rg-disconnect-card">
      <div className="rg-disconnect-eyebrow">Signal Lost</div>
      <div className="rg-disconnect-title">החיבור נותק</div>
      <div className="rg-disconnect-sub">Reconnecting · מתחבר מחדש…</div>
    </div>
  </div>
);

const StudentRacePage = () => {
  const { raceId } = useParams();
  const [state, setState] = useState(null);
  const [question, setQuestion] = useState(null);
  const [event, setEvent] = useState(null);
  const [sseError, setSseError] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [frozenTimeRemaining, setFrozenTimeRemaining] = useState(0);
  const [luckPopup, setLuckPopup] = useState(null);
  const prevMultiplierRef = useRef(1);
  const luckTimeoutRef = useRef(null);
  const eventTimeoutRef = useRef(null);
  const fetchSequenceRef = useRef(0);
  const navigate = useNavigate();

  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  const activeLuckMultiplier = Number(state?.playerState?.activeLuckMultiplier || 1);

  const fetchStateAndQuestion = async () => {
    const currentSeq = ++fetchSequenceRef.current;
    try {
      const stateRes = await fetchStudentRaceState(raceId);
      if (currentSeq !== fetchSequenceRef.current) return;

      let newState = stateRes.data;
      setState(newState);

      if (newState.raceStatus === 'FINISHED' || (newState.playerState && newState.playerState.raceFinished)) {
        navigate(ROUTES.STUDENT_RESULTS(raceId));
        return;
      }

      if (newState.canPlay && !newState.playerState.hasPendingDecision && newState.playerState.status !== 'FROZEN') {
        const qRes = await fetchCurrentQuestion(raceId);
        if (currentSeq !== fetchSequenceRef.current) return;

        if (qRes.data) {
          setQuestion(qRes.data);
        } else {
          const recoveryRes = await fetchStudentRaceState(raceId);
          if (currentSeq !== fetchSequenceRef.current) return;

          newState = recoveryRes.data;
          setState(newState);

          if (newState.raceStatus === 'FINISHED' || (newState.playerState && newState.playerState.raceFinished)) {
            navigate(ROUTES.STUDENT_RESULTS(raceId));
            return;
          }
          setQuestion(null);
        }
      } else {
        setQuestion(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!token) return navigate(ROUTES.STUDENT_JOIN);

    let isMounted = true;

    const evtSource = createSSEConnection('/subscribe-student-race', { token, raceId }, {
      onOpen: () => {
        if (isMounted) {
          setSseError(false);
          fetchStateAndQuestion();
        }
      },
      onError: () => { if (isMounted) setSseError(true); },
      events: {
        'participant-progress-updated': () => { if (isMounted) fetchStateAndQuestion(); },
        'race-finished': () => { if (isMounted) navigate(ROUTES.STUDENT_RESULTS(raceId)); },
      },
    });

    return () => {
      isMounted = false;
      evtSource.close();
    };
  }, [raceId, navigate, token]);

  useEffect(() => {
    let interval = null;
    if (state?.playerState?.status === 'FROZEN' && state?.playerState?.freezeUntil) {
      const calculateRemaining = () => {
        const remaining = Math.max(0, state.playerState.freezeUntil - Math.floor(Date.now() / 1000));
        setFrozenTimeRemaining(remaining);
        if (remaining === 0) {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          fetchStateAndQuestion();
        }
      };
      calculateRemaining();
      interval = setInterval(calculateRemaining, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [state]);

  useEffect(() => {
    if (activeLuckMultiplier !== prevMultiplierRef.current) {
      if (luckTimeoutRef.current) { clearTimeout(luckTimeoutRef.current); luckTimeoutRef.current = null; }
      if (activeLuckMultiplier > 1 && prevMultiplierRef.current === 1) {
        setLuckPopup({ type: 'BOOST', text: '⚡ בוסט פעיל! התשובה הנכונה הבאה שווה פי 1.5' });
        luckTimeoutRef.current = setTimeout(() => setLuckPopup(null), 2000);
      } else if (activeLuckMultiplier < 1 && prevMultiplierRef.current === 1) {
        setLuckPopup({ type: 'PUNCTURE', text: '⚠️ פנצ\'ר! התשובה הנכונה הבאה תעניק חצי מהנקודות' });
        luckTimeoutRef.current = setTimeout(() => setLuckPopup(null), 2000);
      }
      prevMultiplierRef.current = activeLuckMultiplier;
    }
  }, [activeLuckMultiplier]);

  useEffect(() => () => {
    if (luckTimeoutRef.current) clearTimeout(luckTimeoutRef.current);
    if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
  }, []);

  const handlePathChoice = async (choice) => {
    try { await choosePath(raceId, choice); fetchStateAndQuestion(); } catch (e) { console.error(e); }
  };
  const handleHelpChoice = async (choice) => {
    try { await useHelp(raceId, choice); fetchStateAndQuestion(); } catch (e) { console.error(e); }
  };
  const handleSubmitAnswer = async (answer) => {
    if (isAnswering) return;
    if (state?.playerState?.status === 'FROZEN') return;
    setIsAnswering(true);
    const isTimeout = answer === '' || answer === -1 || answer === '-1';
    try {
      const res = await submitAnswer(raceId, question?.questionId || '', answer);
      if (res.data.success) {
        if (res.data.isCorrect) setEvent('תשובה נכונה!');
        else if (isTimeout) setEvent('נגמר הזמן!');
        else setEvent('תשובה שגויה!');
        setQuestion(null);
        fetchStateAndQuestion();
        if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
        eventTimeoutRef.current = setTimeout(() => setEvent(null), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnswering(false);
    }
  };

  if (!state || !state.playerState) {
    return (
      <div className="rg-fullscreen">
        <div className="label">טוען נתונים…</div>
      </div>
    );
  }

  const playerRank = state.playerState.rank || 1;
  const playerPoints = state.playerState.points ?? 0;
  const totalDrivers = state.participantsPositions?.length ?? 0;
  const decisionPct = state.playerState.decisionMeter || 0;
  const isFrozen = state.playerState.status === 'FROZEN';
  const hasDecision = !!state.playerState.hasPendingDecision;

  return (
    <div className="rg-race-stage">
      {sseError && <DisconnectOverlay />}

      {/* HUD STRIP */}
      <header className="rg-race-hud">
        <div className="rg-race-hud-left">
          <span className="rg-live"><span>Live · שידור חי</span></span>
          <span className={`rg-rank-chip ${podiumKey(playerRank)}`}>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.3em', color: 'var(--metallic-dim)' }}>POS</span>
            <span className="num">{playerRank}</span>
            <span className="total"> / {totalDrivers}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
          <div className="rg-points" aria-live="polite">
            <span className="v">{playerPoints}</span>
            <span className="u">PTS · נק'</span>
          </div>
          {activeLuckMultiplier > 1 && (
            <span className="rg-luck is-boost"><span>NITRO</span><span className="mult">×1.5</span></span>
          )}
          {activeLuckMultiplier < 1 && (
            <span className="rg-luck is-puncture"><span>PUNCT</span><span className="mult">×0.5</span></span>
          )}
        </div>

        <div className="rg-race-hud-right">
          <div className="rg-decision" aria-label="Decision Meter">
            <div className="rg-decision-label"><span>Decision · מד החלטה</span><span className="v">{decisionPct}%</span></div>
            <div className="rg-decision-bar">
              <div className="rg-decision-fill" style={{ width: `${Math.min(100, Math.max(0, decisionPct))}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* TRACK SHELL */}
      <div className="rg-race-track-shell">
        <RaceTrack
          participantsPositions={state.participantsPositions}
          currentUserId={state.playerState.id}
        />
      </div>

      {/* BOTTOM SHELL — Question / Path Choice / Frozen / Wait */}
      <div className="rg-race-bottom-shell">
        {isFrozen && <FrozenOverlay seconds={frozenTimeRemaining} />}
        <FeedbackOverlay event={event} />
        <LuckOverlay luck={luckPopup} />

        {hasDecision ? (
          <PathChoiceModal isOpen onChoice={handlePathChoice} />
        ) : question ? (
          isAnswering ? (
            <div className="rg-wait-banner">
              <div className="rg-wait-pill">
                <span className="lights" aria-hidden="true"><span /><span /><span /></span>
                <span>מעלה תשובה…</span>
              </div>
            </div>
          ) : (
            <QuestionCard
              question={question}
              onSubmitAnswer={handleSubmitAnswer}
              onExpire={() => handleSubmitAnswer('')}
              hasPendingHelpChoice={state.playerState.hasPendingHelpChoice}
              onHelpChoice={handleHelpChoice}
            />
          )
        ) : (
          !isFrozen && (
            <div className="rg-wait-banner">
              <div className="rg-wait-pill">
                <span className="lights" aria-hidden="true"><span /><span /><span /></span>
                <span>ממתין לשלב הבא</span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentRacePage;
