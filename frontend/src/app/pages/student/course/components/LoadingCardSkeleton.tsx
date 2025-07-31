import { Card, CardContent } from "@/components/ui/card";

export const LoadingCardSkeleton = () => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded animate-pulse w-2/3 mb-4" />
        <div className="h-2 bg-muted rounded animate-pulse mb-4" />
        <div className="h-10 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}