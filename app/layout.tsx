import type { Metadata, Viewport } from "next"
import { Geist, JetBrains_Mono } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { SiteShell } from "@/components/site-shell"
import {
  availableDomains,
  licenseUrl,
  originalContentUrl,
  publisherUrl,
  shortSiteName,
  siteDescription,
  siteKeywords,
  siteName,
  siteUrl,
  sourceCodeUrl,
} from "@/lib/seo"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const socialImage = {
  url: "/web.jpg",
  width: 1919,
  height: 1079,
  alt: "Screenshot of the THC Tips, Tricks & Hacks Cheat Sheet web interface.",
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${shortSiteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: "extencil", url: publisherUrl }],
  creator: "extencil@segfault.net",
  publisher: "Haltman-IO",
  generator: "Next.js",
  keywords: siteKeywords,
  referrer: "strict-origin-when-cross-origin",
  category: "technology",
  classification: "Cybersecurity reference",
  alternates: {
    canonical: "/",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en_US",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [socialImage],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: shortSiteName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#11151a",
    license: licenseUrl,
    source: sourceCodeUrl,
    "original-source": originalContentUrl,
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#11151a" },
  ],
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  alternateName: shortSiteName,
  url: `${siteUrl}/`,
  description: siteDescription,
  inLanguage: "en",
  license: licenseUrl,
  isBasedOn: originalContentUrl,
  codeRepository: sourceCodeUrl,
  sameAs: availableDomains,
  creator: {
    "@type": "Person",
    name: "extencil",
    email: "extencil@segfault.net",
  },
  publisher: {
    "@type": "Organization",
    name: "Haltman-IO",
    url: publisherUrl,
  },
}

const themeBootstrapScript = `
(() => {
  try {
    const storageKey = "theme";
    const storedTheme = localStorage.getItem(storageKey);
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : systemTheme;
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
  } catch {
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "scroll-smooth font-sans antialiased",
        fontSans.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="relative min-h-screen">
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div
          className="surface-dots pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
