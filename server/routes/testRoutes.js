import { Router } from 'express';
const router = Router();
import Test from '../models/Test.js';
import nodemailer from 'nodemailer';

// POST /api/tests - Create a new test
router.post('/', async (req, res) => {
  try {
    const { name, duration, questions } = req.body;

    // Create a new test document
    const newTest = new Test({
      name,
      duration,
      questions,
    });

    // Save the test to the database
    await newTest.save();

    res.status(201).json({ message: 'Test created successfully', test: newTest });
  } catch (error) {
    console.error('Error saving test:', error);
    res.status(500).json({ message: 'Failed to create test' });
  }
});

// GET /api/tests - Retrieve all tests
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find(); // Fetch all tests from the database
    res.status(200).json(tests); // Send the tests as a response
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ message: 'Failed to fetch tests' });
  }
});

router.get('/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId); // Fetch the test by ID

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json(test); // Send the test details as a response
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ message: 'Failed to fetch test' });
  }
});

export default router;
