import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "PostFlow — Turn Any Idea Into a Viral Carousel",
  description:
    "AI-powered carousel and thread generator for Instagram, Twitter, and LinkedIn. 3 variations in 30 seconds.",
  metadataBase: new URL("https://postflow.app"),
  openGraph: {
    title: "PostFlow — AI Carousel Generator",
    description:
      "AI-powered carousel and thread generator for Instagram, Twitter, and LinkedIn. 3 variations in 30 seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostFlow — AI Carousel Generator",
    description:
      "Turn any idea into a viral carousel. 3 variations in 30 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${dmSerif.variable} antialiased`}
    >
      <body className="min-h-screen font-[family-name:var(--font-sans)]">
        {children}
      </body>
    </html>
  );
}
