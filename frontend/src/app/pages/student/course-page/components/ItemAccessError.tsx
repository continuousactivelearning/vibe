import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AccessRestrictedCardProps {
  previousValidItem: { moduleId: string; sectionId: string; itemId: string; } | null;
  onDismiss: () => void;
}

export function AccessRestrictedCard({
  previousValidItem,
  onDismiss,
}: AccessRestrictedCardProps) {
  return (
    <Card className="border border-red-400/40 bg-red-600/95 text-red-50 shadow-lg backdrop-blur-md animate-in slide-in-from-right-3 duration-300">
      <CardContent className="flex items-center gap-3 px-4 py-0">
        <div className="flex h-22 w-22 items-center justify-center rounded-l border-red-50/30 bg-red-50/10 text-4xl p-4">
          <AlertCircle className="h-16 w-16" />
        </div>
        <div className="flex-1 space-y-1">
          <Badge variant="outline" className="border-red-50/30 bg-red-50/10 text-red-50 text-lg font-bold">
            Access Restricted
          </Badge>
          <p className="text-md font-medium leading-relaxed">
            {previousValidItem
              ? "Returning to previous valid content."
              : "Complete current item first to access this content."
            }
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-red-50 hover:bg-red-50/10"
        >
          ×
        </Button>
      </CardContent>
    </Card>
  );
}