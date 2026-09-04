import type { Metadata } from "next";
import "./globals.css";
import { APP_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/config";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${SITE_NAME} — AI Productivity Dashboard`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "productivity app",
    "AI task breakdown",
    "AI daily planner",
    "project management",
    "focus app",
    "task management",
  ],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI Productivity Dashboard`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AI Productivity Dashboard`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        {children}
      </body>
    </html>
  );
}
