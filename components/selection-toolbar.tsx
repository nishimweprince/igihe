"use client";

import { useEffect, useRef, useState } from "react";
import { useAssistant } from "./ai/assistant-provider";

/** Highlight a passage in a story and hand it straight to the assistant. */
export function SelectionToolbar() {
  const { send } = useAssistant();
  const [sel, setSel] = useState<{ text: string; x: number; y: number } | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle() {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";
      if (text.length < 10 || !selection || selection.rangeCount === 0) {
        setSel(null);
        return;
      }
      if (ref.current?.contains(document.activeElement)) return;
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSel({
        text,
        x: Math.min(rect.left + window.scrollX, window.innerWidth - 220),
        y: rect.top + window.scrollY - 46,
      });
    }
    document.addEventListener("mouseup", handle);
    document.addEventListener("keyup", handle);
    return () => {
      document.removeEventListener("mouseup", handle);
      document.removeEventListener("keyup", handle);
    };
  }, []);

  if (!sel) return null;

  function act(question: string) {
    if (!sel) return;
    send(question, sel.text);
    setSel(null);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="Ibikorwa ku byo wahisemo"
      className="absolute z-30 flex border border-ink bg-ink text-white"
      style={{ left: Math.max(8, sel.x), top: Math.max(8, sel.y) }}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => act("Sobanura iyi nteruro mu magambo yoroshye")}
        className="kicker px-3 py-2.5 hover:bg-brand-ink"
      >
        Sobanura
      </button>
      <span className="w-px bg-white/20" aria-hidden />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => act("Nyihe incamake y'iyi nteruro")}
        className="kicker px-3 py-2.5 hover:bg-brand-ink"
      >
        Incamake
      </button>
    </div>
  );
}
