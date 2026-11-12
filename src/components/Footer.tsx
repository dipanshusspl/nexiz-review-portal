import Link from 'next/link';

/** Every public page ends here (design system + client spec block 8). */
export default function Footer({ lang }: { lang: 'en' | 'ar' }) {
  const ar = lang === 'ar';
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@nexiz.ai';
  const privacy = process.env.NEXT_PUBLIC_PRIVACY_URL ?? '/privacy';
  return (
    <footer className="footer">
      <div className="inner">
        <p style={{ maxWidth: '52ch' }}>
          {ar ? 'نكسيز مستقلة عن كل مورّد نقارن بينه. لا تُباع المواضع ولا تُعدَّل نصوص التقييمات.'
            : 'Nexiz is independent of every vendor it compares. Placement is not for sale and review text is never edited.'}
        </p>
        <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/verification">{ar ? 'كيف نوثّق التقييمات' : 'How reviews are verified'}</Link>
          <a href={`mailto:${contact}`} className="lt">{contact}</a>
          <a href={privacy}>{ar ? 'الخصوصية ونظام حماية البيانات الشخصية (PDPL)' : 'Privacy and PDPL'}</a>
        </nav>
      </div>
    </footer>
  );
}
