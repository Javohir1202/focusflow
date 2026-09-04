import type { Metadata } from "next";
import "./globals.css";
import { APP_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/config";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { getLocale } from "@/lib/i18n/locale";

// Runs before hydration so the correct theme class is set on <html> with no
// flash of the wrong theme. Keep the storage key ("theme") and resolution
// logic in sync with components/theme/ThemeProvider.tsx.
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var isDark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${SITE_NAME} — CRM for service businesses`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "service business CRM",
    "lead pipeline",
    "job tracking",
    "appointment scheduling",
    "customer management",
    "small business software",
  ],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — CRM for service businesses`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — CRM for service businesses`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider initialLocale={locale}>
            <OrganizationJsonLd />
            <WebsiteJsonLd />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
