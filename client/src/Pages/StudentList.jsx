import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [tests, setTests] = useState({}); // To store test names

  useEffect(() => {
    const fetchInvitedStudents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/invited-students'); 
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStudents(data); // Assuming data is an array
      } catch (error) {
        setError('Error fetching invited students: ' + error.message);
      }
    };

    const fetchTests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tests'); 
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const testMap = data.reduce((map, test) => {
          map[test._id] = test.name; // Assuming the test object has a 'name' field
          return map;
        }, {});
        setTests(testMap);
      } catch (error) {
        setError('Error fetching tests: ' + error.message);
      }
    };

    fetchInvitedStudents();
    fetchTests();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container className="mt-5">
      <hr />
      <h2>Invited Students</h2>
      <hr /> <br /> <br />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Assessment Name</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student._id}>
              <td>{index + 1}</td>
              <td>{student.name}</td> 
              <td>{student.email}</td>
              <td>{tests[student.testId] || 'N/A'}</td> 
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default StudentList;
