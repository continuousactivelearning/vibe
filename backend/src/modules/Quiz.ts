import mongoose, { Schema, Document, Types } from 'mongoose';
import { IQuestion } from 'shared/interfaces/quiz';

// Define the interface for the Quiz document
export interface IQuiz extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  questions: IQuestion[];
  courseId?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema for the embedded Question
const QuestionSchema: Schema = new Schema(
  {
    text: { type: String, required: true },
    type: { type: String, required: true },
    isParameterized: { type: Boolean, required: true },
    parameters: { type: Array, default: [] },
    hint: { type: String },
    timeLimitSeconds: { type: Number, required: true },
    points: { type: Number, required: true },
  },
  { _id: true } // enable _id for questions (recommended for updates)
);

// Define the schema for the Quiz
const QuizSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    courseId: { type: String },
    createdBy: { type: String },
    questions: { type: [QuestionSchema], default: [] },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Create and export the Quiz model
const QuizModel = mongoose.model<IQuiz>('Quiz', QuizSchema);
export default QuizModel;
