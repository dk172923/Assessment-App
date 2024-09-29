import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const questionSchema = new Schema({
  type: {
    type: String,
    enum: ['objective', 'subjective', 'coding'],
    required: true,
  },
  question: { type: String, required: true },
  options: [String], // Only for objective questions
  answer: { type: String, required: true },
});

const testSchema = new Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Test = model('Test', testSchema);

export default Test;
