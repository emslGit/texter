interface QuoteProps {
  text: string;
  author?: string;
}

export default function Quote({ text, author }: QuoteProps) {
  if (!text) return null;

  return (
    <blockquote className="text-center">
      <p className="type-quote">&ldquo;{text}&rdquo;</p>
      {author && (
        <cite className="type-quote-author">&mdash; {author}</cite>
      )}
    </blockquote>
  );
}
