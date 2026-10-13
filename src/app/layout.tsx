import type { Metadata } from 'next';
import './globals.css';
import { getLang } from '@/lib/i18n';

export const metadata: Metadata = { title: 'Nexiz AI - Review Portal', description: 'Review the software you use' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
