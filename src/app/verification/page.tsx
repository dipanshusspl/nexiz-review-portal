import Footer from '@/components/Footer';
import PublicHeader from '@/components/PublicHeader';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/** Plain statement of the verification rules the product actually enforces. Update this page whenever a rule changes. */
export default async function Verification() {
  const lang = await getLang();
  const user = await getCurrentUser();
  const ar = lang === 'ar';
  const rules = ar ? [
    'تقييمات المستخدمين تُنشر تلقائيًا بعد التحقق من الحساب، وتُرفض آليًا إن كانت مكررة أو أقصر من 20 حرفًا.',
    'تقييمات الخبراء يقرؤها شخص من فريق نكسيز قبل النشر، والشارة «خبير موثّق» لا تظهر قبل ذلك.',
    'التقييمات التي تُجمع ميدانيًا لا تظهر كـ«موثّقة» إلا بعد أن يفتح صاحبها رابط التأكيد.',
    'نرسل إلى مراجعة بشرية كل تقييم اعترض عليه مورّد، وكل تقييم تكون جميع درجاته 1 أو جميعها 5، وكل حساب يرسل ثلاثة تقييمات أو أكثر خلال ساعة.',
    'لا يعدّل المراجع نص أي تقييم. عند الرفض يُسجَّل السبب من قائمة ثابتة ويُرسل إلى صاحب التقييم.',
    'لا تُنشر أسماء المراجعين ولا بريدهم ولا هواتفهم ولا جهات عملهم، سواء كان التقييم مجهولًا أم لا. يظهر الدور وحجم الشركة والشارة دائمًا.',
  ] : [
    'User reviews publish automatically once the account is verified, and are rejected automatically if they are a duplicate or either text box is under 20 characters.',
    'Expert reviews are read by a person at Nexiz before publishing. The Verified expert badge never appears before that.',
    'Field-collected reviews are shown as Verified only after the reviewer opens their confirmation link.',
    'A person reads any review a vendor has disputed, any review where every rating is 1 or every rating is 5, and any account that submits three or more reviews within an hour.',
    'Nexiz never edits the text of a review. A rejection records a reason from a fixed list and the reason is sent to the author.',
    'Reviewer names, emails, phone numbers and employers are never published, anonymous or not. Role, company size and the verification badge always are.',
  ];
  return (
    <>
      <PublicHeader lang={lang} current="/verification" loggedIn={!!user} t={ar ? { login: 'تسجيل الدخول', reviewIt: 'قيّم برنامجًا' } : { login: 'Log in', reviewIt: 'Review software' }} />
      <main className="page narrow" style={{ maxWidth: 720 }}>
        <h1 className="title">{ar ? 'كيف نوثّق التقييمات' : 'How reviews are verified'}</h1>
        <ul style={{ paddingInlineStart: 20, marginTop: 16, lineHeight: 1.9 }}>{rules.map((r) => <li key={r}>{r}</li>)}</ul>
      </main>
      <Footer lang={lang} />
    </>
  );
}
