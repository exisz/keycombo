import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdSense from "@/components/GoogleAdSense";
import VercelAnalytics from "@/components/VercelAnalytics";

export const metadata: Metadata = {
  title: {
    default: "KeyCombo — Keyboard Shortcut Encyclopedia",
    template: "%s | KeyCombo",
  },
  description:
    "The ultimate keyboard shortcut cheat sheet library. Browse shortcuts for 85+ apps including VS Code, Photoshop, Excel, Figma, and more.",
  openGraph: {
    title: "KeyCombo — Keyboard Shortcut Encyclopedia",
    description:
      "The ultimate keyboard shortcut cheat sheet library for 85+ apps.",
    url: "https://keycombo.starmap.quest",
    siteName: "KeyCombo",
    locale: "en_AU",
    type: "website",
  },
  alternates: {
    canonical: "https://keycombo.starmap.quest",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="night">
      <head>
        <GoogleAnalytics />
        <GoogleAdSense />
      </head>
      <body className="min-h-dvh bg-base-100 flex flex-col">
        <VercelAnalytics />
        <header className="navbar bg-base-200 border-b border-base-300">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <a className="text-xl font-bold flex items-center gap-2" href="/">
              <span className="text-2xl">⌨️</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                KeyCombo
              </span>
            </a>
            <nav className="hidden sm:flex gap-4 text-sm">
              <a href="/" className="link link-hover">
                Home
              </a>
              <a href="/apps" className="link link-hover">
                All Apps
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="footer footer-center p-6 bg-base-200 text-base-content mt-auto border-t border-base-300">
          <p>
            © {new Date().getFullYear()} KeyCombo. A{" "}
            <a
              href="https://rollersoft.com.au"
              className="link link-primary"
              target="_blank"
              rel="noopener"
            >
              Rollersoft
            </a>{" "}
            project.
          </p>
        </footer>
      </body>
    </html>
  );
}
