import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wedding Planning MVP',
  description: 'Plan your perfect wedding with ease',
  authors: [{ name: 'Wedding Planning Team' }],
  keywords: ['wedding', 'planning', 'event management', 'budget tracking', 'guest management'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
