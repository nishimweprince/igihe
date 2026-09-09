import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getArticle, getArticles } from "@/lib/articles-data";
import type { Article } from "@/lib/types";

const MODEL = "gpt-4o-mini";
const CORPUS_SIZE = 14;

interface AskBody {
  articleId?: string | null;
  question?: string;
  selection?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export interface Source {
  n: number;
  title: string;
  href: string;
  origin: string;
}

function toSource(article: Article, n: number): Source {
  return {
    n,
    title: article.title,
    href: `/article/${article.slug}`,
    origin: article.sourceUrl,
  };
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI ntiboneka muri iyi demo — nta API key yashyizweho. Soma inkuru yuzuye kuri igihe.com.",
      },
      { status: 503 }
    );
  }

  let body: AskBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { articleId, question, selection, history } = body;
  if (!question?.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  // Two scopes: one article the reader is on, or the whole front page.
  let sources: Source[];
  let context: string;

  if (articleId) {
    const article = getArticle(articleId);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    sources = [toSource(article, 1)];
    context = `[1] ${article.title}\n${article.body}`.slice(0, 12000);
  } else {
    const corpus = getArticles().slice(0, CORPUS_SIZE);
    sources = corpus.map((a, i) => toSource(a, i + 1));
    context = corpus
      .map(
        (a, i) =>
          `[${i + 1}] ${a.title} (${a.category})\n${a.excerpt}\n${a.body.slice(0, 700)}`
      )
      .join("\n\n");
  }

  const focus = selection?.trim()
    ? `The reader highlighted this passage — focus your answer on it:\n"""${selection
        .trim()
        .slice(0, 2000)}"""\n\n`
    : "";

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are the newsroom assistant for IGIHE, a Rwandan news site. " +
          "Answer ONLY from the numbered articles provided — never use outside knowledge. " +
          "Cite every claim with the bracketed number of the article it came from, like [2]. " +
          "If the articles do not answer the question, say so briefly and suggest what the reader could look at instead. " +
          "Reply in the same language as the reader's question (Kinyarwanda, English, or French). " +
          "Keep answers under 120 words.",
      },
      ...(history ?? []).slice(-6),
      {
        role: "user",
        content: `${focus}ARTICLES:\n"""${context}"""\n\nQUESTION: ${question.trim()}`,
      },
    ],
  });

  return NextResponse.json({
    answer: res.choices[0]?.message?.content?.trim() ?? "",
    sources,
  });
}
