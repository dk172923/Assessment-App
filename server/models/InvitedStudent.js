// src/models/InvitedStudent.js
import mongoose from 'mongoose';

const invitedStudentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    // Remove the unique constraint
    // unique: true, // Commented out to allow multiple entries for the same email
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: { // Explicitly define the name field
    type: String,
    required: true, // Mark name as required if necessary
  },
});

// Ensure there is no unique index on email
invitedStudentSchema.index({ email: 1, testId: 1 }, { unique: false }); // Optional: you can still create a composite index if needed

const InvitedStudent = mongoose.model('InvitedStudent', invitedStudentSchema);

export default InvitedStudent;
