import { getAllEssays, getSiteIntro, getExcerpt, getConfig } from "@/lib/essays";
import { renderBlock } from "@/components/BlockRenderer";
import AuthorSection from "@/components/AuthorSection";
import TextCard from "@/components/TextCard";
import FadeIn from "@/components/FadeIn";

export default function Home() {
  const essays = getAllEssays();
  const introBlocks = getSiteIntro();
  const config = getConfig();
  const { name, bio, role } = config.author ?? {};
  const textEntries: { slug: string; excerptLength?: number }[] = config.texts ?? [];

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6">
      <header className="pt-20 pb-8 sm:pt-28 sm:pb-12 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink">
          {config.site?.title ?? "Texter"}
        </h1>
      </header>

      {introBlocks.length > 0 && (
        <FadeIn>
          <div className="pb-10 sm:pb-14 text-lg sm:text-xl">
            {introBlocks.map((block, i) => renderBlock(block, i, introBlocks[i - 1]))}
          </div>
        </FadeIn>
      )}

      <main>
        {essays.map((essay, i) => {
          const entry = textEntries.find((t) => t.slug === essay.slug);
          const len = entry?.excerptLength ?? 300;
          return (
            <FadeIn key={essay.slug} delay={i * 0.08}>
              <TextCard
                title={essay.title}
                slug={essay.slug}
                excerpt={getExcerpt(essay, len)}
              />
            </FadeIn>
          );
        })}
      </main>

      <FadeIn>
        <AuthorSection name={name} bio={bio} role={role} />
      </FadeIn>
      <div className="py-12" />
    </div>
  );
}
