import type { Metadata } from "next";
import "@fontsource/press-start-2p";
import "./globals.css";

// OVERRIDE per game
export const metadata: Metadata = {
  title: "Hallucination Hunter — Don't Trust. Verify.",
  description: "Learn to detect AI hallucinations through gameplay — by DareDev256",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-game-black antialiased">
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
