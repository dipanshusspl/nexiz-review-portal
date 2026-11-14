import ExpertBar from '@/components/ExpertBar';
import { can, getCurrentUser } from '@/lib/auth/current-user';
import { redirect } from 'next/navigation';

/**
 * The expert screen is open to everyone: a visitor can answer step 1 and sign in afterwards.
 * It is rendered in a frame under our top bar. OAuth sends the whole window (target _top) to Google / LinkedIn.
 */
export default async function ExpertPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user && !can(user, 'expert.panel')) redirect('/review');
  const sp = await searchParams;
  return (
    <>
      <ExpertBar user={user} />
      <iframe src={sp.error ? '/expert/frame?signin=failed' : '/expert/frame'} title="Expert review" className="expert-frame" />
    </>
  );
}
