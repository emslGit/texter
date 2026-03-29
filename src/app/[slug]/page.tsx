import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";
import { getAllEssays, getEssay, getManifest, getExcerpt } from "@/lib/essays";
import AuthorSection from "@/components/AuthorSection";
import Quote from "@/components/Quote";
import TextCard from "@/components/TextCard";
import FadeIn from "@/components/FadeIn";

function getConfig() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "content/config.json"), "utf-8"));
  } catch {
    return { author: { name: "", bio: "", role: "" } };
  }
}

export function generateStaticParams() {
  const manifest = getManifest();
  return manifest.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = getEssay(slug);
  const cfg = getConfig();
  const siteTitle = "Ingegerds texter";
  if (!essay) return { title: siteTitle };
  const description = getExcerpt(essay, 160).replace(/…$/, "");
  return {
    title: `${essay.title} — ${siteTitle}`,
    description,
    openGraph: {
      title: `${essay.title} — ${siteTitle}`,
      description,
    },
  };
}

// Poem detection
const POEM_STARTERS = [
  '"Maria, Maria',
  "\u201cMaria, Maria",
  "\u201dMaria, Maria",
  '"Det tänds ett ljus',
  "\u201cDet tänds ett ljus",
  "\u201dDet tänds ett ljus",
];

function isPoemStart(text: string): boolean {
  return POEM_STARTERS.some((s) => text.startsWith(s));
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) notFound();

  const config = getConfig();
  const { name, bio, role } = config.author ?? {};
  const quote = config.texts?.[slug]?.quote ?? "";
  const quoteAuthor = config.texts?.[slug]?.quoteAuthor ?? "";
  const otherEssays = getAllEssays().filter((e) => e.slug !== slug);

  // Build paragraph elements with poem detection
  const paragraphs = essay.sections.flatMap((s) => s.paragraphs);
  const elements: { type: "p" | "poem"; lines: string[] }[] = [];
  let i = 0;
  while (i < paragraphs.length) {
    if (isPoemStart(paragraphs[i])) {
      const poemLines: string[] = [];
      while (i < paragraphs.length) {
        poemLines.push(paragraphs[i]);
        const t = paragraphs[i].trim();
        const endsQuote = t.endsWith('"') || t.endsWith("\u201d");
        const startsQuote = /^[\u201c\u201d"]/.test(t);
        const isEmbedded = startsQuote && endsQuote;
        i++;
        if (endsQuote && !isEmbedded) break;
      }
      elements.push({ type: "poem", lines: poemLines });
    } else {
      elements.push({ type: "p", lines: [paragraphs[i]] });
      i++;
    }
  }

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6">
      <nav className="pt-6 pb-2">
        <Link
          href="/"
          className="font-sans font-medium text-sm text-ink-muted uppercase tracking-widest hover:text-ink transition-colors"
        >
          ← Alla texter
        </Link>
      </nav>

      <header className="pt-8 pb-10 sm:pt-12 sm:pb-14 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink leading-tight mb-6">
          {essay.title}
        </h1>
        <Quote text={quote} author={quoteAuthor} />
      </header>

      <main className="text-lg sm:text-xl leading-loose">
        {elements.map((el, idx) =>
          el.type === "poem" ? (
            <blockquote
              key={idx}
              className="my-8 sm:my-10 py-5 px-5 sm:py-6 sm:px-8 border-l-2 border-accent bg-accent/5"
            >
              {el.lines.map((line, li) => (
                <p key={li} className="italic text-ink-light mb-3 last:mb-0 leading-loose">
                  {line}
                </p>
              ))}
            </blockquote>
          ) : (
            <p key={idx} className={idx === 0 || elements[idx - 1].type === "poem" ? "" : "indent-[1.5em]"}>
              {el.lines[0]}
            </p>
          )
        )}
      </main>

      <FadeIn>
        <AuthorSection name={name} bio={bio} role={role} />
      </FadeIn>

      {otherEssays.length > 0 && (
        <FadeIn>
        <section className="pt-12 pb-4">
          <p className="font-sans font-medium text-sm text-ink-muted uppercase tracking-widest mb-4">
            Fler texter
          </p>
          {otherEssays.map((other) => (
            <TextCard
              key={other.slug}
              title={other.title}
              slug={other.slug}
              excerpt={getExcerpt(other, config.texts?.[other.slug]?.excerptLength ?? 300)}
            />
          ))}
        </section>
        </FadeIn>
      )}

      <div className="py-12" />
    </div>
  );
}
