import { redirect } from 'next/navigation';
import { getCurrentUser, homePath } from '@/lib/auth/current-user';

export default async function Home() {
  redirect(homePath(await getCurrentUser()));
}