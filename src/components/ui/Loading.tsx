import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Spinner = ({ className, size = "md" }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-indigo-600",
        sizeClasses[size],
        className,
      )}
    />
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-neutral-200", className)} />
  );
};

export const FullPageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-neutral-50 p-6">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full p-10 bg-white rounded-3xl shadow-xl border border-neutral-100 animate-modal-content">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-neutral-100 border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-indigo-600 font-black text-2xl italic tracking-tighter">
              R
            </span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Loading Ralli
          </h2>
          <p className="text-neutral-500 text-sm animate-pulse">
            Setting things up for you...
          </p>
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="p-4 border rounded-xl border-neutral-100 bg-white space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
};
