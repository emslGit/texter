import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllEssays, getEssay, getManifest, getExcerpt, getConfig } from "@/lib/essays";
import { renderBlock, renderWithInnerQuotes } from "@/components/BlockRenderer";
import AuthorSection from "@/components/AuthorSection";
import TextCard from "@/components/TextCard";
import FadeIn from "@/components/FadeIn";

export function generateStaticParams() {
  const manifest = getManifest();
  return manifest.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = getEssay(slug);
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
  const otherEssays = getAllEssays()
    .filter((e) => e.slug !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

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

      <header className={`pt-8 sm:pt-12 text-center ${essay.quote ? "pb-10 sm:pb-14" : "pb-4 sm:pb-6"}`}>
        <h1 className={`font-serif text-3xl sm:text-4xl font-medium text-ink leading-tight ${essay.quote ? "mb-6" : ""}`}>
          {essay.title}
        </h1>
        {essay.quote && (
          <blockquote className="text-center">
            <p className="type-quote">&ldquo;{renderWithInnerQuotes(essay.quote)}&rdquo;</p>
            {essay.quoteAuthor && (
              <cite className="type-quote-author">&mdash; {essay.quoteAuthor}</cite>
            )}
          </blockquote>
        )}
      </header>

      <main className="text-lg sm:text-xl">
        {essay.blocks.map((block, idx) => renderBlock(block, idx, essay.blocks[idx - 1], essay.blocks[idx + 1]))}
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
                excerpt={getExcerpt(other, (config.texts ?? []).find((t: { slug: string }) => t.slug === other.slug)?.excerptLength ?? 300)}
              />
            ))}
          </section>
        </FadeIn>
      )}

      <FadeIn>
        <div className="flex justify-center py-12">
          <Link
            href="/"
            className="font-sans text-sm font-medium uppercase tracking-widest text-ink-muted border-b border-border pb-1 hover:text-ink hover:border-ink transition-colors"
          >
            Fler texter
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
