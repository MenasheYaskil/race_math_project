import React from 'react';
import Modal from './Modal';
import Button from './Button';

const HelpChoiceModal = ({ isOpen, onChoice, onSkip }) => {
  return (
    <Modal isOpen={isOpen}>
      <div className="hebrew-text" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 1rem 0', color: 'var(--neon-purple)', textShadow: '0 0 15px var(--neon-purple)', fontSize: '2.5rem' }}>סיוע מערכת</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#ccc' }}>אפשרויות זמינות לעקוף מכשול זה:</p>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <button className="option-btn hebrew-text" onClick={() => onChoice('HINT')} style={{ flex: 1, flexDirection: 'column', gap: '1rem', padding: '1.5rem', fontSize: '1.5rem', color: 'var(--neon-green)', borderColor: 'var(--neon-green)', boxShadow: 'inset 0 0 10px rgba(0,255,0,0.2)' }}>
            💡 קבל רמז
          </button>
          <button className="option-btn hebrew-text" onClick={() => onChoice('REPLACE')} style={{ flex: 1, flexDirection: 'column', gap: '1rem', padding: '1.5rem', fontSize: '1.5rem', color: 'var(--neon-orange)', borderColor: 'var(--neon-orange)', boxShadow: 'inset 0 0 10px rgba(255,170,0,0.2)' }}>
            🔄 החלף שאלה
          </button>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button className="option-btn hebrew-text" onClick={onSkip} style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', color: '#aaa', borderColor: '#555', boxShadow: 'none' }}>
            דלג על סיוע
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HelpChoiceModal;
