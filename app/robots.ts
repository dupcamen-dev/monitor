import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/api", "/auth", "/login"],
      },
    ],
    sitemap: "https://topstatus.space/sitemap.xml",
  };
}
