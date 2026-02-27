import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multiplayer Blackjack",
  description: "Çok oyunculu modern Blackjack oyunu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
