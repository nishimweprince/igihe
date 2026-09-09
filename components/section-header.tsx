import Link from "next/link";
import { cn } from "@/lib/utils";

/** Section openers breathe instead of shouting — title and air, no rule. */
export function SectionHeader({
  title,
  href,
  className,
}: {
  title: string;
  href?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-baseline justify-between gap-4",
        className
      )}
    >
      <h2 className="text-[0.8125rem] font-bold uppercase leading-none tracking-[0.1em] text-ink">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="kicker shrink-0 text-brand-ink underline-offset-4 hover:underline"
        >
          Reba byose
        </Link>
      )}
    </div>
  );
}
