import { Service } from 'typedi';
import QuizModel from '../models/Quiz'; // ✅ Adjust this path if your Quiz model is in a different folder

@Service()
export class QuestionService {
  /**
   * Update a specific question in a quiz.
   * @param quizId The ID of the quiz
   * @param questionId The ID of the question to update
   * @param updatedQuestion The new question data
   * @returns true if updated successfully, false otherwise
   */
  async updateQuestionInQuiz(
    quizId: string,
    questionId: string,
    updatedQuestion: any
  ): Promise<boolean> {
    // 1. Fetch the quiz by ID
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return false; // Quiz not found
    }

    // 2. Find the question in the quiz
    const questionIndex = quiz.questions.findIndex(
      (q: any) => q._id.toString() === questionId
    );

    if (questionIndex === -1) {
      return false; // Question not found
    }

    // 3. Update the question (shallow merge)
    quiz.questions[questionIndex] = {
      ...quiz.questions[questionIndex]._doc,
      ...updatedQuestion,
    };

    // 4. Save the quiz
    await quiz.save();

    return true;
  }
}
