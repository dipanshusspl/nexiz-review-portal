import { trustFigures } from '@/lib/stats';

/** Design system: exactly three things, in this order: products covered, verified reviews, independence. Published figures only. */
export default async function TrustBar({ lang }: { lang: 'en' | 'ar' }) {
  const f = await trustFigures();
  const ar = lang === 'ar';
  return (
    <div className="trustbar" role="note">
      <span><b>{f.products}</b>{ar ? 'منتجًا' : 'products covered'}</span>
      <span><b>{f.verified}</b>{ar ? 'تقييمًا موثّقًا' : 'verified reviews'}</span>
      <span className="indep">{ar ? 'مستقلة عن كل مورّد مذكور. لا مواضع مدفوعة.' : 'Independent of every vendor listed. No paid placement.'}</span>
    </div>
  );
}
