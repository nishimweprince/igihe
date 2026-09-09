import { cn } from "@/lib/utils";

/** A grey block standing in for content that hasn't arrived yet. */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("skeleton block", className)} aria-hidden />;
}
