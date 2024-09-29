import { Router } from 'express';
const router = Router();
import Result from '../models/Result.js'; // Import the Result model

// POST route to store the test results
router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const result = new Result(req.body); // Create a new Result document with the data received
    await result.save(); // Save the result in the database
    res.status(201).json({ message: 'Results stored successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to store results' });
  }
});


export default router;
