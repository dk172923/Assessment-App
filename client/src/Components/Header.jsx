// src/Components/Header.jsx
import React from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = ({ showUserButton = true }) => {
  const navigate = useNavigate();

  return (
    <Navbar bg="light" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <img
            src="./vite.svg" // Replace with the path to your logo image
            alt="Logo"
            className="d-inline-block align-top"
            height="40"
          />
          <span className="ms-2">Assessment Platform</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            <Nav.Link href="/pricing" className="mx-2">Pricing</Nav.Link>
            <Nav.Link href="/about" className="mx-2">About</Nav.Link>
            <Nav.Link href="/contact-us" className="mx-2">Contact Us</Nav.Link>

            <SignedOut>
              <Nav.Link className="mx-2">
                <SignInButton mode="modal">
                  <button className="btn btn-primary">Sign In</button>
                </SignInButton>
              </Nav.Link>
              <Nav.Link className="mx-2">
                <SignUpButton mode="modal">
                <button onClick={() => navigate('/sign-up')} className="btn btn-outline-secondary">Sign Up</button>
                </SignUpButton>
              </Nav.Link>
            </SignedOut>

            {showUserButton && (
              <SignedIn>
                <Nav.Link className="mx-2">
                  <UserButton afterSignOutUrl="/" />
                </Nav.Link>
              </SignedIn>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
