import { Service } from 'typedi';
import QuizModel from '../../Quiz'; // ✅ Correct path

@Service()
export class QuestionService {
  /**
   * Updates a specific question in a quiz.
   * @param quizId - The ID of the quiz
   * @param questionId - The ID of the question to update
   * @param updatedQuestion - The updated question object
   * @returns Promise<boolean> - true if update was successful, false otherwise
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

    // 2. Find index of the question to be updated
    const questionIndex = quiz.questions.findIndex(
      (q: any) => q._id.toString() === questionId
    );

    if (questionIndex === -1) {
      return false; // Question not found
    }

    // 3. Perform shallow merge update on the question
    const existingQuestion = quiz.questions[questionIndex] as any;
    quiz.questions[questionIndex] = {
      ...existingQuestion.toObject?.(), // Safely copy current question
      ...updatedQuestion,              // Apply new updates
    };

    // 4. Save updated quiz document
    await quiz.save();

    return true;
  }
}
