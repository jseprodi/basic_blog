import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import SnowfallAnimation from "@/components/SnowfallAnimation";
import ToastProvider from "@/components/ToastProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAServiceWorker from "@/components/PWAServiceWorker";
import ErrorBoundary from "@/components/ErrorBoundary";
import { config } from "@/config/app";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${config.site.name} - ${config.site.description}`,
    template: `%s | ${config.site.name}`
  },
  description: config.site.description,
  keywords: ["blog", "personal", "technology", "thoughts", "ideas"],
  authors: [{ name: config.site.author }],
  creator: config.site.author,
  publisher: config.site.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(config.site.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: `${config.site.name} - ${config.site.description}`,
    description: config.site.description,
    siteName: config.site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${config.site.name} - ${config.site.description}`,
    description: config.site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={config.pwa.themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={config.pwa.name} />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": config.site.name,
              "description": config.site.description,
              "url": config.site.url,
              "publisher": {
                "@type": "Person",
                "name": config.site.author
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": config.site.url
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} h-full`}>
        <ErrorBoundary>
          <Providers>
            <div className="min-h-full flex flex-col">
              <Header />
              <div className="w-full border-b border-t border-slate-300 bg-gradient-to-b from-slate-50/80 to-slate-200/60 shadow-md relative overflow-hidden" style={{ zIndex: 0, height: "400px" }}>
                <SnowfallAnimation />
              </div>
              <main className="flex-1 relative z-10">
                {children}
              </main>
              <footer className="bg-gray-900 text-white py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <p className="text-gray-400">
                      © 2025 {config.site.name}. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Built with Next.js, TypeScript, and Tailwind CSS
                    </p>
                  </div>
                </div>
              </footer>
            </div>
            
            {/* PWA Components */}
            <PWAInstallPrompt />
            <PWAServiceWorker />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
