import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ingegerds texter",
  description: "En samling texter om tro, erfarenhet och mänskliga möten av Ingegerd Slätteby.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Source+Sans+3:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-parchment text-ink font-serif antialiased leading-relaxed">
        <header className="border-b border-border/30 py-3">
          <div className="text-center">
            <span className="font-sans text-[13px] uppercase tracking-widest text-ink-muted">
              Ingegerd Slätteby
            </span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
