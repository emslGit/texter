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
        <p className="text-base text-ink-light leading-relaxed mb-6">
          {excerpt}
        </p>
      )}
      <Link
        href={`/${slug}`}
        className="font-sans font-light text-xs text-ink-muted uppercase tracking-widest hover:text-ink transition-colors"
      >
        Läs texten →
      </Link>
    </article>
  );
}
