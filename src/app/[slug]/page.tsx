import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";
import { getAllEssays, getEssay, getManifest } from "@/lib/essays";
import AuthorSection from "@/components/AuthorSection";

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

export async function generateMetadata() {
  const cfg = getConfig();
  return { title: cfg.site?.title ?? "Texter" };
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
  const otherEssays = getAllEssays().filter((e) => e.slug !== slug);

  // Known poem starters for detecting verse blocks
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Back link */}
      <nav className="pt-6 pb-2">
        <Link
          href="/"
          className="font-sans font-light text-xs text-ink-muted uppercase tracking-widest hover:text-ink transition-colors"
        >
          ← Alla texter
        </Link>
      </nav>

      {/* Title */}
      <header className="pt-8 pb-10 sm:pt-12 sm:pb-14">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink leading-tight">
          {essay.title}
        </h1>
      </header>

      {/* Body */}
      <main className="text-base sm:text-lg leading-loose">
        {elements.map((el, idx) =>
          el.type === "poem" ? (
            <blockquote
              key={idx}
              className="my-8 sm:my-10 py-5 px-5 sm:py-6 sm:px-8 border-l-2 border-accent bg-accent/5"
            >
              {el.lines.map((line, li) => (
                <p
                  key={li}
                  className="italic text-ink-light mb-3 last:mb-0 leading-loose"
                >
                  {line}
                </p>
              ))}
            </blockquote>
          ) : (
            <p key={idx} className="mb-5">
              {el.lines[0]}
            </p>
          )
        )}
      </main>

      {/* Author */}
      <AuthorSection name={name} bio={bio} role={role} />

      {/* Other texts */}
      {otherEssays.length > 0 && (
        <section className="border-t border-border pt-12 pb-4">
          <p className="font-sans font-light text-xs text-ink-muted uppercase tracking-widest mb-8">
            Fler texter
          </p>
          {otherEssays.map((other) => {
            const firstPara = other.sections[0]?.paragraphs[0] ?? "";
            const excerpt = firstPara.slice(0, 200) + (firstPara.length > 200 ? "\u2026" : "");
            return (
              <article key={other.slug} className="py-8 border-t border-border-light first:border-t-0">
                <Link href={`/${other.slug}`} className="group block">
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink mb-3 group-hover:text-ink-light transition-colors">
                    {other.title}
                  </h3>
                </Link>
                {excerpt && (
                  <p className="text-sm sm:text-base text-ink-light leading-relaxed mb-4">
                    {excerpt}
                  </p>
                )}
                <Link
                  href={`/${other.slug}`}
                  className="font-sans font-light text-xs text-ink-muted uppercase tracking-widest hover:text-ink transition-colors"
                >
                  Läs texten →
                </Link>
              </article>
            );
          })}
        </section>
      )}

      <footer className="py-12">
        <div className="border-t border-border" />
      </footer>
    </div>
  );
}
