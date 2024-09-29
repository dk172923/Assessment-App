import express from 'express';
import { connect } from 'mongoose';
import axios from 'axios';
import testRoutes from './routes/testRoutes.js';
import inviteRouter from './routes/inviteRouter.js';
import Result from './models/Result.js';
import InvitedStudent from './models/InvitedStudent.js';
import Test from './models/Test.js';
import pkg from 'body-parser';
const { json } = pkg;
import nodemailer from 'nodemailer';
import multer from 'multer';

import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // or the domain your frontend is hosted on
    methods: ['GET', 'POST']
  }));
  
app.use(json());

// MongoDB connection
connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((error) => console.log('MongoDB connection error:', error));

// Routes
app.use('/api/tests', testRoutes);
app.use('/api/invite', inviteRouter);
//app.use('/api/results', resultsRoutes);

// Endpoint to evaluate subjective answers
app.post('/api/evaluate-answer', async (req, res) => {
  const { question, answer } = req.body;

  const apiKey = '0d69a07d0928aac13d4fb32f80a97a8a4f9f8908db1cec970b1e3a6c6963405a'; // Replace with your actual API key
  const prompt = `Evaluate the following answer:\nQuestion: ${question}\nAnswer: ${answer}\nGive a score out of 10. Only give me the score as output no other text must be printed or given as response, not even fullstop.`;

  try {
      const response = await axios.post('https://api.together.ai/v1/chat/completions', {
          model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 100,
          temperature: 0.5,
      }, {
          headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
          },
      });

      const score = parseFloat(response.data.choices[0].message.content);
      return res.json({ score });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error evaluating answer' });
  }
});

app.post('/api/evaluate-code', async (req, res) => {
  const { question, answer } = req.body;

  const apiKey = '0d69a07d0928aac13d4fb32f80a97a8a4f9f8908db1cec970b1e3a6c6963405a'; // Replace with your actual API key
  const prompt = `Evaluate the following code based on the question, check for correctness of concept understood by user while submitting the code and also give slight consideration for syntax, user will use python, javascript, java, c, c++:\nQuestion: ${question}\nAnswer: ${answer}\nGive a score out of 10. Only give me the score as output no other text must be printed or given as response, not even fullstop.`;

  try {
      const response = await axios.post('https://api.together.ai/v1/chat/completions', {
          model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 100,
          temperature: 0.5,
      }, {
          headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
          },
      });

      const score = parseFloat(response.data.choices[0].message.content);
      return res.json({ score });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error evaluating answer' });
  }
});

app.post('/api/results', async (req, res) => {
  try {
    const { testDetails, studentDetails, scores } = req.body;

    console.log(studentDetails); // Debugging to verify the content of studentDetails

    const newResult = new Result({
      testDetails,
      studentDetails, // studentDetails should now contain all required fields
      scores,
    });

    await newResult.save();

    res.status(200).json({ message: 'Test results saved successfully' });
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Assuming you have a route set up for this
app.get('/api/invited-students', async (req, res) => {
  try {
    // Replace with your logic to fetch students and their test names
    const students = await InvitedStudent.find(); // Or however you get the students
    res.json(students); // Adjust to send the correct structure
  } catch (error) {
    console.error('Error fetching invited students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API endpoint to fetch all test results
app.get('/api/results', async (req, res) => {
  try {
    const results = await Result.find();
    return res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return res.status(500).json({ message: 'Error fetching results' });
  }
});

app.post('/api/results/check', async (req, res) => {
  const { email, testId } = req.body;
  
  try {
    const result = await Result.findOne({
      'studentDetails.email': email,
      'testDetails._id': testId,
    });

    if (result) {
      // If result found, student has already attended the test
      res.json({ hasAttended: true });
    } else {
      // If no result found, student hasn't attended
      res.json({ hasAttended: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking test results.' });
  }
});

// Set up multer for file uploads
const upload = multer();

app.post('/send-pdf', upload.single('file'), async (req, res) => {
  const { email, testId } = req.body; // Extract email and testId from the request body
  const pdfBuffer = req.file ? req.file.buffer : null; // Get the PDF buffer from the request
    if (!pdfBuffer) {
        return res.status(400).json({ message: 'No PDF file uploaded.' });
    }
  try {
      // Fetch the test details to include in the email
      const test = await Test.findById(testId);
      //console.log(test);
      if (!test) {
          return res.status(404).json({ message: 'Test not found' });
      }

      // Setup nodemailer to send the email
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'dhineshkumar24murugan007@gmail.com',  // Replace with your email
              pass: 'szlv xili ndrw qasg',       // Use app password here
          }
      });

      const mailOptions = {
          from: 'dhineshkumar24murugan007@gmail.com',     // Replace with your email
          to: email, // Use the email passed from the frontend
          subject: `Your submission report for: ${test.name}`,
          text: `Please find attached your submission report for the test: "${test.name}".`,
          attachments: [{
              filename: 'submission_report.pdf',
              content: pdfBuffer,
              contentType: 'application/pdf'
          }]
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log("Mail sent successfully");
      res.status(200).json({ message: 'Email sent successfully with the PDF attachment.' });
  } catch (error) {
      console.error('Error sending PDF:', error);
      res.status(500).json({ message: 'Failed to send email.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("hi");
});
