// src/Components/Footer.jsx
import React from 'react';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa'; // Social media icons
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="py-3 my-4 bg-light" style={{ borderRadius: '8px', width: '100%', position: 'relative' }}>
      {/* Navigation Links */}
      <Container fluid>
        <Row>
          <Col>
            <ul className="nav justify-content-center border-bottom pb-3 mb-3">
              <li className="nav-item"><a href="/" className="nav-link px-2 text-muted">Home</a></li>
              <li className="nav-item"><a href="/features" className="nav-link px-2 text-muted">Features</a></li>
              <li className="nav-item"><a href="/pricing" className="nav-link px-2 text-muted">Pricing</a></li>
              <li className="nav-item"><a href="/faqs" className="nav-link px-2 text-muted">FAQs</a></li>
              <li className="nav-item"><a href="/about" className="nav-link px-2 text-muted">About</a></li>
            </ul>
          </Col>
        </Row>

        {/* Social Media Icons */}
        <Row className="justify-content-center mb-3">
          <Col xs="auto">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted mx-2">
              <FaInstagram size={24} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted mx-2">
              <FaFacebookF size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted mx-2">
              <FaTwitter size={24} />
            </a>
          </Col>
        </Row>

        {/* Copyright Text */}
        <Row>
          <Col>
            <p className="text-center text-muted">© 2024 Company, Inc.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
