import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import FacePhoneDetection from '../Components/FacePhoneDetection';

const TestPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams(); // Get testId from the URL
  const [testDetails, setTestDetails] = useState(null); // Store test details
  const [currentSection, setCurrentSection] = useState('objective'); // Track which section to show
  const [answers, setAnswers] = useState({}); // Store answers for each question
  const [timeLeft, setTimeLeft] = useState(0); // Timer state
  const [score, setScore] = useState(null); // Store total score after submission
  const location = useLocation();
  const { studentData } = location.state || {};

  const [output, setOutput] = useState(''); // For coding output
  const [codeLanguage, setCodeLanguage] = useState('javascript'); // Default language for coding questions
  const [loading, setLoading] = useState(true); // Loading state for the entire test UI
  const [timerStarted, setTimerStarted] = useState(false); // Track if the timer has started

  // Fetch the test details when the component mounts
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tests/${testId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch test details');
        }
        const data = await response.json();
        setTestDetails(data);
        setTimeLeft(data.duration * 60); // Convert duration to seconds

        // Set a timer to simulate loading for 10 seconds
        setTimeout(() => {
          setLoading(false); // Set loading to false after 10 seconds
          setTimerStarted(true); // Start the timer after loading
        }, 10000); // 10 seconds
      } catch (error) {
        console.error(error);
      }
    };

    fetchTestDetails();
  }, [testId]);

  // Timer setup to count down after loading
  useEffect(() => {
    if (timerStarted && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            handleSubmitTest(); // Submit test when time is up
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timerStarted, timeLeft]);

  // Handle answer changes
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  // Handle code language change
  const handleLanguageChange = (e) => {
    setCodeLanguage(e.target.value);
  };

  // Code execution using CodeX API
  const executeCode = async (code) => {
    const payload = {
      code: code,
      language: codeLanguage === 'javascript' ? 'js' : 'py',
      input: '',
    };

    try {
      const response = await fetch('https://api.codex.jaagrav.in/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString(),
      });

      const result = await response.json();
      if (result.status === 200) {
        setOutput(result.output || 'No output generated');
        return result.output; // Return output for comparison
      } else {
        setOutput(result.error || 'Error executing code');
        return null; // Handle error case
      }
    } catch (error) {
      console.error('Error executing code:', error);
      setOutput('Error executing code');
      return null; // Handle error case
    }
  };

  // Submit the test
  const handleSubmitTest = async () => {
    let correctCount = 0;
    const subjectiveScores = [];
    const codingScores = [];
    const sectionScores = {
      objective: 0,
      subjective: [],
      coding: [],
    };

    if (testDetails) {
      for (const question of testDetails.questions) {
        if (question.type === 'objective') {
          const userAnswer = answers[question._id];
          if (userAnswer === question.answer) {
            correctCount++;
            sectionScores.objective++;
          }
        } else if (question.type === 'subjective') {
          const userAnswer = answers[question._id];
          const response = await fetch('http://localhost:5000/api/evaluate-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question.question, answer: userAnswer }),
          });
          const data = await response.json();
          subjectiveScores.push(data.score);
          sectionScores.subjective.push(data.score);
        } else if (question.type === 'coding') {
          const userAnswer = answers[question._id];
          if (!userAnswer) {
            console.error('User has not provided a code answer');
            codingScores.push(0); // No answer, award 0 points
            continue; // Skip to the next question
          }

          const executionResult = await executeCode(userAnswer); // Wait for code execution
          const correctAnswer = question.answer;

          if (executionResult.trim() === correctAnswer.trim()) {
            codingScores.push(10);
          } else {
            codingScores.push(0); // No points if it doesn't match
          }
        }
      }

      const totalSubjectiveScore = subjectiveScores.reduce((acc, score) => acc + score, 0);
      sectionScores.subjective = totalSubjectiveScore;

      const totalCodingScore = codingScores.reduce((acc, score) => acc + score, 0);
      sectionScores.coding = totalCodingScore;

      const totalScore = correctCount + totalSubjectiveScore + totalCodingScore;
      const scorePercentage = (totalScore / (correctCount + subjectiveScores.length * 10 + codingScores.length * 10)) * 100;
      setScore(scorePercentage);

      const finalResults = {
        testDetails,
        studentDetails: studentData,
        scores: sectionScores,
      };

      try {
        const response = await fetch('http://localhost:5000/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalResults),
        });
        if (!response.ok) {
          throw new Error('Failed to store results in the database');
        }
        navigate('/submission', { state: finalResults });
      } catch (error) {
        console.error(error.message);
      }

      alert(`Test submitted successfully! Your total score is: ${scorePercentage.toFixed(2)}%`);
    }
  };

  const handleNextSection = () => {
    if (currentSection === 'objective') {
      setCurrentSection('subjective');
    } else if (currentSection === 'subjective') {
      setCurrentSection('coding');
    }
  };

  const formatTimeLeft = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Render the FacePhoneDetection component immediately
  return (
    <Container style={{ maxWidth: '800px', marginTop: '50px' }}>
      <FacePhoneDetection />

      {loading ? (
        <div style={{ textAlign: 'center', fontSize: '24px' }}>Loading test... Please wait.</div>
      ) : (
        <>
          {testDetails && (
            <>
              <h1 style={{ textAlign: 'center' }}>{testDetails.name}</h1>
              <p style={{ textAlign: 'center' }}>Duration: {testDetails.duration} minutes</p>
              <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: '24px' }}>
                Timer: {formatTimeLeft(timeLeft)}
              </div>

              <h3>{currentSection === 'objective' ? 'Objective Questions' : currentSection === 'subjective' ? 'Subjective Questions' : 'Coding Questions'}</h3>
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {testDetails.questions
                  .filter((question) => question.type === currentSection)
                  .map((question) => (
                    <li key={question._id}>
                      <strong>{question.question}</strong>

                      {/* Objective Questions */}
                      {question.type === 'objective' && (
                        <ul>
                          {question.options.map((option, index) => (
                            <li key={index}>
                              <Form.Check
                                type="radio"
                                label={option}
                                name={question._id}
                                value={option}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                checked={answers[question._id] === option}
                              />
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Subjective Questions */}
                      {question.type === 'subjective' && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Type your answer..."
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                          value={answers[question._id] || ''}
                        />
                      )}

                      {/* Coding Questions */}
                      {question.type === 'coding' && (
                        <>
                          <select onChange={handleLanguageChange} value={codeLanguage}>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                          </select>
                          <AceEditor
                            mode={codeLanguage === 'javascript' ? 'javascript' : 'python'}
                            theme="monokai"
                            name="codeEditor"
                            onChange={(value) => handleAnswerChange(question._id, value)}
                            fontSize={14}
                            width="100%"
                            height="200px"
                            showGutter={true}
                            highlightActiveLine={true}
                            value={answers[question._id] || ''}
                            setOptions={{
                              enableBasicAutocompletion: true,
                              enableLiveAutocompletion: true,
                              enableSnippets: true,
                              showLineNumbers: true,
                              tabSize: 2,
                            }}
                          />
                          <br />
                          <Button onClick={() => executeCode(answers[question._id])}>Run Code</Button>
                          <div>Output: {output}</div>
                        </>
                      )}
                    </li>
                  ))}
              </ul>

              {/* Button to navigate through sections */}
              <Button onClick={handleNextSection} disabled={currentSection === 'coding'} style={{ margin: '20px 0' }}>
                Next Section
              </Button> <br /> <br />
              <Button onClick={handleSubmitTest} style={{ margin: '20px 0' }}>
                Submit Test
              </Button>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default TestPage;
