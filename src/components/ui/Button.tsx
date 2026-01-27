import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700":
              variant === "primary",
            "bg-neutral-100 text-neutral-900 hover:bg-neutral-200":
              variant === "secondary",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "hover:bg-neutral-100 text-neutral-900": variant === "ghost",
            "h-10 py-2 px-4": size === "default",
            "h-9 px-3 rounded-md text-sm": size === "sm",
            "h-11 px-8 rounded-md": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
