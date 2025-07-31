import { EmptyState } from "@/components/ui/EmptyState";

interface AuthErrorStatesProps {
  isAuthenticated: boolean;
  error: unknown;
  onLogin: () => void;
  onRetry: () => void;
  className?: string;
}

export function AuthErrorStates({
  isAuthenticated,
  error,
  onLogin,
  onRetry,
  className = "flex flex-1 flex-col gap-4 p-4 pt-0"
}: AuthErrorStatesProps) {
  if (!isAuthenticated) {
    return (
      <div className={className}>
        <EmptyState
          title="Authentication Required"
          description="Please log in to view your courses"
          actionText="Go to Login"
          onAction={onLogin}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <EmptyState
          title="Error loading courses"
          description={typeof error === 'string' ? error : "Failed to load your courses"}
          actionText="Try Again"
          onAction={onRetry}
          variant="error"
        />
      </div>
    );
  }

  return null;
}