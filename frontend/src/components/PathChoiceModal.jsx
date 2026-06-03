import React from 'react';

const PathChoiceModal = ({ isOpen, onChoice }) => {
  if (!isOpen) return null;
  return (
    <div className="rg-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rg-path-h">
      <div className="rg-path-panel">
        <div className="rg-path-eyebrow">Intersection Ahead</div>
        <h1 id="rg-path-h" className="rg-path-title">צומת דרכים!</h1>
        <p className="rg-path-sub">בחרו את המסלול שלכם לשלב הבא</p>

        <div className="rg-path-grid">
          {/* HIGHWAY */}
          <button type="button" className="rg-path-card is-highway" onClick={() => onChoice('HIGHWAY')}>
            <div className="rg-path-card-eyebrow">High Risk · אוטוסטרדה</div>
            <h2 className="rg-path-card-name">אוטוסטרדה</h2>
            <div className="rg-path-card-sub">מסלול מהיר ומסוכן · 2 שאלות קשות</div>

            <div className="rg-path-card-svg" aria-hidden="true">
              <svg width="120" height="68" viewBox="0 0 100 60" fill="none" stroke="var(--speed-red)" strokeLinecap="round">
                <path d="M 12 56 L 44 8 L 56 8 L 88 56" strokeWidth="3" opacity="0.95" filter="url(#hwy-glow)" />
                <path d="M 50 8 L 50 56" strokeDasharray="4 6" strokeWidth="1.5" opacity="0.6" />
                <path d="M 25 38 H 75" strokeWidth="1" opacity="0.35" />
                <path d="M 33 24 H 67" strokeWidth="1" opacity="0.35" />
                <path d="M 41 14 H 59" strokeWidth="1" opacity="0.35" />
                <defs>
                  <filter id="hwy-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
              </svg>
            </div>

            <div className="rg-path-card-divider" />

            <div className="rg-path-card-stats">
              <span>⚡ 2 שאלות קשות</span>
              <span>💎 125 נק' / תשובה</span>
            </div>

            <div className="rg-path-card-badge">🏆 סיכון גבוה · תגמול ענק</div>
          </button>

          {/* DIRT ROAD */}
          <button type="button" className="rg-path-card is-dirt" onClick={() => onChoice('DIRT_ROAD')}>
            <div className="rg-path-card-eyebrow">Safe Route · דרך עפר</div>
            <h2 className="rg-path-card-name">דרך עפר</h2>
            <div className="rg-path-card-sub">מסלול יציב וזהיר · 3 שאלות קלות</div>

            <div className="rg-path-card-svg" aria-hidden="true">
              <svg width="120" height="68" viewBox="0 0 100 60" fill="none" stroke="var(--speed-amber)" strokeLinecap="round">
                <path d="M 12 56 C 22 42, 78 40, 84 30 C 90 20, 18 16, 52 6" strokeWidth="3" opacity="0.95" filter="url(#dirt-glow)" />
                <path d="M 6 58 L 14 48" strokeWidth="1" opacity="0.45" />
                <path d="M 96 32 L 88 28" strokeWidth="1" opacity="0.45" />
                <path d="M 12 24 L 24 21" strokeWidth="1" opacity="0.45" />
                <defs>
                  <filter id="dirt-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
              </svg>
            </div>

            <div className="rg-path-card-divider" />

            <div className="rg-path-card-stats">
              <span>🛡️ 3 שאלות קלות</span>
              <span>📈 22 נק' / תשובה</span>
            </div>

            <div className="rg-path-card-badge">🛡️ דרך בטוחה · נקודות יציבות</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PathChoiceModal;
