import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';

const TestResults = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/results'); // Update the URL as needed
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setResults(data);
      } catch (error) {
        setError('Error fetching test results: ' + error.message);
      }
    };

    fetchTestResults();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container className="mt-5">
      <hr />
      <h2>Assessment Results</h2>
      <hr /> <br /> <br />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Assessment Name</th>
            <th>Objective Score</th>
            <th>Subjective Score</th>
            <th>Coding Score</th>
            <th>Total Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            const { objective, subjective, coding } = result.scores;
            const totalScore = objective + subjective + coding; // Calculate total score

            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{result.studentDetails.name}</td>
                <td>{result.testDetails.name}</td> {/* Assuming test name is stored here */}
                <td>{objective}</td>
                <td>{subjective}</td>
                <td>{coding}</td>
                <td>{totalScore}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default TestResults;
