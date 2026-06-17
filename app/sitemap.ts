import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/seo"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date("2026-06-17T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}
