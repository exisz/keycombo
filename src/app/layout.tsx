import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdSense from "@/components/GoogleAdSense";
import VercelAnalytics from "@/components/VercelAnalytics";

export const metadata: Metadata = {
  title: {
    default: "SITE_TITLE",
    template: "%s | SITE_TITLE",
  },
  description: "SITE_DESCRIPTION",
  openGraph: {
    title: "SITE_TITLE",
    description: "SITE_DESCRIPTION",
    url: "https://SUBDOMAIN.rollersoft.com.au",
    siteName: "SITE_TITLE",
    locale: "en_AU",
    type: "website",
  },
  alternates: {
    canonical: "https://SUBDOMAIN.rollersoft.com.au",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="DAISY_THEME">
      <head>
        <GoogleAnalytics />
        <GoogleAdSense />
      </head>
      <body className="min-h-dvh bg-base-100 flex flex-col">
        <VercelAnalytics />
        <header className="navbar bg-primary text-primary-content shadow-lg">
          <div className="container mx-auto px-4">
            <a className="text-xl font-bold" href="/">SITE_TITLE</a>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 flex-1">
          {children}
        </main>
        <footer className="footer footer-center p-6 bg-base-200 text-base-content mt-auto">
          <p>© {new Date().getFullYear()} SITE_TITLE. Data sourced from public records.</p>
        </footer>
      </body>
    </html>
  );
}
