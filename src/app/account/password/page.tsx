import Link from 'next/link';
import { changePassword } from '@/app/actions/auth';
import Flash from '@/components/Flash';
import Header from '@/components/Header';
import { requireUser } from '@/lib/auth/current-user';
import { getDict, getLang } from '@/lib/i18n';

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const user = await requireUser();
  const lang = await getLang();
  const sp = await searchParams;
  return (
    <>
      <Header user={user} lang={lang} t={getDict(lang)} current="/account/password" />
      <main className="page narrow" dir="ltr">
        <h2 className="title">Change password</h2>
        <Flash ok={sp.ok} error={sp.error} />
        <form action={changePassword} className="card form-stack">
          <label>Current password<input name="current" type="password" required autoComplete="current-password" /></label>
          <label>New password (min 8 characters)<input name="next" type="password" required minLength={8} autoComplete="new-password" /></label>
          <button className="btn-primary">Save</button>
        </form>
        <p><Link href="/review" className="backlink">← Back</Link></p>
      </main>
    </>
  );
}
