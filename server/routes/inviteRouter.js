// src/routes/inviteRouter.js
import { Router } from 'express';
const router = Router();
import Test from '../models/Test.js';
import InvitedStudent from '../models/InvitedStudent.js'; // Import the InvitedStudent model
import nodemailer from 'nodemailer';

// POST /api/invite - Invite student via email
router.post('/', async (req, res) => {
    const { testId, email, name } = req.body;

    try {
        // Fetch the test to include details in the invite email
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Generate an invite link for the student
        const inviteLink = `http://localhost:5173/test/${testId}/attend`;

        // Setup nodemailer to send the email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'dhineshkumar24murugan007@gmail.com',  // Replace with your email
              pass: 'szlv xili ndrw qasg',        // Use app password here
            }
        });

        const mailOptions = {
            from: 'dhineshkumar24murugan007@gmail.com',  // Replace with your email
            to: email,
            subject: `Invitation to attend the test: ${test.name}`,
            text: `You have been invited to take the test: "${test.name}". Duration: ${test.duration} minutes. Click the link below to attend: \n${inviteLink}`
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Save the invited student email to the database
        const invitedStudent = new InvitedStudent({  testId, email, name });
        await invitedStudent.save();

        res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Error sending invite:', error);
        res.status(500).json({ message: 'Failed to send invite' });
    }
});


// POST /api/invite/verify - Verify if student is invited
router.post('/verify', async (req, res) => {
    const { name, email, testId } = req.body;
  
    try {
        // Check if the student with the given details exists in the database
        const invitedStudent = await InvitedStudent.findOne({ name, email, testId });
        
        if (invitedStudent) {
            return res.status(200).json({ invited: true });
        } else {
            return res.status(404).json({ invited: false, message: 'You are not invited to this test.' });
        }
    } catch (error) {
        console.error('Error verifying invited student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



export default router;
