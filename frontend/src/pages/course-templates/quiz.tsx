import React, { useState, useEffect } from 'react';
import Question from './questions';

// Types based on the MongoDB schema
interface QuizType {
  _id: string;
  questionVisibility: number; // Controls how questions are displayed
  questions: string[]; // Array of question IDs
}

// MongoDB Schema interfaces
interface QuestionLotItem {
  _itemId: string;
  type: string;
  textValue: string;
  imgURL?: string;
  audioURL?: string;
}

interface QuestionLot {
  _lotId: string;
  items: QuestionLotItem[];
}

interface NumericalSolution {
  lowerLimit: number;
  upperLimit: number;
  decimalPrecision: number;
  trueValue: number;
}

interface OrderSolution {
  orderValue: number;
  lotItemId: string;
}

interface MatchSolution {
  lotItemIds: string[];
}

interface QuestionSolution {
  lotId?: string;
  lotItemId?: string;
  lotItemIds?: string[];
  orders?: OrderSolution[];
  matches?: MatchSolution[];
  numerical?: NumericalSolution;
  descriptiveSolution?: string;
}

interface QuestionMeta {
  creator: string;
  studentGenerated: boolean;
  aiGenerated: boolean;
}

interface QuestionType {
  _id: string;
  questionType: 'MCQ' | 'MSQ' | 'TEXT' | 'NUMERICAL' | 'MATCH' | 'ORDERING';
  questionText: string;
  hintText: string;
  difficulty: 1 | 2 | 3;
  lots: QuestionLot[];
  solution: QuestionSolution;
  meta: QuestionMeta;
  timeLimit: number;
  points: number;
}

// Props type for Quiz component
interface QuizProps {
  quizId: string;
  questionVisibility?: number; // Now directly accepting questionVisibility
  questions?: QuestionType[]; // Now directly accepting questions
  onBack?: () => void;
  onComplete?: (score: number, answers: Record<string, any>[]) => void;
}

const Quiz: React.FC<QuizProps> = ({ 
  quizId, 
  questionVisibility: propsQuestionVisibility, 
  questions: propsQuestions,
  onBack = () => {}, 
  onComplete 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState<QuizType | null>(null);
  const [renderKey, setRenderKey] = useState(0); // Add a key to force re-render questions

  // Load quiz data
  useEffect(() => {
    // If questions are passed directly, use them
    if (propsQuestions && propsQuestions.length > 0) {
      setQuestions(propsQuestions);
      setAnswers(new Array(propsQuestions.length).fill({}));
      setQuizData({
        _id: quizId,
        questionVisibility: propsQuestionVisibility || 1,
        questions: propsQuestions.map(q => q._id)
      });
      setLoading(false);
      return;
    }

    // Otherwise, try to fetch from API
    const fetchQuizFromAPI = async () => {
      setLoading(true);
      try {
        const quizResponse = await fetch(`/api/quizzes/${quizId}`);
        
        if (!quizResponse.ok) {
          throw new Error(`Failed to fetch quiz: ${quizResponse.status}`);
        }
        
        const quiz = await quizResponse.json();
        
        // Fetch all questions
        const questionPromises = quiz.questions.map(async (qId: string) => {
          const response = await fetch(`/api/questions/${qId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch question ${qId}`);
          }
          return response.json();
        });
        
        const questionList = await Promise.all(questionPromises);
        
        setQuizData(quiz);
        setQuestions(questionList);
        setAnswers(new Array(questionList.length).fill({}));
        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(`Failed to load quiz: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };

    fetchQuizFromAPI();
  }, [quizId, propsQuestions, propsQuestionVisibility]);

  // Handle answer submission from Question component
  const handleQuestionComplete = (answer: Record<string, any>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    // Get the current visibility setting
    const visibility = quizData?.questionVisibility || propsQuestionVisibility || 1;

    // If question visibility is 1, automatically move to next question
    if (visibility === 1 && currentQuestionIndex < questions.length - 1) {
      // Move to next question after submission
      handleNext();
    }
    // If this is the last question or all questions are answered, complete the quiz
    else if (
      currentQuestionIndex === questions.length - 1 ||
      (newAnswers.every(a => Object.keys(a).length > 0) && visibility !== 1)
    ) {
      handleQuizComplete(newAnswers);
    }
  };

  // Handle time up for a question
  const handleTimeUp = () => {
    const visibility = quizData?.questionVisibility || propsQuestionVisibility || 1;
    
    // If showing one question at a time, move to next
    if (visibility === 1 && currentQuestionIndex < questions.length - 1) {
      handleNext();
    }
  };

  // Handle manual navigation
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setRenderKey(prev => prev + 1);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setRenderKey(prev => prev + 1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Complete the quiz
  const handleQuizComplete = (finalAnswers = answers) => {
    // Calculate score based on correct answers
    let correctCount = 0;
    
    questions.forEach((q, index) => {
      const answer = finalAnswers[index];
      if (isAnswerCorrect(q, answer)) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setQuizComplete(true);
    
    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete(finalScore, finalAnswers);
    }
  };

  // Check if an answer is correct
  const isAnswerCorrect = (question: QuestionType, answer: Record<string, any>): boolean => {
    if (!answer || Object.keys(answer).length === 0) return false;
    
    switch (question.questionType) {
      case 'MCQ':
        return answer[question._id] === question.solution.lotItemId;
        
      case 'MSQ': {
        const userSelections = answer[question._id] || [];
        const correctSelections = question.solution.lotItemIds || [];
        return (
          userSelections.length === correctSelections.length &&
          userSelections.every(id => correctSelections.includes(id))
        );
      }
        
      case 'TEXT':
        return answer[question._id]?.toLowerCase().trim() === 
               question.solution.descriptiveSolution?.toLowerCase().trim();
        
      case 'NUMERICAL': {
        const userValue = parseFloat(answer[question._id]);
        const solution = question.solution.numerical;
        if (!solution) return false;
        return userValue >= solution.lowerLimit && userValue <= solution.upperLimit;
      }
        
      case 'MATCH': {
        const userMatches = answer[question._id] || {};
        const matches = question.solution.matches || [];
        
        for (const match of matches) {
          const [itemA, itemB] = match.lotItemIds;
          if (userMatches[itemA] !== itemB) return false;
        }
        return true;
      }
        
      case 'ORDERING': {
        const userOrder = answer[question._id] || [];
        const correctOrder = question.solution.orders || [];
        
        return userOrder.every((item, idx) => 
          item.id === correctOrder.find(o => o.orderValue === idx + 1)?.lotItemId
        );
      }
        
      default:
        return false;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-8 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Quiz</h3>
        <p className="text-red-700">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={onBack}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Get the current visibility setting
  const visibility = quizData?.questionVisibility || propsQuestionVisibility || 1;

  // Render current question with updated props - removed navigation buttons
  return (
    <div className="max-w-4xl mx-auto">
      {/* Current Question - using key to force rerender */}
      {!loading && questions[currentQuestionIndex] && (
        <div key={`question-${currentQuestionIndex}-${renderKey}`}>
          <Question
            question={questions[currentQuestionIndex]}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            isActive={true}
            onComplete={handleQuestionComplete}
            onTimeUp={handleTimeUp}
            // Navigation is now handled internally
          />
        </div>
      )}
      
      {/* Submit button - only shown if questionVisibility is not 1 */}
      {visibility !== 1 && (
        <div className="mt-6 flex justify-center">
          <button 
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            onClick={() => handleQuizComplete()}
            disabled={!answers.every(a => Object.keys(a).length > 0)}
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;