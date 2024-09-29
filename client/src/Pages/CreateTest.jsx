import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CreateTest = () => {
  const [testName, setTestName] = useState('');
  const [testDuration, setTestDuration] = useState('');
  const [step, setStep] = useState(1);
  const [questionType, setQuestionType] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState({
    objective: [],
    subjective: [],
    coding: [],
  });

  const handleTestDetailsSubmit = () => {
    if (testName && testDuration) {
      setStep(2);
    }
  };

  const handleQuestionCountSubmit = () => {
    const newQuestions = Array.from({ length: questionCount }, () => ({
      type: questionType, // Add type here
      question: '',
      options: questionType === 'objective' ? ['', '', '', ''] : [],
      answer: '',
    }));

    setQuestions((prev) => ({
      ...prev,
      [questionType]: newQuestions,
    }));
    setQuestionCount(0);
  };

  const handleQuestionChange = (type, index, field, value) => {
    const updatedQuestions = [...questions[type]];
    if (field === 'options') {
      updatedQuestions[index].options = value;
    } else {
      updatedQuestions[index][field] = value;
    }
    setQuestions((prev) => ({ ...prev, [type]: updatedQuestions }));
  };

  const handleSubmitTest = async () => {
    const testDetails = {
      name: testName,
      duration: testDuration,
      questions: [
        ...questions.objective,
        ...questions.subjective,
        ...questions.coding,
      ],
    };

    const response = await fetch('http://localhost:5000/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testDetails),
    });

    const result = await response.json();
    console.log(result);

    if (response.ok) {
      console.log('Test submitted successfully');
      navigate('/dashboard');
      // Reset the form or navigate away
    } else {
      console.log('Failed to submit test');
    }
  };

  return (
    <Container className="mt-5">
      <hr/>
      <h2>Create an Assessment</h2>
      <hr/>
      <br/><br/>
      {step === 1 ? (
        <Form>
          <Form.Group controlId="testName" className="mb-4">
            <Form.Label><b>ASSESSMENT NAME</b></Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the Assessment name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="testDuration" className="mb-4">
            <Form.Label><b>ASSESSMENT DURATION (in minutes)</b></Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter the Assessment Duration"
              value={testDuration}
              onChange={(e) => setTestDuration(e.target.value)}
            />
          </Form.Group>
          <Button className='create-btn' variant="primary" onClick={handleTestDetailsSubmit}>Next</Button>
          <hr/>
        </Form>
      ) : (
        <div>
          <div className="mb-4">
            <Button
              variant="primary"
              onClick={() => { setQuestionType('objective'); setQuestionCount(0); }}
            >
              Objective
            </Button>
            <Button
              variant="primary"
              onClick={() => { setQuestionType('subjective'); setQuestionCount(0); }}
              className="ms-2"
            >
              Subjective
            </Button>
            <Button
              variant="primary"
              onClick={() => { setQuestionType('coding'); setQuestionCount(0); }}
              className="ms-2"
            >
              Coding
            </Button>
            <hr/>
          </div>

          {questionType && (
            <Form>
              <Form.Group controlId="questionCount" className="mb-4">
                <Form.Label>Number of {questionType.charAt(0).toUpperCase() + questionType.slice(1)} Questions</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={`Enter number of ${questionType} questions`}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                />
              </Form.Group>
              <Button variant="success" onClick={handleQuestionCountSubmit}>Click to Enter Questions</Button>
              <br /><br />
              {questions[questionType].map((q, index) => (
                <div key={`${questionType}-${index}`} className="mb-4">
                  <Form.Group controlId={`question-${questionType}-${index}`} className="mb-2">
                    <Form.Label>{`${questionType.charAt(0).toUpperCase() + questionType.slice(1)} Question ${index + 1}`}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={`Enter the ${questionType} question`}
                      value={q.question}
                      onChange={(e) => handleQuestionChange(questionType, index, 'question', e.target.value)}
                    />
                  </Form.Group>

                  {questionType === 'objective' && (
                    <>
                      <Form.Group className="mt-2">
                        <Form.Label>Options</Form.Label>
                        {q.options.map((opt, optIndex) => (
                          <Form.Control
                            key={optIndex}
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            className="mb-2"
                            value={opt}
                            onChange={(e) => {
                              const updatedOptions = [...q.options];
                              updatedOptions[optIndex] = e.target.value;
                              handleQuestionChange(questionType, index, 'options', updatedOptions);
                            }}
                          />
                        ))}
                      </Form.Group>
                      <Form.Group className="mt-2">
                        <Form.Label>Correct Answer</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter the correct answer"
                          value={q.answer}
                          onChange={(e) => handleQuestionChange(questionType, index, 'answer', e.target.value)}
                        />
                      </Form.Group>
                    </>
                  )}

                  {questionType !== 'objective' && (
                    <Form.Group className="mt-2">
                      <Form.Label>Answer</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter the answer"
                        value={q.answer}
                        onChange={(e) => handleQuestionChange(questionType, index, 'answer', e.target.value)}
                      />
                    </Form.Group>
                  )}
                </div>
              ))}
            </Form>
          )}

          <Button variant="primary" onClick={handleSubmitTest} className="mt-4">Create Assessment</Button>
        </div>
      )}
    </Container>
  );
};

export default CreateTest;