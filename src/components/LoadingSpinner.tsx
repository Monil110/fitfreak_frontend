import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

const LoadingSpinner = ({ message = "Loading...", className }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px]", className)}>
      <div className="w-10 h-10 border-3 border-border border-t-accent rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
