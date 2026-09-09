"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface Source {
  n: number;
  title: string;
  href: string;
  origin: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface ArticleScope {
  articleId: string;
  title: string;
}

interface AssistantValue {
  open: boolean;
  openAssistant: () => void;
  close: () => void;
  toggle: () => void;
  messages: Message[];
  pending: boolean;
  error: string | null;
  send: (text: string, selection?: string) => void;
  clear: () => void;
  article: ArticleScope | null;
  setArticle: (scope: ArticleScope | null) => void;
  /** True when answers are limited to the article the reader is on. */
  scopedToArticle: boolean;
  setScopedToArticle: (v: boolean) => void;
}

const AssistantContext = createContext<AssistantValue | null>(null);

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant must be used inside <AssistantProvider>");
  }
  return ctx;
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticleState] = useState<ArticleScope | null>(null);
  const [scopedToArticle, setScopedToArticle] = useState(true);

  // send() reads scope at call time, so it never closes over a stale article.
  const scopeRef = useRef<{ article: ArticleScope | null; scoped: boolean }>({
    article: null,
    scoped: true,
  });
  scopeRef.current = { article, scoped: scopedToArticle };

  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const setArticle = useCallback((scope: ArticleScope | null) => {
    setArticleState(scope);
    if (scope) setScopedToArticle(true);
  }, []);

  const send = useCallback(async (text: string, selection?: string) => {
    const question = text.trim();
    if (!question) return;
    setOpen(true);
    setError(null);
    setPending(true);

    const history = messagesRef.current.map(({ role, content }) => ({
      role,
      content,
    }));
    const next = [...messagesRef.current, { role: "user" as const, content: question }];
    setMessages(next);

    const { article: current, scoped } = scopeRef.current;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: scoped && current ? current.articleId : null,
          question,
          selection,
          history: history.slice(-6),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ntibyakunze kubona igisubizo.");
      setMessages([
        ...next,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Habaye ikibazo. Ongera ugerageze.");
    } finally {
      setPending(false);
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const openAssistant = useCallback(() => setOpen(true), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Escape closes the panel from anywhere on the page.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo(
    () => ({
      open,
      openAssistant,
      close,
      toggle,
      messages,
      pending,
      error,
      send,
      clear,
      article,
      setArticle,
      scopedToArticle,
      setScopedToArticle,
    }),
    [
      open,
      openAssistant,
      close,
      toggle,
      messages,
      pending,
      error,
      send,
      clear,
      article,
      setArticle,
      scopedToArticle,
    ]
  );

  return (
    <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
  );
}

/** Registers the article a reader is on so answers can be scoped to it. */
export function AssistantScope({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const { setArticle } = useAssistant();
  useEffect(() => {
    setArticle({ articleId, title });
    return () => setArticle(null);
  }, [articleId, title, setArticle]);
  return null;
}
