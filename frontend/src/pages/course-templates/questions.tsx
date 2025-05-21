import { useState, useEffect } from 'react';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, GripVertical, MoveVertical, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define question types from MongoDB schema
type QuestionType = 'MCQ' | 'MSQ' | 'TEXT' | 'NUMERICAL' | 'MATCH' | 'ORDERING';

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

interface Question {
  _id: string;
  questionType: QuestionType;
  questionText: string;
  hintText: string;
  difficulty: 1 | 2 | 3; // 1: Pillow Fight, 2: Sword Fight, 3: Boss Fight
  lots: QuestionLot[];
  solution: QuestionSolution;
  meta: QuestionMeta;
  timeLimit: number;
  points: number;
}

// Component to render a question item (text, image, audio)
function QuestionItem({ item }: { item: QuestionLotItem }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {item.textValue && (
        <div className="markdown-content">
          <ReactMarkdown>{item.textValue}</ReactMarkdown>
        </div>
      )}
      {item.imgURL && (
        <div className="my-2">
          <img 
            src={item.imgURL} 
            alt="Question visual" 
            className="max-w-full rounded-md"
          />
        </div>
      )}
      {item.audioURL && (
        <div className="flex items-center gap-2 my-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full w-8 h-8 p-0" 
            onClick={toggleAudio}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <span className="text-sm text-muted-foreground">Audio clip</span>
          <audio ref={audioRef} src={item.audioURL} onEnded={() => setIsPlaying(false)} />
        </div>
      )}
    </div>
  );
}

// Difficulty badge component
function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  const labels = {
    1: "Pillow Fight",
    2: "Sword Fight",
    3: "Boss Fight"
  };
  
  const variants = {
    1: "success",
    2: "warning",
    3: "destructive"
  } as const;
  
  return (
    <Badge variant={variants[level]}>{labels[level]}</Badge>
  );
}

// Sortable Item Component for Ordering Questions
function SortableItem({ id, item }: { id: string, item: QuestionLotItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`p-3 mb-2 bg-white border rounded-md flex items-center gap-2 cursor-grab ${isDragging ? 'shadow-lg border-primary' : ''}`}
    >
      <GripVertical className="text-muted-foreground flex-shrink-0" size={18} {...listeners} {...attributes} />
      <div className="flex-grow">
        <QuestionItem item={item} />
      </div>
    </div>
  );
}

// Timer digits component for HH:MM:SS display
function TimerDisplay({ seconds }: { seconds: number }) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  
  return (
    <div className="flex items-center space-x-1 font-mono">
      <div className="bg-black text-white px-2 py-1 rounded">
        {formatNumber(hours)}
      </div>
      <span className="text-black">:</span>
      <div className="bg-black text-white px-2 py-1 rounded">
        {formatNumber(minutes)}
      </div>
      <span className="text-black">:</span>
      <div className="bg-black text-white px-2 py-1 rounded">
        {formatNumber(secs)}
      </div>
    </div>
  );
}

// Updated MatchingQuestion component to avoid repeating matches
function MatchingQuestion({ 
  leftItems, 
  rightItems, 
  answers, 
  questionId, 
  onChange 
}: { 
  leftItems: QuestionLotItem[], 
  rightItems: QuestionLotItem[], 
  answers: Record<string, string>,
  questionId: string,
  onChange: (questionId: string, answers: Record<string, string>) => void
}) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  
  // Clear selection when clicking away
  const containerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedLeft(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLeftItemClick = (itemId: string) => {
    setSelectedLeft(prevSelected => prevSelected === itemId ? null : itemId);
  };

  const handleRightItemClick = (rightItemId: string) => {
    if (selectedLeft) {
      // Update the matching
      const newAnswers = { ...answers, [selectedLeft]: rightItemId };
      onChange(questionId, newAnswers);
      setSelectedLeft(null);
    }
  };

  const handleClearMatch = (leftItemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAnswers = { ...answers };
    delete newAnswers[leftItemId];
    onChange(questionId, newAnswers);
  };

  // Find which left item has this right item as a match
  const findMatchForRightItem = (rightItemId: string) => {
    return Object.entries(answers).find(([_, value]) => value === rightItemId)?.[0] || null;
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="text-center mb-4 text-gray-600">
        Click an item on the left, then click the matching item on the right
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1">
          <div className="text-center font-semibold mb-3 pb-2 border-b">Items</div>
          <div className="space-y-3">
            {leftItems.map((item, index) => {
              const isSelected = selectedLeft === item._itemId;
              const hasMatch = answers[item._itemId];
              const matchedItem = hasMatch ? 
                rightItems.find(r => r._itemId === answers[item._itemId]) : null;
                
              return (
                <div
                  key={item._itemId}
                  onClick={() => handleLeftItemClick(item._itemId)}
                  className={`p-3 border rounded-md cursor-pointer transition-all relative
                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    ${hasMatch ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-slate-50'}`
                  }
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700 mr-2">{String.fromCharCode(65 + index)}</span>
                    <div className="flex items-center gap-2">
                      {hasMatch && (
                        <>
                          <span className="text-xs text-green-600">
                            Matched with {rightItems.findIndex(r => r._itemId === answers[item._itemId]) + 1}
                          </span>
                          <button 
                            onClick={(e) => handleClearMatch(item._itemId, e)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Clear
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <QuestionItem item={item} />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Right Column */}
        <div className="flex-1">
          <div className="text-center font-semibold mb-3 pb-2 border-b">Matches</div>
          <div className="space-y-3">
            {rightItems.map((item, index) => {
              const matchedWithLeftId = findMatchForRightItem(item._itemId);
              const isUsed = !!matchedWithLeftId;
              const leftIndex = leftItems.findIndex(left => left._itemId === matchedWithLeftId);
              
              return (
                <div
                  key={item._itemId}
                  onClick={() => !isUsed && handleRightItemClick(item._itemId)}
                  className={`p-3 border rounded-md cursor-pointer transition-all relative
                    ${isUsed ? 'bg-green-50 border-green-200' : 
                      (selectedLeft ? 'hover:bg-blue-50 hover:border-blue-200' : 'bg-white hover:bg-slate-50')}`
                  }
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700 mr-2">{index + 1}</span>
                    {isUsed && (
                      <span className="text-xs text-green-600">
                        Matched with {String.fromCharCode(65 + leftIndex)}
                      </span>
                    )}
                  </div>
                  <QuestionItem item={item} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuizProps {
  question: Question;
  questionIndex?: number;
  totalQuestions?: number;
  isActive?: boolean; // New prop to control if this question is active
  onComplete?: (answers: Record<string, any>) => void;
  onTimeUp?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function Question({
  question,
  questionIndex = 0,
  totalQuestions = 1,
  isActive = true,
  onComplete,
  onTimeUp,
  onPrevious,
  onNext
}: QuizProps) {
  const [open, setOpen] = useState(isActive);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(question.timeLimit); // Use timeLimit from question
  const [showHint, setShowHint] = useState(false);

  // Update dialog state when isActive changes
  useEffect(() => {
    setOpen(isActive);
  }, [isActive]);
  
  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(question.timeLimit);
    setAnswers({});
    setShowHint(false);
  }, [question]);
  
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Timer
  useEffect(() => {
    if (!open || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [open, timeLeft, onTimeUp]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };
  
  const handleSubmit = () => {
    if (onComplete) {
      onComplete(answers);
    }
    setOpen(false);
  };
  
  const renderQuestion = () => {
    switch (question.questionType) {
      case 'MCQ':
        const mcqLotId = question.solution.lotId;
        const mcqLot = question.lots.find(lot => lot._lotId === mcqLotId);
        
        if (!mcqLot) return <div>Error: Lot not found</div>;
        
        return (
          <RadioGroup
            value={answers[question._id] || ''}
            onValueChange={(value) => handleAnswer(question._id, value)}
          >
            {mcqLot.items.map((item) => (
              <div key={item._itemId} className="flex items-start space-x-2 mb-3 p-2 rounded-md hover:bg-slate-50">
                <div className="flex items-center h-6">
                  <RadioGroupItem value={item._itemId} id={item._itemId} />
                </div>
                <div className="w-full">
                  <Label htmlFor={item._itemId} className="w-full cursor-pointer">
                    <QuestionItem item={item} />
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        );

      case 'MSQ':
        const msqLotId = question.solution.lotId;
        const msqLot = question.lots.find(lot => lot._lotId === msqLotId);
        
        if (!msqLot) return <div>Error: Lot not found</div>;
        
        return (
          <div className="space-y-2">
            {msqLot.items.map((item) => {
              const checked = (answers[question._id] || []).includes(item._itemId);
              return (
                <div key={item._itemId} className="flex items-start space-x-2 mb-2 p-2 rounded-md hover:bg-slate-50">
                  <div className="flex items-center h-6">
                    <Checkbox 
                      id={item._itemId}
                      checked={checked}
                      onCheckedChange={(checked) => {
                        const currentAnswers = answers[question._id] || [];
                        let newAnswers;
                        if (checked) {
                          newAnswers = [...currentAnswers, item._itemId];
                        } else {
                          newAnswers = currentAnswers.filter((id: string) => id !== item._itemId);
                        }
                        handleAnswer(question._id, newAnswers);
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor={item._itemId} className="w-full cursor-pointer">
                      <QuestionItem item={item} />
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'TEXT':
        return (
          <div className="space-y-4">
            <Input
              type="text"
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
              placeholder="Type your answer here"
              className="w-full"
            />
          </div>
        );

      case 'NUMERICAL':
        const numericalSolution = question.solution.numerical;
        return (
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <Input
                type="number"
                step={numericalSolution?.decimalPrecision ? `0.${"0".repeat(numericalSolution.decimalPrecision-1)}1` : "any"}
                value={answers[question._id] || ''}
                onChange={(e) => handleAnswer(question._id, parseFloat(e.target.value) || '')}
                placeholder="Enter your answer"
                className="w-full"
              />
            </div>
            {numericalSolution && (
              <p className="text-xs text-muted-foreground mt-1">
                Allowed range: {numericalSolution.lowerLimit} - {numericalSolution.upperLimit}
                {numericalSolution.decimalPrecision > 0 && 
                  ` (Use up to ${numericalSolution.decimalPrecision} decimal places)`}
              </p>
            )}
          </div>
        );

      case 'MATCH':
        const matchLotId = question.solution.lotId;
        const matchLot = question.lots.find(lot => lot._lotId === matchLotId);
        
        if (!matchLot || !question.solution.matches) return <div>Error: Lot not found</div>;
        
        // Create left and right items from matches
        const leftItems: QuestionLotItem[] = [];
        const rightItems: QuestionLotItem[] = [];
        
        question.solution.matches.forEach(match => {
          const items = match.lotItemIds.map(id => 
            matchLot.items.find(item => item._itemId === id)
          ).filter((item): item is QuestionLotItem => !!item);
          
          if (items.length === 2) {
            leftItems.push(items[0]);
            rightItems.push(items[1]);
          }
        });
        
        const matchAnswers = answers[question._id] || {};
        
        // Use the new matching component
        return (
          <MatchingQuestion
            leftItems={leftItems}
            rightItems={rightItems}
            answers={matchAnswers}
            questionId={question._id}
            onChange={handleAnswer}
          />
        );

      case 'ORDERING':
        const orderLotId = question.solution.lotId;
        const orderLot = question.lots.find(lot => lot._lotId === orderLotId);
        
        if (!orderLot || !question.solution.orders) return <div>Error: Lot not found</div>;
        
        // Create ordering items from solution orders
        const orderingItems = question.solution.orders.map(order => {
          const item = orderLot.items.find(item => item._itemId === order.lotItemId);
          return item ? {
            id: item._itemId,
            item: item,
            order: order.orderValue
          } : null;
        }).filter(Boolean);
        
        // Initialize ordering answer if not set
        if (!answers[question._id]) {
          // Randomize the order for the user to sort
          const shuffledItems = [...orderingItems]
            .sort(() => Math.random() - 0.5);
          handleAnswer(question._id, shuffledItems);
        }
        
        return (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              
              if (over && active.id !== over.id) {
                const oldIndex = answers[question._id]?.findIndex((item: any) => item.id === active.id);
                const newIndex = answers[question._id]?.findIndex((item: any) => item.id === over.id);
                
                if (oldIndex !== undefined && newIndex !== undefined) {
                  const newOrder = arrayMove(answers[question._id], oldIndex, newIndex);
                  handleAnswer(question._id, newOrder);
                }
              }
            }}
          >
            <div className="space-y-2">
              <div className="mb-2 text-sm text-muted-foreground">
                Drag items to arrange them in the correct order
              </div>
              
              <SortableContext 
                items={answers[question._id]?.map((item: any) => item.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {answers[question._id]?.map((orderItem: any) => (
                  <SortableItem 
                    key={orderItem.id}
                    id={orderItem.id} 
                    item={orderItem.item}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        );

      default:
        return <div>Unsupported question type: {question.questionType}</div>;
    }
  };
  
  // Toggle hint visibility
  const toggleHint = () => {
    setShowHint(prev => !prev);
  };

  return (
    <div className="max-w-4xl w-full mx-auto bg-white shadow-md rounded-lg p-6">
      {/* Header with timer and progress */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <TimerDisplay seconds={timeLeft} />
          <DifficultyBadge level={question.difficulty} />
        </div>
        
        <div className="text-sm text-gray-600">
          Question {questionIndex + 1} of {totalQuestions}
        </div>
        
        <h2 className="text-2xl font-bold">
          {question.points} points
        </h2>
      </div>
      
      {/* Show/Hide Hint Button - moved to more prominent position */}
      <div className="mb-3">
        <button
          onClick={toggleHint}
          className={`text-sm px-3 py-1 rounded-md transition-colors ${
            showHint 
              ? "bg-yellow-100 border border-yellow-300 text-yellow-800 hover:bg-yellow-200" 
              : "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
          }`}
        >
          {showHint ? "Hide Hint" : "Show Hint"}
        </button>
      </div>
      
      {/* Question content */}
      <Card className="mb-8 border shadow-sm">
        <CardContent className="p-6">
          {/* Hint Section - now above question text for better visibility */}
          {showHint && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
              <h4 className="font-medium text-yellow-800 mb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Hint
              </h4>
              <div className="text-yellow-700">
                <ReactMarkdown>{question.hintText}</ReactMarkdown>
              </div>
            </div>
          )}
          
          <div className="markdown-content mb-6">
            <ReactMarkdown>{question.questionText}</ReactMarkdown>
          </div>
          
          <div className="mt-6">
            {renderQuestion()}
          </div>
        </CardContent>
      </Card>
      
      {/* Bottom controls - simplified with submit on left */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Answer
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add some global styling for markdown content
const markdownStyles = `
  .markdown-content h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .markdown-content h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .markdown-content p {
    margin-bottom: 0.75rem;
  }
  
  .markdown-content ul, .markdown-content ol {
    margin-left: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .markdown-content pre {
    background-color: #f1f5f9;
    padding: 0.75rem;
    border-radius: 0.25rem;
    overflow-x: auto;
    margin-bottom: 0.75rem;
  }
  
  .markdown-content code {
    font-family: monospace;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
  }
  
  .markdown-content blockquote {
    border-left: 3px solid #e2e8f0;
    padding-left: 1rem;
    color: #64748b;
    margin-bottom: 0.75rem;
  }
`;

// Add style tag to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = markdownStyles;
  document.head.appendChild(style);
}
