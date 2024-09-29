import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Button, Table } from 'react-bootstrap';
import { jsPDF } from 'jspdf';

const SubmissionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testDetails, studentDetails, scores } = location.state || {};
  //console.log(testDetails);

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

  // Function to generate and download the PDF
  const downloadReport = async () => {
    const doc = new jsPDF();
    // navigate('/test/:testId/attend');
    doc.setFontSize(20);
    doc.text('Submission Summary', 20, 20);
    
    let y = 30; // Starting y position for text

    // Add Test Details
    if (testDetails) {
      doc.setFontSize(16);
      doc.text('Test Details:', 20, y);
      doc.setFontSize(12);
      doc.text(`Name: ${testDetails.name}`, 20, (y += 10));
      doc.text(`Duration: ${testDetails.duration} minutes`, 20, (y += 10));
      // Add more test details as needed
      y += 10; // Add some space before the next section
    }

    // Add Student Details
    if (studentDetails) {
      doc.setFontSize(16);
      doc.text('Student Details:', 20, y);
      doc.setFontSize(12);
      doc.text(`Name: ${studentDetails.name}`, 20, (y += 10));
      doc.text(`Email: ${studentDetails.email}`, 20, (y += 10));
      // Add more student details as needed
      y += 10; // Add some space before the next section
    }

    // Add Scores
    if (scores) {
      doc.setFontSize(16);
      doc.text('Scores:', 20, y);
      doc.setFontSize(12);
      doc.text(`Objective Score: ${scores.objective}`, 20, (y += 10));
      doc.text(`Subjective Score: ${scores.subjective}`, 20, (y += 10));
      doc.text(`Coding Score: ${scores.coding}`, 20, (y += 10));
      // Optionally calculate and display total score
      const totalScore = scores.objective + scores.subjective + scores.coding;
      doc.text(`Total Score: ${totalScore}`, 20, (y += 10));
    }

    // Generate PDF Blob
    const pdfBlob = doc.output('blob');
    doc.save('submission_report.pdf');

     // Create FormData for POST request
     const formData = new FormData();
     formData.append('file', pdfBlob, 'submission_report.pdf'); // Append the PDF file
     formData.append('email', studentDetails.email); // Append the student's email
     console.log(studentDetails.email);
     formData.append('testId', testDetails._id); // Adjust as necessary based on your test details structure
     console.log(testDetails._id);

    // Send the PDF to the backend
    try {
          await fetch('http://localhost:5000/send-pdf', {
              method: 'POST',
              body: formData,
          });

          // Navigate to the Thank You page after the PDF is sent
          navigate('/thank-you');
      } catch (error) {
          console.error('Error sending PDF:', error);
      }
  };

  return (
    <Container style={{ maxWidth: '800px', marginTop: '50px' }}>
      <h1>Submission Summary</h1>
      <hr />

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Category</th>
            <th>Detail</th>
            <th>Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan={2}>Test Details</td>
            <td>Name</td>
            <td>{testDetails?.name || "N/A"}</td>
          </tr>
          <tr>
            <td>Duration</td>
            <td>{testDetails?.duration + " minutes" || "N/A"}</td>
          </tr>
          <tr>
            <td rowSpan={2}>Student Details</td>
            <td>Name</td>
            <td>{studentDetails?.name || "N/A"}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>{studentDetails?.email || "N/A"}</td>
          </tr>
          <tr>
            <td rowSpan={4}>Scores</td>
            <td>Objective Score</td>
            <td>{scores?.objective || "N/A"}</td>
          </tr>
          <tr>
            <td>Subjective Score</td>
            <td>{scores?.subjective || "N/A"}</td>
          </tr>
          <tr>
            <td>Coding Score</td>
            <td>{scores?.coding || "N/A"}</td>
          </tr>
          <tr>
            <td>Total Score</td>
            <td>{scores ? scores.objective + scores.subjective + scores.coding : "N/A"}</td>
          </tr>
        </tbody>
      </Table>

      <Button onClick={downloadReport} variant="primary" style={{ marginTop: '20px' }}>
        Download Report
      </Button>
    </Container>
  );
};

export default SubmissionPage;
