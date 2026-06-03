import React, { useEffect, useState } from 'react';

const EventBanner = ({ event }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [event]);

  if (!visible || !event) return null;

  return (
    <div style={{ background: '#FCD34D', padding: '1rem', textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', borderRadius: '0.5rem' }}>
      {event}
    </div>
  );
};

export default EventBanner;
