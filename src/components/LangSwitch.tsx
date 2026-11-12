import { setLanguage } from '@/app/actions/auth';
import type { Lang } from '@/lib/i18n';

/** EN / العربية toggle for pages without a header. `to` = the path to come back to. */
export default function LangSwitch({ lang, to }: { lang: Lang; to: string }) {
  return (
    <form action={setLanguage} className="langs" style={{ alignSelf: 'center' }}>
      <input type="hidden" name="to" value={to} />
      <button name="lang" value="en" className={lang === 'en' ? 'on' : ''}>EN</button>
      <button name="lang" value="ar" className={lang === 'ar' ? 'on' : ''}>العربية</button>
    </form>
  );
}
