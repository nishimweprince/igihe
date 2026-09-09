import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeader } from "@/components/section-header";
import { RailStory, StoryCard } from "@/components/article-cards";
import { ImageZoom } from "@/components/image-zoom";
import { SelectionToolbar } from "@/components/selection-toolbar";
import { AssistantScope } from "@/components/ai/assistant-provider";
import { getArticle, getArticles, getSummaries } from "@/lib/articles-data";
import {
  formatDate,
  formatDateline,
  isoDate,
  readMinutes,
} from "@/lib/format";

export async function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Inkuru ntibonetse" };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: article.author ? [article.author] : undefined,
      images: article.image ? [{ url: article.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const articles = getArticles();
  const sections = Array.from(new Set(articles.map((a) => a.category)));
  const summary = getSummaries().get(article.id);
  const paragraphs = article.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const related = articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 4);
  const more = articles
    .filter((a) => a.id !== article.id && !related.includes(a))
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: article.author
      ? { "@type": "Person", name: article.author }
      : undefined,
    image: article.image ? [article.image] : undefined,
    mainEntityOfPage: article.sourceUrl,
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader
        sections={sections}
        dateline={formatDateline(article.date)}
        activeSection={article.category}
      />
      <AssistantScope articleId={article.id} title={article.title} />
      <SelectionToolbar />

      <main id="main" className="mx-auto max-w-page px-4">
        <div className="grid grid-cols-1 gap-x-8 py-6 lg:grid-cols-12">
          <article className="lg:col-span-8 lg:pr-8">
            <p className="kicker text-brand-ink">
              <Link
                href={`/?section=${encodeURIComponent(article.category)}`}
                className="hover:underline"
              >
                {article.category}
              </Link>
            </p>

            <h1 className="mt-3 text-[clamp(1.75rem,1.2rem+2.2vw,2.75rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink [text-wrap:balance]">
              {article.title}
            </h1>

            <p className="deck mt-4 max-w-[58ch] text-[1.0625rem]">
              {article.excerpt}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-rule py-3">
              <p className="byline text-ink">Na {article.author || "IGIHE"}</p>
              <p className="byline">
                <time dateTime={isoDate(article.date)}>{formatDate(article.date)}</time>
              </p>
              <p className="byline">Gusoma: iminota {readMinutes(article.body)}</p>
            </div>

            {article.image && (
              <figure className="mt-6">
                <ImageZoom
                  src={article.image}
                  caption="Ifoto: IGIHE"
                  className="aspect-[16/9] w-full bg-wash object-cover"
                />
                <figcaption className="mt-2 text-[12px] leading-snug text-meta">
                  Ifoto: IGIHE
                </figcaption>
              </figure>
            )}

            {summary && summary.bullets.length > 0 && (
              <section
                aria-label="Incamake ya AI"
                className="section-rule mt-8 pt-3"
              >
                <p className="kicker text-meta">Mu magambo make</p>
                <ul className="mt-3 list-disc space-y-2 pl-4 marker:text-rule">
                  {summary.bullets.map((b, i) => (
                    <li key={i} className="text-[15px] leading-relaxed text-ink">
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] text-meta">
                  Incamake ishingiye ku nkuru yuzuye iri hepfo.
                </p>
              </section>
            )}

            <div className="prose-news mt-7 max-w-measure">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <p className="mt-8 border-t border-rule pt-4 text-[13px] text-meta">
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-ink underline underline-offset-4 hover:text-brand-ink"
              >
                Soma inkuru yuzuye kuri igihe.com
              </a>
            </p>
          </article>

          <aside className="mt-10 lg:col-span-4 lg:mt-0 lg:border-l lg:border-rule lg:pl-8">
            {related.length > 0 && (
              <section aria-label={`Ibindi muri ${article.category}`}>
                <SectionHeader
                  title={article.category}
                  href={`/?section=${encodeURIComponent(article.category)}`}
                />
                <div className="divide-y divide-rule border-b border-rule">
                  {related.map((a) => (
                    <RailStory key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>

        {more.length > 0 && (
          <section aria-label="Ibindi wasoma" className="pt-6">
            <SectionHeader title="Ibindi wasoma" href="/" />
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {more.map((a, i) => (
                <div
                  key={a.id}
                  className={[
                    i % 2 === 1 ? "sm:col-rule sm:pl-6" : "",
                    i % 4 === 0 ? "lg:border-l-0 lg:pl-0" : "lg:col-rule lg:pl-6",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <StoryCard article={a} showDeck={false} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
