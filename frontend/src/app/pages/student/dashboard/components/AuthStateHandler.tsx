import { EmptyState } from "@/components/ui/EmptyState";
import { useNavigate } from "@tanstack/react-router";

interface AuthStateHandlerProps {
  isAuthenticated: boolean;
  authTitle?: string;
  authDescription?: string;
  loadingTitle?: string;
  loadingDescription?: string;
  loginRoute?: string;
  className?: string;
  containerClassName?: string;
}

export const AuthStateHandler = ({
  isAuthenticated,
  authTitle = "Authentication Required",
  authDescription = "Please log in to view your dashboard",
  loadingTitle = "Loading...",
  loadingDescription = "Preparing your dashboard...",
  loginRoute = '/auth',
  className = "px-4 sm:px-6 lg:px-8 w-full max-w-md",
  containerClassName = "min-h-screen bg-gray-50/50 flex items-center justify-center"
}: AuthStateHandlerProps) => {
  const navigate = useNavigate();

  return (
    <div className={containerClassName}>
      <div className={className}>
        <EmptyState
          title={!isAuthenticated ? authTitle : loadingTitle}
          description={!isAuthenticated ? authDescription : loadingDescription}
          actionText={!isAuthenticated ? "Go to Login" : undefined}
          onAction={!isAuthenticated ? () => navigate({ to: loginRoute }) : undefined}
        />
      </div>
    </div>
  );
};