import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";
import { getAllEssays, getSiteIntro } from "@/lib/essays";
import AuthorSection from "@/components/AuthorSection";

function getConfig() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "content/config.json"), "utf-8"));
  } catch {
    return { author: { name: "", bio: "", role: "" } };
  }
}

export default function Home() {
  const essays = getAllEssays();
  const siteIntro = getSiteIntro();
  const config = getConfig();
  const { name, bio, role } = config.author ?? {};

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Site intro */}
      {siteIntro.epigraph.length > 0 && (
        <header className="pt-20 pb-8 sm:pt-28 sm:pb-12 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink mb-10 sm:mb-14">
            {config.site?.title ?? "Texter"}
          </h1>
          <blockquote>
            {siteIntro.epigraph.map((line, i) =>
              line.startsWith("(") ? (
                <cite
                  key={i}
                  className="block mt-4 text-sm not-italic text-ink-muted tracking-wide"
                >
                  {line}
                </cite>
              ) : (
                <p key={i} className="text-lg sm:text-xl italic text-ink-light leading-loose">
                  {line}
                </p>
              )
            )}
          </blockquote>
        </header>
      )}

      {siteIntro.intro.length > 0 && (
        <div className="pb-10 sm:pb-14">
          {siteIntro.intro.map((p, i) => (
            <p key={i} className="text-base sm:text-lg leading-loose mb-5 last:mb-0">
              {p}
            </p>
          ))}
        </div>
      )}

      {/* Text cards */}
      <main>
        {essays.map((essay) => {
          const firstPara = essay.sections[0]?.paragraphs[0] ?? "";
          const excerpt = firstPara.slice(0, 200) + (firstPara.length > 200 ? "\u2026" : "");
          return (
            <article
              key={essay.slug}
              className="py-14 sm:py-20 border-t border-border-light"
            >
              <Link href={`/${essay.slug}`} className="group block">
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink mb-4 group-hover:text-ink-light transition-colors">
                  {essay.title}
                </h2>
              </Link>
              {excerpt && (
                <p className="text-base text-ink-light leading-relaxed mb-6">
                  {excerpt}
                </p>
              )}
              <Link
                href={`/${essay.slug}`}
                className="font-sans font-light text-xs text-ink-muted uppercase tracking-widest hover:text-ink transition-colors"
              >
                Läs texten →
              </Link>
            </article>
          );
        })}
      </main>

      <AuthorSection name={name} bio={bio} role={role} />

      <div className="py-12" />
    </div>
  );
}
