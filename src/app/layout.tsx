import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

/* ─────────────────────────────────────────
   FONTS
   ───────────────────────────────────────── */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",          // prevent FOIT
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,           // mono only needed lazily
});

/* ─────────────────────────────────────────
   VIEWPORT (separate export — Next 14+)
   ───────────────────────────────────────── */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,          // allow user zoom (accessibility)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#07091a" },
  ],
  colorScheme: "light dark",
};

/* ─────────────────────────────────────────
   METADATA
   ───────────────────────────────────────── */
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://nuvix.ai";
const APP_NAME = "Nuvix";

export const metadata: Metadata = {
  /* ── Core ── */
  metadataBase: new URL(APP_URL),
  title: {
    default: "Nuvix — AI-Powered Smart Co-Shopping Hub",
    template: "%s | Nuvix",
  },
  description:
    "Shop smarter with Nuvix's AI co-shopper. Discover the best deals, personalised recommendations, and real-time price intelligence — all in one place.",
  keywords: [
    "AI shopping assistant",
    "smart ecommerce",
    "co-shopping",
    "product recommendations",
    "Nuvix",
    "AI commerce",
    "price comparison",
    "online shopping India",
  ],
  authors: [{ name: "Nuvix Team", url: APP_URL }],
  creator: "Nuvix",
  publisher: "Nuvix Technologies Pvt. Ltd.",
  category: "shopping",

  /* ── Canonical & robots ── */
  alternates: { canonical: "/" },
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

  /* ── Open Graph ── */
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: APP_NAME,
    title: "Nuvix — AI-Powered Smart Co-Shopping Hub",
    description:
      "Next-generation intelligent conversational e-commerce & shopping assistant platform. Shop smarter, not harder.",
    images: [
      {
        url: "/og-image.png",          // 1200×630 — add to /public
        width: 1200,
        height: 630,
        alt: "Nuvix AI Commerce Platform",
        type: "image/png",
      },
    ],
  },

  /* ── Twitter / X Card ── */
  twitter: {
    card: "summary_large_image",
    title: "Nuvix — AI-Powered Smart Co-Shopping Hub",
    description:
      "Shop smarter with Nuvix's AI co-shopper. Personalised deals, real-time price intelligence.",
    images: ["/og-image.png"],
    creator: "@nuvixai",
    site: "@nuvixai",
  },

  /* ── App / PWA ── */
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,     // stop iOS auto-linking numbers
    date: false,
    email: false,
    address: false,
    url: false,
  },

  /* ── Icons ── */
  icons: {
    icon: [
      { url: "/favicon-16x16.png",  sizes: "16x16",  type: "image/png" },
      { url: "/favicon-32x32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/favicon-96x96.png",  sizes: "96x96",  type: "image/png" },
      { url: "/favicon.ico",        sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#4f46e5" },
    ],
  },

  /* ── Manifest ── */
  manifest: "/manifest.json",

  /* ── Verification (add your tokens) ── */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    // yandex: "",
    // bing: "",
  },
};

/* ─────────────────────────────────────────
   LAYOUT
   ───────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning   /* needed for theme class toggling */
    >
      <head>
        {/* ── Preconnect to external origins ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── DNS-prefetch for API / CDN endpoints ── */}
        <link rel="dns-prefetch" href="//api.nuvix.ai" />
        <link rel="dns-prefetch" href="//images.nuvix.ai" />

        {/*
          Inline theme script — runs BEFORE first paint.
          Prevents white flash on dark mode; keeps class in sync with localStorage.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var t = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var dark = t === 'dark' || (!t && prefersDark);
                  if (dark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (_) {}
              })();
            `,
          }}
        />

        {/* ── Structured data (JSON-LD) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: APP_NAME,
              url: APP_URL,
              description:
                "AI-powered smart co-shopping platform with personalised recommendations and real-time price intelligence.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${APP_URL}/shop?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "Nuvix Technologies Pvt. Ltd.",
                url: APP_URL,
                logo: {
                  "@type": "ImageObject",
                  url: `${APP_URL}/logo.png`,
                  width: 200,
                  height: 200,
                },
              },
            }),
          }}
        />
      </head>

      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          min-h-screen
          flex flex-col
          bg-background text-foreground
          overflow-x-hidden
          selection:bg-indigo-500/15 selection:text-foreground
        `}
      >
        {/* Skip-to-content — keyboard / screen-reader accessibility */}
        <a
          href="#main-content"
          className="
            sr-only focus:not-sr-only
            focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
            focus:px-4 focus:py-2
            focus:rounded-xl focus:shadow-lg
            focus:bg-indigo-600 focus:text-white
            focus:text-sm focus:font-bold focus:tracking-wide
            focus:outline-none focus:ring-2 focus:ring-white/50
            transition-all duration-200
          "
        >
          Skip to main content
        </a>

        {/* ── Layout shell ── */}
        <Header />

        <main
          id="main-content"
          className="flex-1 w-full"
          role="main"
          tabIndex={-1}          /* programmatic focus target for skip link */
        >
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}