import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider, Theme } from "@/components/theme-provider";
import { PageBackground } from "@/components/page-background";
import { getPageBackground } from "@/lib/backgrounds";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NATURE Society",
  description: "National Awareness Training And Research For Urban-Rural Environment",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // default layout background for non-specific pages
  const layoutBackground = await getPageBackground("layout");
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
          "min-h-screen bg-transparent font-sans antialiased",
          inter.variable
        )}>
        <ThemeProvider defaultTheme={(layoutBackground?.uiTheme as Theme) || "nature"} storageKey="natures-theme">
          <PageBackground config={layoutBackground} pageKey="layout" />
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
