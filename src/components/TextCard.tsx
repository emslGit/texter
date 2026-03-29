import Link from "next/link";

interface TextCardProps {
  title: string;
  slug: string;
  excerpt: string;
}

export default function TextCard({ title, slug, excerpt }: TextCardProps) {
  return (
    <article className="py-14 sm:py-20 border-t border-border-light">
      <Link href={`/${slug}`} className="group block">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink mb-4 group-hover:text-ink-light transition-colors">
          {title}
        </h2>
      </Link>
      {excerpt && (
        <p className="text-lg sm:text-xl text-ink-light leading-relaxed mb-6">
          {excerpt}
        </p>
      )}
      <Link
        href={`/${slug}`}
        className="inline-block font-sans font-medium text-sm text-ink uppercase tracking-widest hover:text-ink-light transition-colors border-b border-ink/30 pb-0.5"
      >
        Läs hela →
      </Link>
    </article>
  );
}
