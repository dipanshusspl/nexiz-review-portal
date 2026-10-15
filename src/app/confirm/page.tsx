import { db } from '@/lib/supabase/admin';
import { getDict, getLang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/** P7: public one-tap page the respondent opens. Opening it flips the field review to Verified. No login needed (see middleware matcher). */
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const t = getDict(await getLang());
  let ok = false;
  if (token && /^[0-9a-f]{32}$/.test(token)) {
    const { data } = await db().from('rv_reviews')
      .update({ verified: true, verified_at: new Date().toISOString(), confirm_token: null })
      .eq('confirm_token', token).eq('source', 'field').select('id');
    ok = (data?.length ?? 0) > 0;
  }
  return (
    <main className="login-wrap">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="brand big"><span className="logo">N</span>Nexiz AI</div>
        <h1>{ok ? t.confirmTitle : t.confirmBad}</h1>
        {ok && <p>{t.confirmBody}</p>}
      </div>
    </main>
  );
}
