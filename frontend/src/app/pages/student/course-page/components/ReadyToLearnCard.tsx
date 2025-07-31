import { BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadyToLearnCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function ReadyToLearnCard({
  title = "Ready to Learn?",
  description = "Select an item from the course navigation to begin your learning journey and unlock new knowledge.",
  buttonText = "Browse Content",
  onButtonClick,
}: ReadyToLearnCardProps) {
  return (
    <div className="h-full flex items-center justify-center relative z-10">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full blur-xl opacity-60" />
          <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <BookOpen className="h-12 w-12 text-primary mx-auto" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
        <Button
          variant="outline"
          className="transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/10 hover:to-accent/5 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10"
          onClick={onButtonClick}
        >
          <Target className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
}