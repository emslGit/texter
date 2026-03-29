interface QuoteProps {
  text: string;
}

export default function Quote({ text }: QuoteProps) {
  if (!text) return null;

  return (
    <p className="italic text-ink-light text-lg sm:text-xl leading-relaxed text-center">
      &ldquo;{text}&rdquo;
    </p>
  );
}
