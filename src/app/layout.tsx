import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import ToastProvider from "@/components/ToastProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAServiceWorker from "@/components/PWAServiceWorker";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "My Blog - Thoughts, Ideas, and Stories",
    template: "%s | My Blog"
  },
  description: "A personal blog sharing thoughts, ideas, and stories about technology, life, and everything in between.",
  keywords: ["blog", "personal", "technology", "thoughts", "ideas"],
  authors: [{ name: "Blog Author" }],
  creator: "Blog Author",
  publisher: "Blog Author",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "My Blog - Thoughts, Ideas, and Stories",
    description: "A personal blog sharing thoughts, ideas, and stories about technology, life, and everything in between.",
    siteName: "My Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Blog - Thoughts, Ideas, and Stories",
    description: "A personal blog sharing thoughts, ideas, and stories about technology, life, and everything in between.",
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
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="My Blog" />
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
              "name": "My Blog",
              "description": "A personal blog sharing thoughts, ideas, and stories about technology, life, and everything in between.",
              "url": process.env.NEXTAUTH_URL || "http://localhost:3000",
              "publisher": {
                "@type": "Person",
                "name": "Blog Author"
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": process.env.NEXTAUTH_URL || "http://localhost:3000"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} h-full`}>
        <ErrorBoundary>
          <Providers>
            <ToastProvider>
              <div className="min-h-full flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <footer className="bg-gray-900 text-white py-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                      <p className="text-gray-400">
                        © {new Date().getFullYear()} My Blog. All rights reserved.
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
            </ToastProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
