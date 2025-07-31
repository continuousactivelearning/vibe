import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react';
import React from 'react'

interface QuizStatusCardProps {
  status: "passed" | "failed" | "hidden";
  onDismiss: () => void;
}

export const QuizStatusCard = ({ status, onDismiss }: QuizStatusCardProps)  => {
  if (status === "hidden") return null;

  const isPassed = status === "passed";

  return (
    <Card className={`border shadow-lg backdrop-blur-md animate-in slide-in-from-right-3 duration-300 ${
      isPassed
        ? "border-green-400/40 bg-green-500/95 text-green-50"
        : "border-red-400/40 bg-red-500/95 text-red-50"
    }`}>
      <CardContent className="flex items-center gap-3 px-4 py-0">
        <div
          className={`flex h-22 w-22 items-center justify-center rounded-l ${
            isPassed
              ? "border-green-50/30 bg-green-50/10"
              : "border-red-50/30 bg-red-50/10"
          } text-4xl p-4`}
        >
          {isPassed ? (
            <CheckCircle className="h-16 w-16" />
          ) : (
            <XCircleIcon />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <Badge
            variant="outline"
            className={`text-lg font-bold ${
              isPassed
                ? "border-green-50/30 bg-green-50/10 text-green-50"
                : "border-red-50/30 bg-red-50/10 text-red-50"
            }`}
          >
            {isPassed ? "Quiz Passed" : "Quiz Failed"}
          </Badge>
          <p className="text-md font-medium leading-relaxed">
            {isPassed
              ? "Congratulations! You passed the quiz."
              : "Redirecting to the previous video..."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className={`h-6 w-6 p-0 ${
            isPassed
              ? "text-green-50 hover:bg-green-50/10"
              : "text-red-50 hover:bg-red-50/10"
          }`}
        >
          ×
        </Button>
      </CardContent>
    </Card>
  );
}

const XCircleIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="15"
        y1="9"
        x2="9"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="9"
        x2="15"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}