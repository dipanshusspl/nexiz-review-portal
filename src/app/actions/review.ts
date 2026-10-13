'use server';

import { db } from '@/lib/supabase/admin';
import { can, requireUser } from '@/lib/auth/current-user';
import { DURATIONS } from '@/lib/i18n';
import { redirect } from 'next/navigation';
import { str } from '@/lib/form';

export async function submitReview(fd: FormData) {
  const me = await requireUser();
  const category = str(fd, 'category', 100);
  const software = str(fd, 'software', 100);
  const base = `/review?category=${encodeURIComponent(category)}&software=${encodeURIComponent(software)}`;
  if (!can(me, 'reviews.write')) redirect('/review?error=forbidden');

  const rating = Number(fd.get('rating'));
  const duration = str(fd, 'duration', 20);
  const comment = str(fd, 'comment', 1000) || null;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !(DURATIONS as readonly string[]).includes(duration)) {
    redirect(`${base}&error=invalid`);
  }
  const { data: sw } = await db().from('rv_software').select('id').eq('slug', software).maybeSingle();
  if (!sw) redirect('/review?error=notfound');

  const { error } = await db().from('rv_reviews').upsert(
    { software_id: sw.id, user_id: me.id, rating, duration, comment, updated_at: new Date().toISOString() },
    { onConflict: 'software_id,user_id' },
  );
  if (error) redirect(`${base}&error=failed`);
  redirect(`${base}&ok=saved`);
}
