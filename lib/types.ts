export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string | null;
  date: string;
  author: string;
  category: string;
  sourceUrl: string;
  locale: string;
}

export interface Summary {
  articleId: string;
  bullets: string[];
  language: string;
  questions?: string[];
}

export interface General {
  questions: string[];
  generatedAt: string;
}
