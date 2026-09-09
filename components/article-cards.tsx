import Link from "next/link";
import { formatDate, isoDate, readMinutes, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/types";

function Thumb({
  article,
  className,
  sizes,
}: {
  article: Article;
  className: string;
  sizes?: string;
}) {
  if (!article.image) return null;
  return (
    // Hotlinked Igihe thumbnails of varying reliability — plain img on purpose.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={article.image}
      alt=""
      loading="lazy"
      sizes={sizes}
      className={cn(
        "bg-wash object-cover transition-opacity duration-150 group-hover:opacity-90",
        className
      )}
    />
  );
}

export function StoryKicker({
  article,
  className,
}: {
  article: Article;
  className?: string;
}) {
  return (
    <p className={cn("kicker text-brand-ink", className)}>{article.category}</p>
  );
}

export function Byline({
  article,
  showRead = false,
}: {
  article: Article;
  showRead?: boolean;
}) {
  return (
    <p className="byline">
      Na {article.author || "IGIHE"}
      <span className="px-1.5" aria-hidden>
        ·
      </span>
      <time dateTime={isoDate(article.date)}>{timeAgo(article.date)}</time>
      {showRead && (
        <>
          <span className="px-1.5" aria-hidden>
            ·
          </span>
          Gusoma: iminota {readMinutes(article.body)}
        </>
      )}
    </p>
  );
}

/** The page's opening argument: one story at full width of the lead column. */
export function LeadStory({ article }: { article: Article }) {
  return (
    <article className="group pb-6">
      <Link href={`/article/${article.slug}`} className="block">
        <Thumb
          article={article}
          sizes="(min-width: 1024px) 760px, 100vw"
          className="mb-4 aspect-[16/9] w-full"
        />
        <StoryKicker article={article} className="mb-2" />
        <h2 className="hed hed-lead story-link text-ink">{article.title}</h2>
      </Link>
      <p className="deck mt-3 max-w-[52ch]">{article.excerpt}</p>
      <div className="mt-3">
        <Byline article={article} showRead />
      </div>
    </article>
  );
}

/** Standard grid unit: picture on top, headline under it. */
export function StoryCard({
  article,
  showDeck = true,
  showImage = true,
  size = "md",
}: {
  article: Article;
  showDeck?: boolean;
  showImage?: boolean;
  size?: "md" | "sm";
}) {
  return (
    <article className="group flex flex-col">
      <Link href={`/article/${article.slug}`} className="block">
        {showImage && (
          <Thumb
            article={article}
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
            className="mb-3 aspect-[3/2] w-full"
          />
        )}
        <StoryKicker article={article} className="mb-1.5" />
        <h3
          className={cn(
            "hed story-link text-ink",
            size === "md" ? "hed-2" : "hed-3"
          )}
        >
          {article.title}
        </h3>
      </Link>
      {showDeck && (
        <p className="deck mt-2 line-clamp-3 text-[0.875rem]">{article.excerpt}</p>
      )}
      <div className="mt-2">
        <Byline article={article} />
      </div>
    </article>
  );
}

/** Rail unit: headline-forward, thumbnail shrunk to a stamp. */
export function RailStory({ article }: { article: Article }) {
  return (
    <article className="group flex gap-3 py-4">
      <div className="min-w-0 flex-1">
        <Link href={`/article/${article.slug}`} className="block">
          <StoryKicker article={article} className="mb-1.5" />
          <h3 className="hed hed-3 story-link text-ink">{article.title}</h3>
        </Link>
        <div className="mt-1.5">
          <Byline article={article} />
        </div>
      </div>
      <Link
        href={`/article/${article.slug}`}
        tabIndex={-1}
        aria-hidden
        className="shrink-0"
      >
        <Thumb article={article} sizes="88px" className="h-[72px] w-[88px]" />
      </Link>
    </article>
  );
}

/** Ranked list — the number carries real information: reading order. */
export function RankedStory({
  article,
  rank,
}: {
  article: Article;
  rank: number;
}) {
  return (
    <article className="group flex gap-3 py-3">
      <span
        aria-hidden
        className="w-6 shrink-0 text-2xl font-black leading-none tracking-[-0.05em] text-rule"
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <Link href={`/article/${article.slug}`} className="block">
          <h3 className="hed hed-3 story-link text-ink">{article.title}</h3>
        </Link>
        <p className="byline mt-1.5">{article.category}</p>
      </div>
    </article>
  );
}

/** Text-only brief used in dense stacks under a section rule. */
export function BriefStory({ article }: { article: Article }) {
  return (
    <article className="group py-3">
      <Link href={`/article/${article.slug}`} className="block">
        <h3 className="hed hed-3 story-link text-ink">{article.title}</h3>
      </Link>
      <p className="byline mt-1.5">
        {article.category}
        <span className="px-1.5" aria-hidden>
          ·
        </span>
        <time dateTime={isoDate(article.date)}>{formatDate(article.date)}</time>
      </p>
    </article>
  );
}
