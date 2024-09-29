import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate

const WorkInProgress = () => {
  const [showInstructions, setShowInstructions] = useState(false); // State for showing instructions modal
  const [showNotInvitedModal, setShowNotInvitedModal] = useState(false); // State for showing not invited modal
  const [modalMessage, setModalMessage] = useState('');
  const [formErrors, setFormErrors] = useState({}); // For tracking form errors
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    yearOfPassing: '',
    department: '',
  });
  const { testId } = useParams(); // Extract testId from the URL
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' }); // Clear error when user starts typing
  };

  // Validate form data before showing the instructions
  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.college) errors.college = 'College is required';
    if (!formData.yearOfPassing) errors.yearOfPassing = 'Year of Passing is required';
    if (!formData.department) errors.department = 'Department is required';

    return errors;
  };

  // Trigger the next step (show instructions modal)
  const handleNext = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Set errors to state and do not proceed
    } else {
      setShowInstructions(true); // Proceed if no errors
    }
  };

  const handleStartTest = async () => {
    try {
      // Close the instructions modal before verification
      setShowInstructions(false);

      // Verify if the student is invited to the test
      const verifyResponse = await fetch('http://localhost:5000/api/invite/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          testId,
        }),
      });

      const verifyData = await verifyResponse.json();

      // Check if the student is invited
      if (verifyData.invited === true) {
        // Fetch the results to see if the student has already taken the test
        const resultResponse = await fetch(`http://localhost:5000/api/results/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            testId,
          }),
        });

        const resultData = await resultResponse.json();

        // If the student has already attended the test
        if (resultData.hasAttended === true) {
          // Show a modal indicating they can't take the test again
          setShowNotInvitedModal(true); // Reuse the same modal with a different message
          setModalMessage('You can only attend the test once. You have already submitted your answers.');
        } else {
          // If they have not attended the test, proceed to the test page
          const response = await fetch(`http://localhost:5000/api/tests/${testId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch test details');
          }
          const data = await response.json();

          // Redirect to the test page with the test and student data
          navigate(`/test/${testId}`, { state: { testDetails: data, studentData: formData } });
        }
      } else {
        // If not invited, show the not invited modal
        setShowNotInvitedModal(true);
        setModalMessage('Sorry, it seems you are not invited to take this test.');
      }
    } catch (error) {
      console.error(error);
      alert('Error fetching test details or verifying invitation.');
    }
  };

  return (
    <Container style={{ maxWidth: '600px', marginTop: '50px' }}>
      <h1>Welcome to the Test</h1>
      <Form>
        {/* Name input field */}
        <Form.Group as={Row} controlId="formName" className="mb-3">
          <Form.Label column sm={4} className="text-start">Name</Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!formErrors.name}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* Email input field */}
        <Form.Group as={Row} controlId="formEmail" className="mb-3">
          <Form.Label column sm={4} className="text-start">Email</Form.Label>
          <Col sm={8}>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!formErrors.email}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* College input field */}
        <Form.Group as={Row} controlId="formCollege" className="mb-3">
          <Form.Label column sm={4} className="text-start">College</Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder="Enter your college"
              name="college"
              value={formData.college}
              onChange={handleChange}
              isInvalid={!!formErrors.college}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.college}</Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* Year of Passing input field */}
        <Form.Group as={Row} controlId="formYearOfPassing" className="mb-3">
          <Form.Label column sm={4} className="text-start">Year of Passing</Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder="Enter your year of passing"
              name="yearOfPassing"
              value={formData.yearOfPassing}
              onChange={handleChange}
              isInvalid={!!formErrors.yearOfPassing}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.yearOfPassing}</Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* Department input field */}
        <Form.Group as={Row} controlId="formDepartment" className="mb-3">
          <Form.Label column sm={4} className="text-start">Department</Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder="Enter your department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              isInvalid={!!formErrors.department}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.department}</Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* Next button */}
        <Button variant="primary" onClick={handleNext} style={{ marginTop: '20px' }}>
          Next
        </Button>
      </Form>

      {/* Modal for instructions */}
      <Modal show={showInstructions} onHide={() => setShowInstructions(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Instructions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please follow these instructions before starting the test:</p>
          <ul>
            <li>Grant permission to use your camera and microphone.</li>
            <li>Do not switch between tabs or windows.</li>
            <li>Do not reload the page.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInstructions(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleStartTest}>
            Start Test
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for not invited or already attended */}
      <Modal show={showNotInvitedModal} onHide={() => setShowNotInvitedModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modalMessage}</p> {/* Display dynamic message here */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotInvitedModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WorkInProgress;
