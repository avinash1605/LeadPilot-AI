import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
