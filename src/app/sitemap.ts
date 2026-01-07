import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stayscan.in";

    const routes = [
        "",
        "/pricing",
        "/privacy",
        "/terms",
        "/contact",
        "/register"
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : ("weekly" as const),
        priority: route === "" ? 1 : 0.8
    }));
}
