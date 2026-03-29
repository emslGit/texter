import { readFileSync } from "fs";
import { join } from "path";
import { getAllEssays, getSiteIntro, getExcerpt } from "@/lib/essays";
import AuthorSection from "@/components/AuthorSection";
import Epigraph from "@/components/Epigraph";
import TextCard from "@/components/TextCard";
import FadeIn from "@/components/FadeIn";

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
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6">
      <header className="pt-20 pb-8 sm:pt-28 sm:pb-12 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink mb-10 sm:mb-14">
          {config.site?.title ?? "Texter"}
        </h1>
        <Epigraph lines={siteIntro.epigraph} />
      </header>

      {siteIntro.intro.length > 0 && (
        <FadeIn>
          <div className="pb-10 sm:pb-14">
            {siteIntro.intro.map((p, i) => (
              <p key={i} className="text-lg sm:text-xl leading-relaxed [&:not(:first-child)]:indent-8">
                {p}
              </p>
            ))}
          </div>
        </FadeIn>
      )}

      <main>
        {essays.map((essay, i) => {
          const len = config.texts?.[essay.slug]?.excerptLength ?? 300;
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
