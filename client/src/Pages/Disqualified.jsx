// Disqualified.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const Disqualified = () => {
  const location = useLocation();
  const { reason } = location.state || { reason: 'You have been disqualified.' };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Disqualified</h1>
      <p>{reason}</p>
    </div>
  );
};

export default Disqualified;
