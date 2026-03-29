import { readFileSync } from "fs";
import { join } from "path";
import { getAllEssays, getSiteIntro, getExcerpt } from "@/lib/essays";
import AuthorSection from "@/components/AuthorSection";
import Epigraph from "@/components/Epigraph";
import TextCard from "@/components/TextCard";

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
      <header className="pt-20 pb-8 sm:pt-28 sm:pb-12 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink mb-10 sm:mb-14">
          {config.site?.title ?? "Texter"}
        </h1>
        <Epigraph lines={siteIntro.epigraph} />
      </header>

      {siteIntro.intro.length > 0 && (
        <div className="pb-10 sm:pb-14">
          {siteIntro.intro.map((p, i) => (
            <p key={i} className="text-base sm:text-lg leading-loose mb-5 last:mb-0">
              {p}
            </p>
          ))}
        </div>
      )}

      <main>
        {essays.map((essay) => (
          <TextCard
            key={essay.slug}
            title={essay.title}
            slug={essay.slug}
            excerpt={getExcerpt(essay)}
          />
        ))}
      </main>

      <AuthorSection name={name} bio={bio} role={role} />
      <div className="py-12" />
    </div>
  );
}
