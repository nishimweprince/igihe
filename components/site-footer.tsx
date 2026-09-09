import Link from "next/link";

const COLUMNS = [
  {
    title: "Ibyiciro",
    links: ["Amakuru", "Ubukungu", "Imikino", "Imyidagaduro", "Ikoranabuhanga"],
  },
  {
    title: "IGIHE",
    links: ["Abo turi bo", "Itangazamakuru", "Akazi", "Twandikire"],
  },
  {
    title: "Serivisi",
    links: ["Iyandikishe", "Amatangazo", "Ubufatanye", "Amabwiriza"],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t-[3px] border-ink">
      <div className="mx-auto max-w-page px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-2xl font-black tracking-[0.14em]">IGIHE</p>
            <p className="deck mt-2 text-[0.8125rem]">
              Amakuru y&apos;u Rwanda n&apos;isi yose, buri munsi.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="kicker text-meta">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-[13px] text-ink underline-offset-4 hover:underline"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-10 border-t border-rule pt-5 text-[12px] leading-relaxed text-meta">
          Iyi ni demo y&apos;ubushakashatsi — igaragaza uko AI yafasha abasomyi ba
          IGIHE. Inkuru zose n&apos;amafoto ni ibya{" "}
          <a
            href="https://igihe.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            igihe.com
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
