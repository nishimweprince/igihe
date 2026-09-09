import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full border border-rule bg-white px-3 text-[15px] text-ink placeholder:text-meta focus-visible:border-ink focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
