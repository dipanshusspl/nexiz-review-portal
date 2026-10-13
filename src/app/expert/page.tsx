import ExpertBar from '@/components/ExpertBar';
import { requirePermission } from '@/lib/auth/current-user';

/** Landing screen for the "expert" role: the client's portfolio screen, shown under our top bar. */
export default async function ExpertPage() {
  const user = await requirePermission('expert.panel');
  return (
    <>
      <ExpertBar user={user} />
      <iframe src="/expert/frame" title="Expert portfolio" className="expert-frame" />
    </>
  );
}
