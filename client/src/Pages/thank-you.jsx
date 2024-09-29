import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';

const ThankYouPage = () => {
  // Function to block the back button
  useEffect(() => {
    const blockBackButton = () => {
      window.history.pushState(null, null, window.location.pathname);
    };

    // Prevent the default back navigation
    blockBackButton();
    window.addEventListener('popstate', blockBackButton);

    return () => {
      window.removeEventListener('popstate', blockBackButton);
    };
  }, []);

  return (
    <Container style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Thank You!</h1>
      <p>Your submission has been received successfully.</p>
    </Container>
  );
};

export default ThankYouPage;
