import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Article, General, Summary } from "./types";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** The scrape keeps HTML entities in place (&#8217; and friends). Text goes
 *  into React as plain strings, so decode once on load rather than per view. */
function decodeEntities(value: string): string {
  return value.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      return String.fromCodePoint(parseInt(body.slice(2), 16));
    }
    if (body.startsWith("#")) {
      return String.fromCodePoint(Number(body.slice(1)));
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

function decodeArticle(article: Article): Article {
  return {
    ...article,
    title: decodeEntities(article.title),
    excerpt: decodeEntities(article.excerpt),
    body: decodeEntities(article.body),
    author: decodeEntities(article.author),
    category: decodeEntities(article.category),
  };
}

let articlesCache: Article[] | null = null;
let summariesCache: Summary[] | null = null;
let generalCache: General | null = null;

export function getGeneral(): General {
  if (generalCache === null) {
    try {
      const raw = JSON.parse(
        readFileSync(join(process.cwd(), "data", "general.json"), "utf8")
      ) as General;
      generalCache = {
        ...raw,
        questions: raw.questions.map(decodeEntities),
      };
    } catch {
      generalCache = { questions: [], generatedAt: "" };
    }
  }
  return generalCache;
}

export function getArticles(): Article[] {
  if (articlesCache === null) {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "data", "articles.json"), "utf8")
    ) as Article[];
    articlesCache = raw.map(decodeArticle);
  }
  return articlesCache;
}

export function getSummaries(): Map<string, Summary> {
  if (summariesCache === null) {
    try {
      const raw = JSON.parse(
        readFileSync(join(process.cwd(), "data", "summaries.json"), "utf8")
      ) as Summary[];
      summariesCache = raw.map((s) => ({
        ...s,
        bullets: s.bullets.map(decodeEntities),
        questions: s.questions?.map(decodeEntities),
      }));
    } catch {
      summariesCache = [];
    }
  }
  const cache: Summary[] = summariesCache;
  return new Map(cache.map((s) => [s.articleId, s]));
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}
