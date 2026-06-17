import { Geist, JetBrains_Mono } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { SiteShell } from "@/components/site-shell"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
        <div
          className="surface-dots pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
