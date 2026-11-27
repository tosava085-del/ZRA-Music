import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZRA — Spatial Music',
  description:
    'iOS 27 Liquid Glass YouTube Music web client powered by ytmusic-api and Sonara recommendation & queue engine.',
  openGraph: {
    title: 'ZRA — Spatial Music',
    description:
      'iOS 27 Liquid Glass YouTube Music web client powered by ytmusic-api and Sonara recommendation & queue engine.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZRA — Spatial Music',
    description:
      'iOS 27 Liquid Glass YouTube Music web client powered by ytmusic-api and Sonara recommendation & queue engine.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-[var(--m3-bg)] text-[#1A1C20] dark:text-[#E6E8EE] selection:bg-[var(--m3-primary-soft)] selection:text-[var(--m3-primary)] transition-colors duration-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
