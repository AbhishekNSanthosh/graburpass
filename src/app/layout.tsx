import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// Initialize DM Sans
const DMSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ticko",
  description: "Ticketing platform powered by Ticko",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${DMSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
