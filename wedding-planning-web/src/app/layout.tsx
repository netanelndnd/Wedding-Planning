import type { Metadata } from "next";
import { Playfair_Display, Inter, Heebo } from "next/font/google";
import "./globals.css";
import AccessibilityMenu from "@/components/AccessibilityMenu";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "תכנון החתונה - Wedding Planner",
  description: "מערכת חכמה לניהול ותכנון חתונות",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${playfair.variable} ${inter.variable} ${heebo.variable} antialiased`}
      >
        {children}
        <AccessibilityMenu />
      </body>
    </html>
  );
}
