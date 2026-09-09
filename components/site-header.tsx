"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

function sectionHref(section: string | null) {
  return section ? `/?section=${encodeURIComponent(section)}` : "/";
}

export function SiteHeader({
  sections,
  dateline,
  activeSection,
  query,
}: {
  sections: string[];
  dateline: string;
  activeSection?: string;
  query?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  // The compact wordmark only appears once the masthead has scrolled away,
  // so the sticky strip stays a navigation rule and not a second masthead.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: "-8px 0px 0px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header>
      {/* Utility bar */}
      <div className="border-b border-rule">
        <div className="mx-auto flex h-11 max-w-page items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-ink hover:bg-wash"
              aria-label="Fungura ibyiciro"
            >
              <Menu className="h-[18px] w-[18px]" aria-hidden />
              <span className="hidden sm:inline">Ibyiciro</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-expanded={searchOpen}
              className="inline-flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-ink hover:bg-wash"
              aria-label="Shakisha inkuru"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden />
              <span className="hidden sm:inline">Shakisha</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="#"
              className="hidden px-2 text-[13px] font-medium text-ink underline-offset-4 hover:underline sm:inline"
            >
              Injira
            </Link>
            <Button size="sm" className="uppercase tracking-[0.08em]">
              Iyandikishe
            </Button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-rule bg-wash">
          <form action="/" className="mx-auto flex max-w-page gap-2 px-4 py-3">
            <Input
              autoFocus
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Shakisha inkuru, ijambo cyangwa umwanditsi"
              aria-label="Shakisha inkuru"
              className="border-ink"
            />
            <Button type="submit" variant="dark" size="md">
              Shakisha
            </Button>
          </form>
        </div>
      )}

      {/* Masthead */}
      <div className="mx-auto max-w-page px-4 py-6 text-center sm:py-8">
        <p className="byline">{dateline}</p>
        <Link href="/" className="mt-3 block">
          <span className="block text-[clamp(2.5rem,9vw,5rem)] font-black leading-none tracking-[0.16em] text-ink">
            IGIHE
          </span>
        </Link>
        <p className="mt-3 kicker text-meta">Amakuru y&apos;u Rwanda n&apos;isi yose</p>
      </div>

      <div ref={sentinel} aria-hidden />

      {/* Section strip — sticks to the top and carries the wordmark when it does */}
      <nav
        aria-label="Ibyiciro"
        className="sticky top-0 z-30 border-y border-ink bg-white"
      >
        <div className="mx-auto flex max-w-page items-center gap-4 px-4">
          <Link
            href="/"
            className={cn(
              "shrink-0 text-lg font-black tracking-[0.12em] transition-opacity duration-200",
              stuck ? "opacity-100" : "hidden opacity-0"
            )}
            aria-hidden={!stuck}
            tabIndex={stuck ? undefined : -1}
          >
            IGIHE
          </Link>
          <ul className="flex flex-1 items-stretch gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <li>
              <Link
                href="/"
                className={cn(
                  "inline-flex h-11 items-center whitespace-nowrap border-b-[3px] px-3 text-[13px] font-medium",
                  !activeSection
                    ? "border-brand text-ink"
                    : "border-transparent text-meta hover:text-ink"
                )}
              >
                Ahabanza
              </Link>
            </li>
            {sections.map((s) => (
              <li key={s}>
                <Link
                  href={sectionHref(s)}
                  className={cn(
                    "inline-flex h-11 items-center whitespace-nowrap border-b-[3px] px-3 text-[13px] font-medium",
                    activeSection === s
                      ? "border-brand text-ink"
                      : "border-transparent text-meta hover:text-ink"
                  )}
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Sections drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ibyiciro"
            className="relative flex h-full w-full max-w-sm flex-col border-r border-rule bg-white"
          >
            <div className="flex h-11 items-center justify-between border-b border-rule px-4">
              <span className="kicker text-meta">Ibyiciro</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Funga"
                className="p-1.5 hover:bg-wash"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <form action="/" className="mb-5 flex gap-2">
                <Input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Shakisha"
                  aria-label="Shakisha inkuru"
                />
                <Button type="submit" variant="dark" size="md">
                  <Search className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Shakisha</span>
                </Button>
              </form>
              <ul className="divide-y divide-rule border-y border-rule">
                <li>
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-lg font-bold tracking-[-0.02em] hover:text-brand-ink"
                  >
                    Ahabanza
                  </Link>
                </li>
                {sections.map((s) => (
                  <li key={s}>
                    <Link
                      href={sectionHref(s)}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-lg font-bold tracking-[-0.02em] hover:text-brand-ink"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="#"
                className="mt-5 inline-block text-[13px] font-medium underline underline-offset-4"
              >
                Injira
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
