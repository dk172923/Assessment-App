import { Schema, model } from 'mongoose';

const resultSchema = new Schema({
  testDetails: {
    name: String,
    duration: Number,
    createdAt: Date,
    _id: String,
  },
  studentDetails: {
    name: String,
    email: String,
    college: String,
    yearOfPassing: String,
    department: String,
  },
  scores: {
    objective: Number,
    subjective: Number,
    coding: Number,
    total: Number,
  },
});

const Result = model('Result', resultSchema);

export default Result;
