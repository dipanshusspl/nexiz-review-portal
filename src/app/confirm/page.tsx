import { db } from '@/lib/supabase/admin';
import { confirmReview } from '@/app/actions/confirm';
import { getDict, getLang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/** Public page the respondent opens (no login, see middleware). It only SHOWS a button; verifying needs the tap. */
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string; done?: string; bad?: string }> }) {
  const { token, done, bad } = await searchParams;
  const lang = await getLang();
  const t = getDict(lang);
  let valid = false;
  if (token && /^[0-9a-f]{32}$/.test(token)) {
    const { data } = await db().from('rv_reviews').select('id').eq('confirm_token', token).eq('source', 'field').maybeSingle();
    valid = !!data;
  }
  const btn = lang === 'ar' ? 'تأكيد تقييمي' : 'Confirm my review';
  const ask = lang === 'ar' ? 'هل هذا تقييمك؟ اضغط للتأكيد.' : 'Is this your review? Tap to confirm it.';
  return (
    <main className="login-wrap">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="brand big"><span className="logo">N</span>Nexiz AI</div>
        {done ? (<><h1>{t.confirmTitle}</h1><p>{t.confirmBody}</p></>)
          : valid ? (
            <form action={confirmReview}>
              <input type="hidden" name="token" value={token} />
              <h1>{ask}</h1>
              <button className="btn-primary" style={{ marginTop: 16 }}>{btn}</button>
            </form>
          ) : (<h1>{bad || token ? t.confirmBad : t.confirmBad}</h1>)}
      </div>
    </main>
  );
}
