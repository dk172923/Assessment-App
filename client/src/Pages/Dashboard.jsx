import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Table, Modal, Form } from 'react-bootstrap';
import Header from '../Components/Header';

const Dashboard = () => {
  const [tests, setTests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [csvFile, setCsvFile] = useState(null); // New state for CSV file

  useEffect(() => {
    const fetchTests = async () => {
      const response = await fetch('http://localhost:5000/api/tests');
      const data = await response.json();
      setTests(data);
    };
    fetchTests();
  }, []);

  const handleInviteClick = (testId) => {
    setSelectedTestId(testId);
    setShowModal(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file); // Store the uploaded file in state
    }
  };

  const handleInviteSubmit = async () => {
    if (csvFile) {
      // Process the CSV file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split(','));

        // Assuming the first row is header: ['name', 'email']
        const students = rows.slice(1).map(row => {
          if (row.length >= 2) {
            return {
              name: row[0].trim(),
              email: row[1].trim(),
            };
          }
          return null;
        }).filter(Boolean);

        // Loop through the students array and send invitations
        for (const student of students) {
          await sendInvitation(student.name, student.email);
        }
        
        alert('Invitations sent successfully!');

        // Reset the CSV file after processing
        setCsvFile(null);
        setShowModal(false); // Close the modal after alert is acknowledged
      };

      reader.readAsText(csvFile);
      // Do not close the modal until CSV processing is complete
    } else {
      // Send invitation for individual student
      const response = await fetch('http://localhost:5000/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: selectedTestId, email, name })
      });

      if (response.ok) {
        alert('Invitation sent successfully!');
      } else {
        alert('Error sending invitation');
      }

      // Clear individual student input fields
      setEmail('');
      setName('');
      setShowModal(false); // Close the modal after alert is acknowledged
    }
  };

  // Example function to send individual invitations
  const sendInvitation = async (name, email) => {
    const response = await fetch('http://localhost:5000/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId: selectedTestId, name, email }),
    });

    return response.ok; // Return whether the invitation was sent successfully
  };

  return (
    <>
      <Header showUserButton={true} />
      <Container className="mt-5">
        <hr />
        <h2 className="mb-4" style={{ color: 'black' }}>Instructor Dashboard</h2>
        <hr />
        <Row className="mb-4">
          <Col>
            <Link to="/create-test">
              <Button variant="primary" className="me-3">Create Assessment</Button>
            </Link>
            <Link to="/student-list">
              <Button variant="primary" className="me-3">Student List</Button>
            </Link>
            <Link to="/test-results">
              <Button variant="primary">View Assessment Results</Button>
            </Link>
          </Col>
        </Row>
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Assessment Name</th>
              <th>Duration (minutes)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, index) => (
              <tr key={test._id}>
                <td>{index + 1}</td>
                <td>{test.name}</td>
                <td>{test.duration}</td>
                <td>
                  <Button variant="success" onClick={() => handleInviteClick(test._id)}>Invite Students</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Invite Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Invite Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formName">
                <Form.Label style={{ textAlign: 'left' }}>Student Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={handleNameChange}
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label style={{ textAlign: 'left' }}>Student Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={handleEmailChange}
                />
              </Form.Group>
              {/* New CSV Upload Section */}
              <Form.Group controlId="formCSVUpload" className="mt-3">
                <Form.Label style={{ textAlign: 'left' }}>Upload CSV</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload} // CSV upload handler
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleInviteSubmit}>
              Send Invitation
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      
    </>
  );
};

export default Dashboard;
