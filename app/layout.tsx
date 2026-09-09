import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { config as faConfig } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

faConfig.autoAddCss = false;
import { AssistantProvider } from "@/components/ai/assistant-provider";
import { Assistant } from "@/components/ai/assistant";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IGIHE — Amakuru y'u Rwanda n'isi yose",
    template: "%s · IGIHE",
  },
  description:
    "Interview demo: an AI engagement layer for Igihe — article summaries and cited answers to questions about the news.",
  openGraph: {
    type: "website",
    siteName: "IGIHE",
    title: "IGIHE — Amakuru y'u Rwanda n'isi yose",
    description:
      "An AI engagement layer for Igihe: summaries and cited answers about the news.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: false, follow: true },
  icons: {
    icon: [{ url: "/favicon.webp", type: "image/webp" }],
    apple: [{ url: "/favicon.webp", type: "image/webp" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="rw">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <AssistantProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-white"
          >
            Simbukira ku nkuru
          </a>
          {children}
          <Assistant />
        </AssistantProvider>
      </body>
    </html>
  );
}
