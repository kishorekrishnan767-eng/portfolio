import type { Metadata, Viewport } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import { site } from "@/data/content";
import { siteUrl } from "@/lib/site";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  authors: [{ name: site.name }],
  keywords: ["Kishore Krishnan", "portfolio", "full stack", "IoT", "machine learning", "embedded systems", "SRM"],
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: siteUrl,
    siteName: site.name,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#04070d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Repeat visit in this tab: hide the preloader before first paint (Preloader.tsx skips it too). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("signal:booted")==="1")document.documentElement.dataset.booted=""}catch(e){}`,
          }}
        />
      </head>
      <body>
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
