import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientShell from "@/components/client-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mental Models Hub",
  description: "Curate, read, and listen to mental models with elegant dark UI.",
  icons: {
    icon: "/images/favicon.ico",
  },
  openGraph: {
    title: "Mental Models Hub",
    description: "Curate, read, and listen to mental models with elegant dark UI.",
    images: [
      {
        url: "/images/favicon.ico",
        width: 64,
        height: 64,
        alt: "Mental Models Hub",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          spaceGrotesk.variable,
          "min-h-screen bg-[#0c0f14] text-slate-100 antialiased",
        )}
      >
        <ClientShell>
          <div className="min-h-screen bg-[#0d1821]">
            {children}
          </div>
        </ClientShell>
      </body>
    </html>
  );
}
