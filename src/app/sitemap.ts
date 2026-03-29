import { getManifest } from "@/lib/essays";

const BASE = "https://ingegerdstexter.se";

export default function sitemap() {
  const essays = getManifest();
  return [
    { url: BASE, lastModified: new Date() },
    ...essays.map((e) => ({
      url: `${BASE}/${e.slug}`,
      lastModified: new Date(),
    })),
  ];
}
