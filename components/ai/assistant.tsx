"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RotateCcw, Send, X } from "lucide-react";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { useAssistant, type Message, type Source } from "./assistant-provider";
import { cn } from "@/lib/utils";

const STARTERS = [
  "Ni izihe nkuru z'ingenzi z'uyu munsi?",
  "Iran na Amerika bageze he?",
];

/** Renders "…peteroli [1]" with the citation as a footnote link. */
function withCitations(content: string, sources?: Source[]) {
  return content.split(/(\[\d+\])/g).map((part, i) => {
    const match = /^\[(\d+)\]$/.exec(part);
    const source = match
      ? sources?.find((s) => s.n === Number(match[1]))
      : undefined;
    if (!source) return <span key={i}>{part}</span>;
    return (
      <Link
        key={i}
        href={source.href}
        title={source.title}
        className="text-brand-ink underline underline-offset-2 hover:text-ink"
      >
        [{source.n}]
      </Link>
    );
  });
}

function citedSources(message: Message): Source[] {
  if (!message.sources) return [];
  const cited = new Set(
    Array.from(message.content.matchAll(/\[(\d+)\]/g)).map((m) => Number(m[1]))
  );
  return message.sources.filter((s) => cited.has(s.n));
}

function AssistantMessage({ message }: { message: Message }) {
  const sources = citedSources(message);
  return (
    <div>
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
        {withCitations(message.content, message.sources)}
      </p>
      {sources.length > 0 && (
        <div className="mt-3 border-t border-rule pt-2">
          <p className="kicker mb-2 text-meta">Inkomoko</p>
          <ol className="space-y-1.5">
            {sources.map((s) => (
              <li key={s.n} className="flex gap-2 text-[13px] leading-snug">
                <span className="text-meta">{s.n}.</span>
                <Link
                  href={s.href}
                  className="text-ink underline decoration-rule underline-offset-2 hover:decoration-ink"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function AnswerSkeleton() {
  return (
    <div aria-hidden className="space-y-2">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-[92%]" />
      <Skeleton className="h-3.5 w-[74%]" />
      <Skeleton className="mt-3 h-2.5 w-24" />
    </div>
  );
}

export function Assistant() {
  const {
    open,
    openAssistant,
    close,
    messages,
    pending,
    error,
    send,
    clear,
    article,
    scopedToArticle,
    setScopedToArticle,
  } = useAssistant();
  const [value, setValue] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || pending) return;
    setValue("");
    send(text);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openAssistant}
          className="kicker fixed bottom-4 right-4 z-40 h-12 bg-ink px-4 text-white transition-colors hover:bg-brand-ink sm:bottom-6 sm:right-6"
        >
          Baza IGIHE
        </button>
      )}

      {/* The panel covers the page on small screens, so it gets a scrim there. */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 sm:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Baza IGIHE"
          className={cn(
            "fixed bottom-0 right-0 z-50 flex h-[75dvh] min-h-[360px] w-full flex-col border border-ink bg-white",
            "sm:bottom-6 sm:right-6 sm:w-[400px]"
          )}
        >
          <header className="flex h-11 shrink-0 items-center border-b border-ink bg-ink px-3 text-white">
            <span className="kicker">Baza IGIHE</span>
            <span className="ml-auto flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Tangira bushya"
                  className="p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={close}
                aria-label="Funga"
                className="p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </span>
          </header>

          {/* Readers should always know which stories the answers come from. */}
          <div className="flex shrink-0 items-center gap-2 border-b border-rule px-3 py-2">
            {article ? (
              <>
                <span className="kicker shrink-0 text-meta">Ibisubizo biva mu</span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setScopedToArticle(true)}
                    aria-pressed={scopedToArticle}
                    className={cn(
                      "border px-2 py-1 text-[11px] font-medium",
                      scopedToArticle
                        ? "border-ink bg-ink text-white"
                        : "border-rule text-meta hover:border-ink hover:text-ink"
                    )}
                  >
                    Iyi nkuru
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopedToArticle(false)}
                    aria-pressed={!scopedToArticle}
                    className={cn(
                      "border px-2 py-1 text-[11px] font-medium",
                      !scopedToArticle
                        ? "border-ink bg-ink text-white"
                        : "border-rule text-meta hover:border-ink hover:text-ink"
                    )}
                  >
                    Amakuru yose
                  </button>
                </span>
              </>
            ) : (
              <p className="kicker text-meta">Ibisubizo biva mu makuru ya IGIHE</p>
            )}
          </div>

          <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            {messages.length === 0 && !pending && (
              <div>
                <p className="text-[15px] leading-relaxed text-ink">
                  Baza ikibazo ku makuru. Buri gisubizo kigaragaza inkuru
                  gikomokaho.
                </p>
                <ul className="mt-3 space-y-2">
                  {STARTERS.map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        onClick={() => send(q)}
                        className="text-left text-[14px] leading-snug text-brand-ink underline underline-offset-4 hover:text-ink"
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  className="ml-auto max-w-[85%] bg-wash px-3 py-2 text-[14px] leading-snug text-ink"
                >
                  {m.content}
                </p>
              ) : (
                <AssistantMessage key={i} message={m} />
              )
            )}

            {pending && (
              <>
                <p className="sr-only" role="status">
                  Irimo gusoma inkuru
                </p>
                <AnswerSkeleton />
              </>
            )}

            {error && (
              <p className="text-[14px] leading-snug text-ink" role="alert">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={submit}
            className="flex shrink-0 items-center gap-2 border-t border-rule p-2.5"
          >
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Baza ikibazo…"
              aria-label="Baza ikibazo"
              className="min-w-0"
            />
            <button
              type="submit"
              disabled={pending || !value.trim()}
              aria-label="Ohereza"
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-white transition-colors hover:bg-brand-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
