import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/widget/", "/api/"],
      crawlDelay: 1,
    },
    sitemap: "https://chatpulse.no/sitemap.xml",
  };
}
