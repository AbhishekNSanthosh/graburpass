import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const DMSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ticko.in"),
  title: {
    default: "Ticko – Smart Event Ticketing Platform",
    template: "%s | Ticko",
  },
  description:
    "Ticko is a modern event ticketing and pass management platform for colleges, communities, and events. Create, manage, and scan tickets effortlessly.",
  keywords: [
    "Ticko",
    "event ticketing",
    "ticket platform",
    "college fests",
    "event passes",
    "qr ticketing",
    "scan tickets",
    "event management",
    "India",
  ],
  authors: [{ name: "Ticko" }],
  creator: "Ticko",
  publisher: "Ticko",

  alternates: {
    canonical: "https://ticko.in",
  },

  openGraph: {
    title: "Ticko – Smart Event Ticketing Platform",
    description:
      "Sell tickets, manage events, generate passes, and scan QR codes — all in one seamless system.",
    url: "https://ticko.in",
    siteName: "Ticko",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ticko – Smart Ticketing Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Ticko – Smart Event Ticketing Platform",
    description:
      "Sell tickets, manage events, generate passes, and scan QR codes — all in one seamless system.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${DMSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
