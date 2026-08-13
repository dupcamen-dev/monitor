import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const BASE = "https://topstatus.space";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();
  const { data } = await admin.from("organizations").select("slug");
  const slugs = (data ?? []).filter((o): o is { slug: string } => Boolean(o.slug));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...slugs.map((o) => ({
      url: `${BASE}/s/${o.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
