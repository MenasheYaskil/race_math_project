import React, { useState } from 'react';
import TimerDisplay from './TimerDisplay';

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];

const QuestionCard = ({ question, onSubmitAnswer, onExpire, hasPendingHelpChoice, onHelpChoice }) => {
  const [answer, setAnswer] = useState('');
  const [skippedHelpQuestionId, setSkippedHelpQuestionId] = useState(null);

  if (!question) {
    return (
      <div className="rg-wait-banner">
        <div className="rg-wait-pill">
          <span className="lights" aria-hidden="true"><span /><span /><span /></span>
          <span>טוען שאלה…</span>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() !== '') {
      onSubmitAnswer(answer);
      setAnswer('');
    }
  };

  const hasOptions = Array.isArray(question.options) && question.options.length > 0;
  const helpVisible = hasPendingHelpChoice && skippedHelpQuestionId !== question.questionId;

  return (
    <div className="rg-q-cluster">
      {/* LEFT — Timer + Question + Hint + Help */}
      <section className="rg-q-left">
        <TimerDisplay expiresAt={question.expiresAt} onExpire={() => onExpire(-1)} />

        <div className="rg-q-text">{question.questionText}</div>

        {question.hintText && (
          <div className="rg-q-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 21h6v-1H9v1zm3-19a8 8 0 0 0-5 14.3c.6.5 1 1.2 1 2v.7h8v-.7c0-.8.4-1.5 1-2A8 8 0 0 0 12 2z" />
            </svg>
            <span>{question.hintText}</span>
          </div>
        )}

        {helpVisible && (
          <div className="rg-help" role="group" aria-label="כלי סיוע">
            <button type="button" className="rg-help-btn rg-help-hint" style={{ '--accent': 'var(--neon-green)' }} onClick={() => onHelpChoice('HINT')}>
              <span className="ico">💡</span>
              <span>קבל רמז</span>
            </button>
            <button type="button" className="rg-help-btn" style={{ '--accent': 'var(--neon-purple)' }} onClick={() => onHelpChoice('REPLACE')}>
              <span className="ico">🔄</span>
              <span>החלף שאלה</span>
            </button>
            <button type="button" className="rg-help-btn" style={{ '--accent': 'var(--metallic)' }} onClick={() => setSkippedHelpQuestionId(question.questionId)}>
              <span className="ico">⏭</span>
              <span>דלג על סיוע</span>
            </button>
          </div>
        )}
      </section>

      {/* RIGHT — Answer Options or Text Input */}
      <section className="rg-q-right">
        {hasOptions ? (
          <div className="rg-opts">
            {question.options.map((opt, i) => {
              const text = opt.text || opt.label || opt;
              return (
                <button
                  key={opt.id || i}
                  type="button"
                  className="rg-opt"
                  onClick={() => onSubmitAnswer(opt.id ?? opt)}
                >
                  <span className="rg-opt-letter">{HEBREW_LETTERS[i] || String(i + 1)}</span>
                  <span>{text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <form className="rg-answer-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="rg-answer-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="הזינו תשובה"
              autoFocus
              inputMode="numeric"
              autoComplete="off"
            />
            <button type="submit" className="rg-cta">
              <span>שלח תשובה</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default QuestionCard;
