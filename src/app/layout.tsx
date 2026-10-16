import type { Metadata } from 'next';
import './globals.css';
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { getLang } from '@/lib/i18n';

const plexAr = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['400', '600', '700'], variable: '--font-plex-ar', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-plex-mono', display: 'swap' });

export const metadata: Metadata = { title: 'Nexiz AI - Review Portal', description: 'Review the software you use' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${plexAr.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
