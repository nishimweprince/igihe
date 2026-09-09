import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeader } from "@/components/section-header";
import {
  BriefStory,
  LeadStory,
  RankedStory,
  StoryCard,
} from "@/components/article-cards";
import { getArticles } from "@/lib/articles-data";
import { formatDateline } from "@/lib/format";
import type { Article } from "@/lib/types";

export const metadata: Metadata = {
  title: "Amakuru y'u Rwanda n'isi yose",
  description:
    "Soma amakuru ya IGIHE, hanyuma ubaze ikibazo ku nkuru iyo ari yo yose — igisubizo giherekejwe n'aho gikomoka.",
  alternates: { canonical: "/" },
};

function sectionsOf(articles: Article[]) {
  return Array.from(new Set(articles.map((a) => a.category)));
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; q?: string }>;
}) {
  const { section, q } = await searchParams;
  const articles = getArticles();
  const sections = sectionsOf(articles);
  const dateline = formatDateline(articles[0]?.date ?? new Date().toISOString());
  const filtering = Boolean(section || q?.trim());

  const query = q?.trim().toLowerCase() ?? "";
  const results = filtering
    ? articles.filter((a) => {
        if (section && a.category !== section) return false;
        if (!query) return true;
        return `${a.title} ${a.excerpt} ${a.category} ${a.author}`
          .toLowerCase()
          .includes(query);
      })
    : [];

  // Front-page allocation: each slot gets its own slice, no story runs twice.
  const [lead, ...rest] = articles;
  const secondary = rest.slice(0, 2);
  const briefs = rest.slice(2, 7);
  const ranked = rest.slice(7, 12);
  const latest = rest.slice(12, 20);
  const used = new Set(
    [lead, ...secondary, ...briefs, ...ranked, ...latest].map((a) => a.id)
  );
  const bySection = sections
    .map((name) => ({
      name,
      stories: articles
        .filter((a) => a.category === name && !used.has(a.id))
        .slice(0, 4),
    }))
    .filter((s) => s.stories.length >= 3)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader
        sections={sections}
        dateline={dateline}
        activeSection={section}
        query={q}
      />

      <main id="main" className="mx-auto max-w-page px-4">
        {filtering ? (
          <section className="py-6">
            <SectionHeader title={section ?? `Ishakisha: ${q}`} />
            <p className="byline mb-6">
              Inkuru {results.length}
              {q ? ` zijyanye na “${q}”` : ""}
            </p>
            {results.length === 0 ? (
              <div className="border border-rule p-8 text-center">
                <p className="hed hed-2">Nta nkuru ibonetse.</p>
                <p className="deck mx-auto mt-2 max-w-[40ch]">
                  Gerageza ijambo rindi, cyangwa subira ku rupapuro rw&apos;imbere.
                </p>
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {results.map((a) => (
                  <StoryCard key={a.id} article={a} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Front page: lead in the centre, briefs left, most-read right. */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 py-6 lg:grid-cols-12 lg:gap-y-0">
              <section
                aria-label="Inkuru y'ibanze"
                className="lg:order-2 lg:col-span-6 lg:border-x lg:border-rule lg:px-6"
              >
                <SectionHeader title="Inkuru y'ibanze" />
                {lead && <LeadStory article={lead} />}
                {secondary.length > 0 && (
                  <div className="grid gap-x-6 gap-y-6 border-t border-rule pt-6 sm:grid-cols-2">
                    {secondary.map((a, i) => (
                      <div
                        key={a.id}
                        className={i === 1 ? "sm:col-rule sm:pl-6" : undefined}
                      >
                        <StoryCard article={a} size="md" />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section
                aria-label="Ibyihuse"
                className="lg:order-1 lg:col-span-3 lg:pr-6"
              >
                <SectionHeader title="Ibyihuse" />
                <div className="divide-y divide-rule border-b border-rule">
                  {briefs.map((a) => (
                    <BriefStory key={a.id} article={a} />
                  ))}
                </div>
              </section>

              <aside
                aria-label="Ibisomwa cyane"
                className="lg:order-3 lg:col-span-3 lg:pl-6"
              >
                <SectionHeader title="Ibisomwa cyane" />
                <div className="divide-y divide-rule border-b border-rule">
                  {ranked.map((a, i) => (
                    <RankedStory key={a.id} article={a} rank={i + 1} />
                  ))}
                </div>
              </aside>
            </div>

            <section aria-label="Amakuru mashya" className="pt-8">
              <SectionHeader title="Amakuru mashya" />
              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {latest.map((a, i) => (
                  <div
                    key={a.id}
                    className={cnColumn(i)}
                  >
                    <StoryCard article={a} showDeck={false} />
                  </div>
                ))}
              </div>
            </section>

            {bySection.map(({ name, stories }) => (
              <section key={name} aria-label={name} className="pt-10">
                <SectionHeader
                  title={name}
                  href={`/?section=${encodeURIComponent(name)}`}
                />
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                  {stories.map((a, i) => (
                    <div key={a.id} className={cnColumn(i)}>
                      <StoryCard
                        article={a}
                        showImage={i === 0}
                        showDeck={i === 0}
                        size={i === 0 ? "md" : "sm"}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

/** Hairlines between grid columns, drawn only where a column actually starts. */
function cnColumn(i: number) {
  return [
    i % 2 === 1 ? "sm:col-rule sm:pl-6" : "",
    i % 4 === 0 ? "lg:border-l-0 lg:pl-0" : "lg:col-rule lg:pl-6",
  ]
    .filter(Boolean)
    .join(" ");
}
