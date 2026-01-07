import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stayscan.in";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/dashboard/*",
                    "/guest/*",
                    "/api/*",
                    "/_next/*",
                    "/login",
                    "/forgot-password",
                    "/reset-password",
                    "/(auth)/*"
                ]
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: [
                    "/dashboard/*",
                    "/guest/*",
                    "/api/*",
                    "/login",
                    "/forgot-password",
                    "/reset-password",
                    "/(auth)/*"
                ]
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`
    };
}
