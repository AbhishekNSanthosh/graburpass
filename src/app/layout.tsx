import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const DMSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://graburpass.com"),

  title: {
    default: "GraburPass – Digital Event Ticketing & Pass Management Platform",
    template: "%s | GraburPass",
  },

  description:
    "GraburPass is a digital event ticketing and pass management platform operated by Beond Innovations. Create events, manage ticket sales, issue QR-based passes, and track attendance with ease.",

  keywords: [
    "GraburPass",
    "event ticketing platform",
    "digital ticketing India",
    "QR ticketing system",
    "event pass management",
    "college fest ticketing",
    "event entry QR scan",
    "event management software",
    "ticketing SaaS India",
  ],

  authors: [{ name: "GraburPass" }],
  creator: "GraburPass",
  publisher: "GraburPass",

  alternates: {
    canonical: "https://graburpass.com",
  },

  openGraph: {
    title: "GraburPass – Digital Event Ticketing Platform",
    description:
      "A modern ticketing and event pass management platform for colleges, communities, and organizers. Sell tickets, generate QR passes, and manage entries efficiently.",
    url: "https://graburpass.com",
    siteName: "GraburPass",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GraburPass – Digital Event Ticketing Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "GraburPass – Digital Event Ticketing Platform",
    description:
      "Create events, sell tickets, generate QR passes, and manage event entries — all in one platform.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  robots: {
    index: true,
    follow: true,
  },
};

import { ThemeProvider } from "./providers";

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${DMSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
