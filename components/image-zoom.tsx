"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * The article picture, enlargeable. Click opens it over the page at full
 * size; Escape, the backdrop and the close control all put it back.
 */
export function ImageZoom({
  src,
  caption,
  className,
}: {
  src: string;
  caption?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Paint the overlay at rest first, then transition it in on the next frame.
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    setShown(false);
    window.setTimeout(() => setOpen(false), 180);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Reba ifoto yagutse"
        className="zoomable block w-full"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className={className} />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ifoto yagutse"
            onClick={close}
            className={[
              "fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4 transition-opacity duration-200 ease-out",
              shown ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Funga ifoto"
              className="absolute right-3 top-3 p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>

            <figure
              onClick={(e) => e.stopPropagation()}
              className={[
                "max-h-full w-auto transition-transform duration-200 ease-out",
                shown ? "scale-100" : "scale-[0.97]",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                onClick={close}
                className="mx-auto max-h-[82vh] w-auto max-w-full cursor-zoom-out object-contain"
              />
              {caption && (
                <figcaption className="mx-auto mt-3 max-w-measure text-center text-[12px] text-white/70">
                  {caption}
                </figcaption>
              )}
            </figure>
          </div>,
          document.body
        )}
    </>
  );
}
