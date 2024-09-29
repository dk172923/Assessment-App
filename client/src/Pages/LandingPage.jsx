import React, { useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import Header from '../Components/Header'; // Import Header component
import Footer from '../Components/Footer'; // Import Footer component
import welcomeImage from '../assets/welcome.svg'; // Import your image here

const LandingPage = () => {
  // State to manage hover effect
  const [hoveredCard, setHoveredCard] = useState(null);

  // Functions to handle hover in and out
  const handleMouseEnter = (card) => setHoveredCard(card);
  const handleMouseLeave = () => setHoveredCard(null);

  return (
    <>
      <Header showUserButton={false} /> {/* Header without UserButton */}
      <Container fluid className="vh-100 d-flex align-items-center">
        <Row className="w-100">
          <Col md={6} className="text-center text-md-start">
            <h1 className="display-4 mb-3 fw-bold">Welcome to the Assessment Platform</h1>
            <p className="lead mb-4">Sign in or register to continue and experience seamless assessments.</p>
          </Col>
          <Col md={6} className="text-center">
            <Image src={welcomeImage} fluid className="img-fluid" alt="Welcome" style={{ width: '90%', height: 'auto', borderRadius: '5%' }} />
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <Container fluid className="features-section py-5">
        <Row className="text-center">
          <Col>
            <h2 className="mb-4">Platform Features</h2>
          </Col>
        </Row>
        <Row className="text-center">
          <Col md={4}>
            <Card
              className="mb-4 shadow-sm"
              onMouseEnter={() => handleMouseEnter(1)}
              onMouseLeave={handleMouseLeave}
              style={{
                backgroundColor: hoveredCard === 1 ? '#f8f9fa' : 'white',
                transition: 'background-color 0.3s ease',
              }}
            >
              <Card.Body>
                <Card.Title>Real-Time Monitoring</Card.Title>
                <Card.Text>
                  Monitor student activity live during assessments, ensuring a secure and reliable environment.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="mb-4 shadow-sm"
              onMouseEnter={() => handleMouseEnter(2)}
              onMouseLeave={handleMouseLeave}
              style={{
                backgroundColor: hoveredCard === 2 ? '#f8f9fa' : 'white',
                transition: 'background-color 0.3s ease',
              }}
            >
              <Card.Body>
                <Card.Title>AI-Powered Proctoring</Card.Title>
                <Card.Text>
                  Leverage AI technology to detect suspicious behaviors and maintain exam integrity.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="mb-4 shadow-sm"
              onMouseEnter={() => handleMouseEnter(3)}
              onMouseLeave={handleMouseLeave}
              style={{
                backgroundColor: hoveredCard === 3 ? '#f8f9fa' : 'white',
                transition: 'background-color 0.3s ease',
              }}
            >
              <Card.Body>
                <Card.Title>Detailed Reports</Card.Title>
                <Card.Text>
                  Receive in-depth reports with performance insights and detailed student analysis.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default LandingPage;
