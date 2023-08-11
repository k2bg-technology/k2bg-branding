import { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

import "./globals.css";

// If loading a variable font, you don't need to specify the font weight
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "K2.B.G. Technology",
  description: "K2.B.G. Technologyが提供できる価値を紹介いたします。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable}`}>
      <body>{children}</body>
    </html>
  );
}
